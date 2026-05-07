import { supabase } from "./supabase";
import { ReservaResult, Vaga, gerarCodigo, formatarPlaca } from "./utils";

function reservaExpiraEmMinutos() {
  const minutos = Number(process.env.RESERVA_EXPIRA_MINUTOS || "15");
  return Number.isFinite(minutos) && minutos > 0 ? minutos : 15;
}

// ─── Liberar reservas pendentes expiradas ────────────────────────────────────

export async function liberarReservasExpiradas(): Promise<void> {
  const expiraAntesDe = new Date(
    Date.now() - reservaExpiraEmMinutos() * 60 * 1000
  ).toISOString();

  await supabase
    .from("vagas")
    .update({
      reservada: false,
      nome: null,
      placa: null,
      codigo: null,
      usada: false,
      reservado_em: null,
      pagamento_status: null,
      mp_preference_id: null,
      mp_payment_id: null,
    })
    .eq("reservada", true)
    .eq("usada", false)
    .eq("pagamento_status", "pendente")
    .lt("reservado_em", expiraAntesDe);
}

// ─── Buscar todas as vagas ────────────────────────────────────────────────────

export async function buscarVagas(): Promise<Vaga[]> {
  await liberarReservasExpiradas();

  const { data, error } = await supabase
    .from("vagas")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw new Error(`Erro ao buscar vagas: ${error.message}`);
  return data as Vaga[];
}

// ─── Buscar vaga por ID ───────────────────────────────────────────────────────

export async function buscarVagaPorId(id: number): Promise<Vaga | null> {
  const { data, error } = await supabase
    .from("vagas")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Vaga;
}

// ─── Reservar vaga ────────────────────────────────────────────────────────────

export async function reservarVaga(
  nome: string,
  placa: string
): Promise<ReservaResult> {
  await liberarReservasExpiradas();

  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const { data: vagaLivre, error: buscaError } = await supabase
      .from("vagas")
      .select("id")
      .eq("reservada", false)
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (buscaError) {
      return { success: false, error: "Erro ao buscar vaga disponível." };
    }

    if (!vagaLivre) {
      return { success: false, error: "Não há vagas disponíveis no momento." };
    }

    const codigo = gerarCodigo();

    const { data: reserva, error } = await supabase
      .from("vagas")
      .update({
        reservada: true,
        nome: nome.trim(),
        placa: formatarPlaca(placa),
        codigo,
        usada: false,
        reservado_em: new Date().toISOString(),
        pagamento_status: "pendente",
        mp_preference_id: null,
        mp_payment_id: null,
      })
      .eq("id", vagaLivre.id)
      .eq("reservada", false)
      .select("id")
      .single();

    if (!error && reserva) {
      return { success: true, codigo, vagaId: reserva.id };
    }
  }

  return {
    success: false,
    error: "Não foi possível reservar agora. Tente novamente em instantes.",
  };
}

// ─── Liberar vaga quando o pagamento não puder ser iniciado ───────────────────

export async function liberarVaga(vagaId: number): Promise<void> {
  await supabase
    .from("vagas")
    .update({
      reservada: false,
      nome: null,
      placa: null,
      codigo: null,
      usada: false,
      reservado_em: null,
      pagamento_status: null,
      mp_preference_id: null,
      mp_payment_id: null,
    })
    .eq("id", vagaId)
    .eq("usada", false);
}

// ─── Associar checkout Mercado Pago ──────────────────────────────────────────

export async function salvarPreferenciaPagamento(
  vagaId: number,
  preferenceId: string
): Promise<void> {
  await supabase
    .from("vagas")
    .update({ mp_preference_id: preferenceId })
    .eq("id", vagaId)
    .eq("pagamento_status", "pendente");
}

// ─── Confirmar pagamento ─────────────────────────────────────────────────────

export async function confirmarPagamentoReserva(
  vagaId: number,
  codigo: string,
  paymentId?: string | number
): Promise<{ success: boolean; error?: string }> {
  await liberarReservasExpiradas();

  const { data, error } = await supabase
    .from("vagas")
    .update({
      pagamento_status: "pago",
      mp_payment_id: paymentId ? String(paymentId) : undefined,
    })
    .eq("id", vagaId)
    .eq("codigo", codigo)
    .eq("reservada", true)
    .eq("pagamento_status", "pendente")
    .select("id")
    .maybeSingle();

  if (error || !data) {
    const { data: reservaPaga, error: buscaError } = await supabase
      .from("vagas")
      .select("id")
      .eq("id", vagaId)
      .eq("codigo", codigo)
      .eq("reservada", true)
      .eq("pagamento_status", "pago")
      .maybeSingle();

    if (!buscaError && reservaPaga) {
      return { success: true };
    }

    return { success: false, error: "Reserva nao encontrada ou expirada." };
  }

  return { success: true };
}

// ─── Confirmar pagamento via webhook Mercado Pago ────────────────────────────

export async function confirmarPagamentoPorReferencia(
  externalReference: string,
  paymentId: string | number
): Promise<{ success: boolean; error?: string }> {
  const [vagaIdRaw, codigo] = externalReference.split(":");
  const vagaId = Number(vagaIdRaw);

  if (!vagaId || !codigo) {
    return { success: false, error: "Referencia externa invalida." };
  }

  return confirmarPagamentoReserva(vagaId, codigo, paymentId);
}

// ─── Buscar reservas (para check-in) ─────────────────────────────────────────

export async function buscarReservas(busca?: string): Promise<Vaga[]> {
  await liberarReservasExpiradas();

  let query = supabase
    .from("vagas")
    .select("*")
    .eq("reservada", true)
    .order("id", { ascending: true });

  if (busca && busca.trim()) {
    query = query.ilike("codigo", `%${busca.trim()}%`);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Erro ao buscar reservas: ${error.message}`);
  return data as Vaga[];
}

// ─── Confirmar entrada (check-in) ─────────────────────────────────────────────

export async function confirmarEntrada(
  vagaId: number
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase
    .from("vagas")
    .update({ usada: true })
    .eq("id", vagaId)
    .eq("reservada", true)
    .or("pagamento_status.eq.pago,pagamento_status.is.null")
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      success: false,
      error: "Pagamento ainda nao confirmado para esta reserva.",
    };
  }

  return { success: true };
}
