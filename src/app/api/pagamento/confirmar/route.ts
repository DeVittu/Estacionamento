import { NextRequest, NextResponse } from "next/server";
import { confirmarPagamentoReserva } from "@/lib/vagas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const vagaId = Number(body.vagaId);
    const codigo = String(body.codigo || "");

    if (!vagaId || !codigo) {
      return NextResponse.json(
        { success: false, error: "Dados incompletos." },
        { status: 400 }
      );
    }

    const result = await confirmarPagamentoReserva(vagaId, codigo);

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Erro na rota /api/pagamento/confirmar:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
