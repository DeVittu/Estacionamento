import { NextRequest, NextResponse } from "next/server";
import { criarPreferenciaReserva } from "@/lib/mercadopago";
import {
  liberarVaga,
  reservarVaga,
  salvarPreferenciaPagamento,
} from "@/lib/vagas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, placa } = body;

    if (!nome || !placa) {
      return NextResponse.json(
        { success: false, error: "Dados incompletos." },
        { status: 400 }
      );
    }

    if (nome.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Nome deve ter pelo menos 2 caracteres." },
        { status: 400 }
      );
    }

    if (placa.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Placa inválida." },
        { status: 400 }
      );
    }

    const result = await reservarVaga(nome, placa);

    if (!result.success) {
      return NextResponse.json(result, { status: 409 });
    }

    if (!result.vagaId || !result.codigo) {
      return NextResponse.json(
        { success: false, error: "Erro ao gerar reserva." },
        { status: 500 }
      );
    }

    try {
      const pagamento = await criarPreferenciaReserva({
        vagaId: result.vagaId,
        codigo: result.codigo,
        nome,
      });

      await salvarPreferenciaPagamento(result.vagaId, pagamento.preferenceId);

      return NextResponse.json(
        {
          ...result,
          preferenceId: pagamento.preferenceId,
          initPoint: pagamento.initPoint,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erro ao criar pagamento:", error);
      await liberarVaga(result.vagaId);

      return NextResponse.json(
        {
          success: false,
          error: "Nao foi possivel iniciar o pagamento. Tente novamente.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro na rota /api/reservar:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
