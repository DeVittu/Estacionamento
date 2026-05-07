// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface Vaga {
  id: number;
  reservada: boolean;
  nome: string | null;
  placa: string | null;
  codigo: string | null;
  usada: boolean;
  reservado_em?: string | null;
  pagamento_status?: "pendente" | "pago" | "cancelado" | null;
  mp_preference_id?: string | null;
}

export interface ReservaPayload {
  nome: string;
  placa: string;
}

export interface ReservaResult {
  success: boolean;
  vagaId?: number;
  codigo?: string;
  error?: string;
}

// ─── Gerador de código único ──────────────────────────────────────────────────

/**
 * Gera um código alfanumérico único de 6 caracteres (maiúsculos).
 * Ex: "A3F9KZ"
 */
export function gerarCodigo(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}

// ─── Formatação de placa ──────────────────────────────────────────────────────

/**
 * Formata placa para maiúsculas e remove espaços extras.
 */
export function formatarPlaca(placa: string): string {
  return placa.toUpperCase().trim().replace(/\s+/g, "");
}
