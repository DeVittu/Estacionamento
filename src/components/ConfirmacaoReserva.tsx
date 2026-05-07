"use client";

interface ConfirmacaoReservaProps {
  codigo: string;
  vagaId: number;
  nome: string;
  onNova: () => void;
}

export function ConfirmacaoReserva({ codigo, vagaId, nome, onNova }: ConfirmacaoReservaProps) {
  async function copiarCodigo() {
    try {
      await navigator.clipboard.writeText(codigo);
    } catch {
      // Silently fail
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md text-center">
        {/* Check icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-500">
          <svg className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-black text-white mb-1">Reserva Confirmada!</h2>
        <p className="text-gray-400 mb-8">
          Olá, <span className="text-white font-semibold">{nome}</span>! Sua vaga está garantida.
        </p>

        {/* Código destaque */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/50 p-6 mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400 mb-3">
            Seu Código de Reserva
          </p>
          <div
            className="text-5xl font-black tracking-[0.2em] text-white mb-3 cursor-pointer hover:text-emerald-300 transition-colors select-all"
            onClick={copiarCodigo}
            title="Clique para copiar"
          >
            {codigo}
          </div>
          <p className="text-xs text-emerald-600">Clique no código para copiar</p>
        </div>

        {/* Info da vaga */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-6 text-left">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Vaga atribuída automaticamente</span>
            <span className="font-black text-white text-lg">
              #{String(vagaId).padStart(3, "0")}
            </span>
          </div>
        </div>

        {/* Aviso */}
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-900/10 p-3 mb-6">
          <p className="text-xs text-yellow-500/80">
            ⚠️ Guarde este código! Você precisará dele na entrada do evento para confirmar seu check-in.
          </p>
        </div>

        <button
          onClick={onNova}
          className="w-full rounded-xl bg-emerald-500 py-3.5 font-black text-black hover:bg-emerald-400 transition-colors"
        >
          Voltar para as Vagas
        </button>
      </div>
    </div>
  );
}
