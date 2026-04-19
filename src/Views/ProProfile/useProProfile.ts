import {
  fetchProProfileScreenData,
  MAX_PROFESSIONAL_VERIFIER_DOCUMENT_BYTES,
  uploadProfessionalVerifierDocument,
  upsertProfessionalCredentials,
} from "@/processes/proProfile";
import type { ProfessionalCredentialFields } from "@/processes/types/profileTypes";
import { useAuthStore } from "@/stores/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

const STALE = 5 * 60 * 1000;
const GC = 15 * 60 * 1000;

export const useProProfile = () => {
  const currentUser = useAuthStore((state) => state.user);
  const userId = currentUser?.id ?? "";
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [specialty, setSpecialty] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [institution, setInstitution] = useState("");

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["proProfile", userId],
    queryFn: () => fetchProProfileScreenData(userId),
    enabled: !!userId,
    staleTime: STALE,
    gcTime: GC,
  });

  useEffect(() => {
    if (!data) return;
    setSpecialty(data.credentials.specialty ?? "");
    setRegistrationNumber(data.credentials.registration_number ?? "");
    setInstitution(data.credentials.institution ?? "");
  }, [data]);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      void queryClient.invalidateQueries({ queryKey: ["proProfile", userId] });
    }, [queryClient, userId])
  );

  const saveMutation = useMutation({
    mutationFn: async (payload: ProfessionalCredentialFields) => {
      await upsertProfessionalCredentials(userId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["proProfile", userId] });
      Toast.show({
        type: "success",
        text1: t("proProfile.credentialsSaved"),
      });
    },
    onError: () => {
      Toast.show({
        type: "error",
        text1: t("proProfile.credentialsSaveError"),
      });
    },
  });

  const resetCredentialsDraft = useCallback(() => {
    if (!data) return;
    setSpecialty(data.credentials.specialty ?? "");
    setRegistrationNumber(data.credentials.registration_number ?? "");
    setInstitution(data.credentials.institution ?? "");
  }, [data]);

  const handleSaveCredentials = useCallback(async () => {
    if (!userId) return;
    await saveMutation.mutateAsync({
      specialty: specialty.trim() || null,
      registration_number: registrationNumber.trim() || null,
      institution: institution.trim() || null,
    });
  }, [userId, specialty, registrationNumber, institution, saveMutation]);

  const handleEditProfilePress = useCallback(() => {
    router.push("/edit-profile");
  }, []);

  const uploadVerifierMutation = useMutation({
    mutationFn: (pick: Parameters<typeof uploadProfessionalVerifierDocument>[1]) =>
      uploadProfessionalVerifierDocument(userId, pick),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["proProfile", userId] });
      Toast.show({
        type: "success",
        text1: t("proProfile.documentUploadSuccess"),
      });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "too_large") {
        Toast.show({
          type: "error",
          text1: t("proProfile.documentTooLarge"),
        });
        return;
      }
      if (msg === "invalid_type") {
        Toast.show({
          type: "error",
          text1: t("proProfile.invalidDocumentType"),
        });
        return;
      }
      Toast.show({
        type: "error",
        text1: t("proProfile.documentUploadError"),
      });
    },
  });

  const handlePickVerifierDocument = useCallback(async () => {
    if (!userId) return;
    if (data?.document?.status === "approved") return;

    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/jpeg", "image/png"],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    if (
      asset.size != null &&
      asset.size > MAX_PROFESSIONAL_VERIFIER_DOCUMENT_BYTES
    ) {
      Toast.show({
        type: "error",
        text1: t("proProfile.documentTooLarge"),
      });
      return;
    }

    uploadVerifierMutation.mutate({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? null,
      size: asset.size ?? null,
    });
  }, [userId, data?.document?.status, uploadVerifierMutation, t]);

  return {
    profileData: data ?? null,
    specialty,
    setSpecialty,
    registrationNumber,
    setRegistrationNumber,
    institution,
    setInstitution,
    isLoading,
    isError,
    refetch,
    handleSaveCredentials,
    resetCredentialsDraft,
    isSaving: saveMutation.isPending,
    handleEditProfilePress,
    handlePickVerifierDocument,
    isUploadingVerifier: uploadVerifierMutation.isPending,
  };
};
