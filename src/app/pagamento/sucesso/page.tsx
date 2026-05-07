import Link from "next/link";
import { confirmarPagamentoReserva } from "@/lib/vagas";

interface PagamentoSucessoPageProps {
  searchParams: {
    codigo?: string;
    vaga?: string;
    nome?: string;
  };
}

export default async function PagamentoSucessoPage({
  searchParams,
}: PagamentoSucessoPageProps) {
  const codigo = searchParams.codigo || "";
  const vaga = Number(searchParams.vaga || "0");
  const nome = searchParams.nome || "Visitante";
  const confirmacao =
    vaga && codigo
      ? await confirmarPagamentoReserva(vaga, codigo)
      : { success: false, error: "Dados da reserva nao encontrados." };

  if (!confirmacao.success) {
    return (
      <main className="min-h-screen bg-gray-950 px-4 py-10">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 border-2 border-red-500">
            <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="text-2xl font-black text-white mb-2">Reserva expirada</h1>
          <p className="text-gray-400 mb-8">
            Não encontramos uma reserva pendente para este pagamento. Faça uma nova reserva.
          </p>

          <Link
            href="/"
            className="block w-full rounded-xl bg-emerald-500 py-3.5 font-black text-black hover:bg-emerald-400 transition-colors"
          >
            Fazer nova reserva
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-10">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-500">
          <svg className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-white mb-1">Pagamento aprovado!</h1>
        <p className="text-gray-400 mb-8">
          Olá, <span className="text-white font-semibold">{nome}</span>. Sua reserva está confirmada.
        </p>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/50 p-6 mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400 mb-3">
            Seu Código de Reserva
          </p>
          <div className="text-5xl font-black tracking-[0.2em] text-white mb-3 select-all">
            {codigo || "------"}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-6 text-left">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Vaga atribuída automaticamente</span>
            <span className="font-black text-white text-lg">
              #{String(vaga).padStart(3, "0")}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-yellow-500/20 bg-yellow-900/10 p-3 mb-6">
          <p className="text-xs text-yellow-500/80">
            Guarde este código. Você precisará dele na entrada do evento.
          </p>
        </div>

        <Link
          href="/"
          className="block w-full rounded-xl bg-emerald-500 py-3.5 font-black text-black hover:bg-emerald-400 transition-colors"
        >
          Voltar para as Vagas
        </Link>
      </div>
    </main>
  );
}
