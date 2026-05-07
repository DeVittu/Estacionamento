"use client";

import { useEffect, useState, useCallback } from "react";
import { Vaga } from "@/lib/utils";

export function CheckinClient() {
  const [reservas, setReservas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");
  const [confirmando, setConfirmando] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ id: number; tipo: "ok" | "erro" } | null>(null);

  const carregarReservas = useCallback(async (filtro?: string) => {
    try {
      const params = filtro ? `?busca=${encodeURIComponent(filtro)}` : "";
      const response = await fetch(`/api/checkin${params}`, {
        credentials: "same-origin",
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Erro ao carregar reservas.");
      }

      const dados = data.reservas as Vaga[];
      setReservas(dados);
      setErro("");
    } catch (e) {
      console.error(e);
      setErro("Erro ao carregar reservas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarReservas();
  }, [carregarReservas]);

  // Busca com debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      carregarReservas(busca);
    }, 300);
    return () => clearTimeout(timer);
  }, [busca, carregarReservas]);

  async function handleCheckin(vagaId: number) {
    setConfirmando(vagaId);
    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ vagaId }),
      });
      const result = await response.json();

      if (result.success) {
        setFeedback({ id: vagaId, tipo: "ok" });
        setTimeout(() => {
          setFeedback(null);
          carregarReservas(busca);
        }, 1500);
      } else {
        setFeedback({ id: vagaId, tipo: "erro" });
        setTimeout(() => setFeedback(null), 2000);
      }
    } catch {
      setFeedback({ id: vagaId, tipo: "erro" });
      setTimeout(() => setFeedback(null), 2000);
    } finally {
      setConfirmando(null);
    }
  }

  const totalUsadas = reservas.filter((r) => r.usada).length;
  const totalPagas = reservas.filter(
    (r) => r.pagamento_status === "pago" || !r.pagamento_status
  ).length;
  const totalPendentes = reservas.filter((r) => r.pagamento_status === "pendente").length;

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
              <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black text-white leading-none">Check-in</h1>
              <p className="text-xs text-gray-500 leading-none mt-0.5">Painel do administrador</p>
            </div>
          </div>
          <a
            href="/api/checkin/logout"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            Sair
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Stats resumo */}
        {!loading && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard label="Total Reservas" value={reservas.length} color="text-white" bg="bg-white/5" />
            <StatCard label="Pagas" value={totalPagas} color="text-emerald-400" bg="bg-emerald-900/20" />
            <StatCard label="Pendentes" value={totalPendentes} color="text-yellow-400" bg="bg-yellow-900/20" />
          </div>
        )}

        {/* Campo de busca */}
        <div className="relative mb-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value.toUpperCase())}
            placeholder="Buscar por código (ex: A3F9KZ)"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors uppercase tracking-widest text-sm"
            autoFocus
          />
          {busca && (
            <button
              onClick={() => setBusca("")}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Erro */}
        {erro && (
          <div className="rounded-xl border border-red-500/30 bg-red-900/20 p-4 text-center text-red-400 text-sm mb-6">
            {erro}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-gray-500 text-sm">Carregando reservas...</p>
          </div>
        )}

        {/* Lista vazia */}
        {!loading && reservas.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">🔍</p>
            <p>
              {busca
                ? `Nenhuma reserva encontrada para "${busca}".`
                : "Nenhuma reserva cadastrada ainda."}
            </p>
          </div>
        )}

        {/* Tabela de reservas */}
        {!loading && reservas.length > 0 && (
          <div className="rounded-xl border border-white/10 overflow-hidden">
            {/* Header tabela */}
            <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-gray-900 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-gray-400">
              <div className="col-span-1">Vaga</div>
              <div className="col-span-3">Nome</div>
              <div className="col-span-2">Placa</div>
              <div className="col-span-2">Código</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Ação</div>
            </div>

            {/* Linhas */}
            <div className="divide-y divide-white/5">
              {reservas.map((reserva) => {
                const pagamentoConfirmado =
                  reserva.pagamento_status === "pago" || !reserva.pagamento_status;
                const podeConfirmar = !reserva.usada && pagamentoConfirmado;

                return (
                  <div
                    key={reserva.id}
                    className={`
                      grid grid-cols-12 gap-3 px-4 py-3.5 items-center transition-colors
                      ${
                        reserva.usada
                          ? "bg-emerald-950/20 hover:bg-emerald-950/30"
                          : "bg-gray-900/30 hover:bg-gray-900/50"
                      }
                      ${feedback?.id === reserva.id && feedback.tipo === "ok" ? "bg-emerald-900/40" : ""}
                      ${feedback?.id === reserva.id && feedback.tipo === "erro" ? "bg-red-900/40" : ""}
                    `}
                  >
                  <div className="col-span-1 font-black text-white text-sm">
                    #{String(reserva.id).padStart(3, "0")}
                  </div>
                  <div className="col-span-3 text-sm text-gray-300 truncate font-medium">
                    {reserva.nome}
                  </div>
                  <div className="col-span-2 text-sm text-gray-400 font-mono tracking-wider">
                    {reserva.placa}
                  </div>
                  <div className="col-span-2">
                    <span className="font-mono text-sm font-black tracking-widest text-white bg-white/10 px-2 py-0.5 rounded">
                      {reserva.codigo}
                    </span>
                  </div>
                  <div className="col-span-2">
                    {reserva.usada ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Usado
                      </span>
                    ) : !pagamentoConfirmado ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                        Pgto. pendente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        Não Usado
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 flex justify-end">
                    {!reserva.usada ? (
                      <button
                        onClick={() => handleCheckin(reserva.id)}
                        disabled={confirmando === reserva.id || !podeConfirmar}
                        className="rounded-lg bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-bold text-white transition-colors active:scale-95"
                      >
                        {confirmando === reserva.id ? (
                          <span className="flex items-center gap-1">
                            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            ...
                          </span>
                        ) : (
                          pagamentoConfirmado ? "Confirmar Entrada" : "Aguardando Pgto."
                        )}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-600 italic">Entrada confirmada</span>
                    )}
                  </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-gray-600">
          Total exibido: {reservas.length} reserva{reservas.length !== 1 ? "s" : ""}
          {busca && ` para "${busca}"`}
        </p>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className={`rounded-xl border border-white/10 ${bg} p-4 text-center`}>
      <div className={`text-3xl font-black ${color}`}>{value}</div>
      <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">{label}</div>
    </div>
  );
}
