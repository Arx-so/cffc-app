/**
 * Singleton do mock do Supabase.
 *
 * `jest.mock` é içado acima dos imports do arquivo de teste, então o factory não
 * pode fechar sobre uma variável declarada no teste — ela ainda estaria na TDZ.
 * Este módulo resolve isso: o factory faz `require` daqui (avaliação preguiçosa)
 * e o teste importa o mesmo objeto normalmente.
 *
 * Cada arquivo de teste roda com um registro de módulos próprio, então o
 * singleton não vaza entre suítes. Ainda assim, chame `supabaseMock.reset()`
 * num `beforeEach` para isolar os casos dentro da mesma suíte.
 *
 * Uso:
 *
 *   jest.mock("@/config/supabase", () => ({
 *     supabase: require("@/test/supabaseTestClient").supabaseMock.client,
 *   }));
 *   import { supabaseMock } from "@/test/supabaseTestClient";
 */
import { createSupabaseMock } from "./supabaseMock";

export const supabaseMock = createSupabaseMock();
