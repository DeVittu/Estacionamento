"use client";

import { useState } from "react";

interface ModalReservaProps {
  onClose: () => void;
  onSuccess: (codigo: string, vagaId: number, nome: string) => void;
}

export function ModalReserva({ onClose, onSuccess }: ModalReservaProps) {
  const [nome, setNome] = useState("");
  const [placa, setPlaca] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!nome.trim() || nome.trim().length < 2) {
      setErro("Informe seu nome completo.");
      return;
    }
    if (!placa.trim() || placa.trim().length < 5) {
      setErro("Informe uma placa válida.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/reservar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, placa }),
      });

      const data = await response.json();

      if (!data.success) {
        setErro(data.error || "Erro ao reservar. Tente novamente.");
        return;
      }

      if (data.initPoint) {
        window.location.href = data.initPoint;
        return;
      }

      onSuccess(data.codigo, data.vagaId, nome);
    } catch {
      setErro("Erro de conexão. Verifique sua internet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="text-lg font-black text-white">Reservar Vaga</h2>
            <p className="text-sm text-gray-400">O sistema escolhe uma vaga disponível</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Nome completo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: João da Silva"
              maxLength={80}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Placa do veículo
            </label>
            <input
              type="text"
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              placeholder="Ex: ABC-1234 ou ABC1D23"
              maxLength={8}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors uppercase tracking-widest"
            />
          </div>

          {erro && (
            <div className="rounded-lg border border-red-500/30 bg-red-900/20 px-4 py-3 text-sm text-red-400">
              ⚠️ {erro}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 py-3 text-sm font-bold text-gray-400 hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-emerald-500 py-3 text-sm font-black text-black hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Iniciando pagamento...
                </span>
              ) : (
                "Ir para pagamento"
              )}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="border-t border-white/5 px-5 py-3">
          <p className="text-xs text-gray-500 text-center">
            Pague com Pix ou cartão pelo Mercado Pago para receber seu código
          </p>
        </div>
      </div>
    </div>
  );
}
