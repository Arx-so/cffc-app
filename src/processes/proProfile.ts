import { supabase } from "@/config/supabase";
import { getSignedUrl } from "@/utils/supabaseStorage";
import type {
  ProfessionalCredentialFields,
  ProIssuedValidationRow,
  ProProfileScreenData,
  ProfessionalDocumentSummary,
} from "./types/profileTypes";

const MEDIA_BUCKET = "media";

/** Bucket privado para documentos do profissional (RLS: role `pro`). Não usar `media` — insert lá é só para atletas. */
const PROFESSIONAL_VERIFIER_STORAGE_BUCKET = "professional-documents";

/** Limite de upload do documento verificador (PDF ou imagem). */
export const MAX_PROFESSIONAL_VERIFIER_DOCUMENT_BYTES = 15 * 1024 * 1024;

export type ProfessionalVerifierFilePick = {
  uri: string;
  name: string;
  mimeType?: string | null;
  size?: number | null;
};

const extensionFromPick = (pick: ProfessionalVerifierFilePick): string => {
  const mime = pick.mimeType?.toLowerCase() ?? "";
  if (mime === "application/pdf") return "pdf";
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  if (mime === "image/png") return "png";
  const match = /\.([a-z0-9]+)$/i.exec(pick.name.trim());
  if (match) {
    const ext = match[1].toLowerCase();
    if (["pdf", "jpg", "jpeg", "png"].includes(ext)) return ext === "jpeg" ? "jpg" : ext;
  }
  return "pdf";
};

const contentTypeForPick = (pick: ProfessionalVerifierFilePick): string => {
  const mime = pick.mimeType?.trim();
  if (mime && mime.length > 0) return mime;
  const ext = extensionFromPick(pick);
  if (ext === "pdf") return "application/pdf";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  return "application/octet-stream";
};

const isAllowedVerifierPick = (pick: ProfessionalVerifierFilePick): boolean => {
  const mime = pick.mimeType?.toLowerCase() ?? "";
  if (
    mime === "application/pdf" ||
    mime === "image/jpeg" ||
    mime === "image/jpg" ||
    mime === "image/png"
  ) {
    return true;
  }
  if (!mime) {
    return /\.(pdf|jpe?g|png)$/i.test(pick.name.trim());
  }
  return false;
};

const professionalDocumentRowType = (
  pick: ProfessionalVerifierFilePick
): "document" | "image" => {
  const mime = pick.mimeType?.toLowerCase() ?? "";
  if (mime.startsWith("image/")) return "image";
  const ext = extensionFromPick(pick);
  return ext === "jpg" || ext === "jpeg" || ext === "png" ? "image" : "document";
};

/**
 * Envia arquivo para Storage (`media`) e registra linha em `professional_document` (status pending).
 * Políticas RLS: insert permitido para `profile_id = auth.uid()`.
 */
export const uploadProfessionalVerifierDocument = async (
  userId: string,
  pick: ProfessionalVerifierFilePick
): Promise<void> => {
  if (!pick.uri?.trim()) throw new Error("missing_file");

  if (
    pick.size != null &&
    pick.size > MAX_PROFESSIONAL_VERIFIER_DOCUMENT_BYTES
  ) {
    throw new Error("too_large");
  }

  if (!isAllowedVerifierPick(pick)) {
    throw new Error("invalid_type");
  }

  const ext = extensionFromPick(pick);
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const storagePath = `professional_document/${userId}/${stamp}.${ext}`;
  const contentType = contentTypeForPick(pick);

  const response = await fetch(pick.uri);
  const blob = await response.blob();
  const arrayBuffer = await new Response(blob).arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(PROFESSIONAL_VERIFIER_STORAGE_BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const docType = professionalDocumentRowType(pick);

  const { error: insertError } = await supabase.from("professional_document").insert({
    profile_id: userId,
    type: docType,
    url: storagePath,
    status: "pending",
  });

  if (insertError) {
    await supabase.storage
      .from(PROFESSIONAL_VERIFIER_STORAGE_BUCKET)
      .remove([storagePath]);
    throw insertError;
  }
};

const parseReputationScore = (raw: unknown): number | null => {
  if (raw === null || raw === undefined) return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  // Postgres numeric pode vir como string; valores inválidos viram NaN.
  if (!Number.isFinite(n)) return null;
  return n;
};

const filenameFromStoragePath = (path: string | null): string => {
  if (!path) return "";
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? path;
};

export const upsertProfessionalCredentials = async (
  userId: string,
  payload: ProfessionalCredentialFields
): Promise<void> => {
  const row = {
    specialty: payload.specialty?.trim() || null,
    registration_number: payload.registration_number?.trim() || null,
    institution: payload.institution?.trim() || null,
  };

  // `upsert` no PostgREST pode zerar colunas omitidas (ex.: reputation_score).
  // Atualizamos só credenciais; INSERT só se a linha ainda não existir.
  const { data: updated, error: updateError } = await supabase
    .from("professional_profile")
    .update(row)
    .eq("user_id", userId)
    .select("user_id")
    .maybeSingle();

  if (updateError) throw updateError;

  if (updated) return;

  const { error: insertError } = await supabase.from("professional_profile").insert({
    user_id: userId,
    ...row,
  });

  if (insertError) throw insertError;
};

export const fetchProProfileScreenData = async (
  userId: string
): Promise<ProProfileScreenData> => {
  const [
    profileResult,
    professionalResult,
    validationCountResult,
    approvedDocResult,
    latestDocResult,
    validationsResult,
  ] = await Promise.all([
    supabase
      .from("profile")
      .select("id, name, username, avatar_url, verified, created_at")
      .eq("id", userId)
      .single(),
    supabase
      .from("professional_profile")
      .select("specialty, registration_number, institution, reputation_score")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("validation")
      .select("id", { count: "exact", head: true })
      .eq("professional_user_id", userId)
      .eq("status", "approved"),
    supabase
      .from("professional_document")
      .select("id, url, status, created_at")
      .eq("profile_id", userId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("professional_document")
      .select("id, url, status, created_at")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("validation")
      .select("id, status, created_at, athlete_user_id")
      .eq("professional_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (profileResult.error) throw profileResult.error;
  const profile = profileResult.data;
  if (!profile) throw new Error("Profile not found");

  if (professionalResult.error) throw professionalResult.error;
  if (approvedDocResult.error) throw approvedDocResult.error;
  if (latestDocResult.error) throw latestDocResult.error;
  if (validationsResult.error) throw validationsResult.error;

  /** Documento efetivo: último aprovado (se existir); senão o mais recente (pending/rejected). */
  const docRow =
    approvedDocResult.data ??
    latestDocResult.data ??
    null;

  const profRow = professionalResult.data;

  const credentials: ProfessionalCredentialFields = {
    specialty: profRow?.specialty ?? null,
    registration_number: profRow?.registration_number ?? null,
    institution: profRow?.institution ?? null,
  };

  const reputationScore = parseReputationScore(profRow?.reputation_score);

  const memberSinceYear = profile.created_at
    ? new Date(profile.created_at).getFullYear()
    : new Date().getFullYear();

  let document: ProfessionalDocumentSummary | null = null;
  let documentSignedUrl: string | null = null;

  if (docRow) {
    const row = docRow;
    document = {
      id: row.id,
      storagePath: row.url,
      status: row.status as ProfessionalDocumentSummary["status"],
      created_at: row.created_at,
    };
    if (row.url) {
      documentSignedUrl = await getSignedUrl(
        PROFESSIONAL_VERIFIER_STORAGE_BUCKET,
        row.url
      );
      // Caminhos antigos podem estar no bucket `media` (antes da política por papel).
      if (!documentSignedUrl) {
        documentSignedUrl = await getSignedUrl(MEDIA_BUCKET, row.url);
      }
    }
  }

  const validationRows = validationsResult.data ?? [];
  const athleteIds = [...new Set(validationRows.map((v) => v.athlete_user_id))];

  let namesMap = new Map<string, string>();
  if (athleteIds.length > 0) {
    const { data: nameRows, error: namesError } = await supabase
      .from("profile")
      .select("id, name")
      .in("id", athleteIds);

    if (namesError) throw namesError;
    namesMap = new Map((nameRows ?? []).map((r) => [r.id, r.name ?? ""]));
  }

  const recentValidations: ProIssuedValidationRow[] = validationRows.map((v) => ({
    id: v.id,
    status: v.status as ProIssuedValidationRow["status"],
    created_at: v.created_at,
    athleteName: namesMap.get(v.athlete_user_id) ?? "",
  }));

  const avatarUrl = await getSignedUrl(MEDIA_BUCKET, profile.avatar_url);

  return {
    id: profile.id,
    name: profile.name ?? "",
    username: profile.username,
    avatarUrl,
    verified: profile.verified ?? false,
    memberSinceYear,
    issuedValidationCount: validationCountResult.count ?? 0,
    reputationScore: reputationScore ?? null,
    credentials,
    document,
    documentSignedUrl,
    recentValidations,
  };
};

export const documentDisplayName = (
  doc: ProfessionalDocumentSummary | null,
  fallback: string
): string => {
  if (!doc?.storagePath) return fallback;
  const name = filenameFromStoragePath(doc.storagePath);
  return name || fallback;
};
