import { NextRequest, NextResponse } from "next/server";
import { checkinSessionValue, isCheckinPasswordValid } from "@/lib/checkinAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const senha = String(body.senha || "");

    if (!isCheckinPasswordValid(senha)) {
      return NextResponse.json(
        { success: false, error: "Senha inválida." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set("checkin_session", checkinSessionValue(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("Erro na rota /api/checkin/login:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
