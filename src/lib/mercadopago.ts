import { MercadoPagoConfig, Preference } from "mercadopago";

interface CriarPreferenciaReservaParams {
  vagaId: number;
  codigo: string;
  nome: string;
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

function valorReserva() {
  const valor = Number(process.env.MP_RESERVA_VALOR || "20");
  return Number.isFinite(valor) && valor > 0 ? valor : 20;
}

function mercadoPagoClient() {
  const accessToken = process.env.MP_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("MP_ACCESS_TOKEN nao configurado.");
  }

  return new MercadoPagoConfig({
    accessToken,
    options: { timeout: 5000 },
  });
}

export async function criarPreferenciaReserva({
  vagaId,
  codigo,
  nome,
}: CriarPreferenciaReservaParams) {
  const preference = new Preference(mercadoPagoClient());
  const baseUrl = siteUrl();
  const params = new URLSearchParams({
    codigo,
    vaga: String(vagaId),
    nome,
  });

  const result = await preference.create({
    body: {
      items: [
        {
          id: `vaga-${vagaId}`,
          title: "Reserva de estacionamento",
          description: `Reserva da vaga ${String(vagaId).padStart(3, "0")}`,
          quantity: 1,
          unit_price: valorReserva(),
          currency_id: "BRL",
        },
      ],
      external_reference: `${vagaId}:${codigo}`,
      back_urls: {
        success: `${baseUrl}/pagamento/sucesso?${params.toString()}`,
        failure: `${baseUrl}/pagamento/falha?vaga=${vagaId}`,
        pending: `${baseUrl}/pagamento/pendente?${params.toString()}`,
      },
      statement_descriptor: "ESTACIONAMENTO",
    },
  });

  const initPoint = result.init_point || result.sandbox_init_point;

  if (!initPoint || !result.id) {
    throw new Error("Mercado Pago nao retornou link de pagamento.");
  }

  return {
    preferenceId: result.id,
    initPoint,
  };
}
