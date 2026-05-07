import { NextRequest, NextResponse } from "next/server";
import { isCheckinAuthenticated } from "@/lib/checkinAuth";
import { buscarReservas, confirmarEntrada } from "@/lib/vagas";

function unauthorized() {
  return NextResponse.json(
    { success: false, error: "Acesso não autorizado." },
    { status: 401 }
  );
}

function hasCheckinAccess(request: NextRequest) {
  return isCheckinAuthenticated(request.cookies.get("checkin_session")?.value);
}

export async function GET(request: NextRequest) {
  try {
    if (!hasCheckinAccess(request)) {
      return unauthorized();
    }

    const busca = request.nextUrl.searchParams.get("busca") || undefined;
    const reservas = await buscarReservas(busca);

    return NextResponse.json({ success: true, reservas }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar reservas no check-in:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!hasCheckinAccess(request)) {
      return unauthorized();
    }

    const body = await request.json();
    const { vagaId } = body;

    if (!vagaId) {
      return NextResponse.json(
        { success: false, error: "ID da vaga não informado." },
        { status: 400 }
      );
    }

    const result = await confirmarEntrada(vagaId);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Erro na rota /api/checkin:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
