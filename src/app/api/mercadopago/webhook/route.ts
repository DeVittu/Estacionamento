import { NextRequest, NextResponse } from "next/server";
import { consultarPagamento } from "@/lib/mercadopago";
import {
  confirmarPagamentoPorReferencia,
  liberarVaga,
} from "@/lib/vagas";

function getPaymentId(request: NextRequest, body: any) {
  return (
    body?.data?.id ||
    body?.id ||
    request.nextUrl.searchParams.get("data.id") ||
    request.nextUrl.searchParams.get("id")
  );
}

function isPaymentNotification(body: any) {
  return body?.type === "payment" || body?.topic === "payment" || body?.action?.startsWith("payment.");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    if (!isPaymentNotification(body)) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const paymentId = getPaymentId(request, body);

    if (!paymentId) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const pagamento = await consultarPagamento(paymentId);
    const externalReference = pagamento.external_reference;

    if (!externalReference) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (pagamento.status === "approved") {
      await confirmarPagamentoPorReferencia(externalReference, paymentId);
    }

    if (
      pagamento.status === "rejected" ||
      pagamento.status === "cancelled" ||
      pagamento.status === "refunded" ||
      pagamento.status === "charged_back"
    ) {
      const vagaId = Number(externalReference.split(":")[0]);
      if (vagaId) await liberarVaga(vagaId);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Erro no webhook do Mercado Pago:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
