"use client";

import { useEffect, useState, useCallback } from "react";
import { ModalReserva } from "@/components/ModalReserva";
import { ConfirmacaoReserva } from "@/components/ConfirmacaoReserva";
import { buscarVagas } from "@/lib/vagas";
import { Vaga } from "@/lib/utils";

export default function HomePage() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [confirmacao, setConfirmacao] = useState<{
    codigo: string;
    vagaId: number;
    nome: string;
  } | null>(null);

  const carregarVagas = useCallback(async () => {
    try {
      const dados = await buscarVagas();
      setVagas(dados);
      setErro("");
    } catch (e) {
      console.error(e);
      setErro("Erro ao carregar vagas. Verifique a conexão com o Supabase.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarVagas();
    // Atualização automática a cada 30 segundos
    const interval = setInterval(carregarVagas, 30_000);
    return () => clearInterval(interval);
  }, [carregarVagas]);

  function handleSucesso(codigo: string, vagaId: number, nome: string) {
    setModalAberto(false);
    setConfirmacao({ codigo, vagaId, nome });
    // Atualizar lista após reserva
    carregarVagas();
  }

  function handleVoltar() {
    setConfirmacao(null);
    carregarVagas();
  }

  const total = vagas.length;
  const ocupadas = vagas.filter((v) => v.reservada).length;
  const livres = total - ocupadas;
  const pctOcupadas = total > 0 ? Math.round((ocupadas / total) * 100) : 0;
  const mapaUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL;

  return (
    <main className="min-h-screen bg-[#080b10] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0d1118]/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/15 border border-cyan-300/30">
              <svg className="h-5 w-5 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black text-white leading-none">
                Parking Reserva
              </h1>
              <p className="text-xs text-slate-500 leading-none mt-0.5">Estacionamento do evento</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
        {/* Estados */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-10 w-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <p className="text-slate-500 text-sm">Carregando vagas...</p>
          </div>
        )}

        {erro && (
          <div className="rounded-xl border border-red-500/30 bg-red-900/20 p-6 text-center">
            <p className="text-red-400 font-bold mb-1">⚠️ Erro de conexão</p>
            <p className="text-red-500/70 text-sm mb-4">{erro}</p>
            <button
              onClick={carregarVagas}
              className="rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !erro && (
          <>
            <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#101722] p-6 sm:p-8 lg:p-10">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300" />
                <div className="absolute right-0 top-0 h-44 w-44 bg-cyan-400/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-52 w-52 bg-amber-300/10 blur-3xl" />

                <div className="relative">
                  <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-200">
                    <span className="h-2 w-2 rounded-full bg-cyan-300" />
                    Reserva online
                  </div>

                  <h2 className="max-w-2xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                    Garanta sua vaga antes de chegar
                  </h2>
                  <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                    Informe seus dados, pague com Pix ou cartão e receba o código para entrar com agilidade no estacionamento.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => setModalAberto(true)}
                      disabled={livres === 0}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-7 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950/30 transition-colors hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
                    >
                      {livres > 0 ? "Reservar agora" : "Sem vagas disponíveis"}
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                    <a
                      href="#localizacao"
                      className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-bold text-slate-200 transition-colors hover:bg-white/10"
                    >
                      Ver localização
                    </a>
                  </div>

                  <div className="mt-10 grid grid-cols-3 gap-3">
                    <Metric label="Livres" value={livres} tone="text-emerald-300" />
                    <Metric label="Reservadas" value={ocupadas} tone="text-amber-300" />
                    <Metric label="Ocupação" value={`${pctOcupadas}%`} tone="text-cyan-300" />
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Disponibilidade</p>
                      <p className="mt-2 text-3xl font-black text-white">{livres} de {total}</p>
                    </div>
                    <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-bold text-emerald-200">
                      {livres > 0 ? "Aberto" : "Lotado"}
                    </div>
                  </div>
                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-amber-300 transition-all duration-700"
                      style={{ width: `${pctOcupadas}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Disponibilidade atualizada automaticamente a cada 30s
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InfoTile
                    title="Pagamento"
                    body="Pix ou cartão"
                    icon={
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h.01M11 15h2m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    }
                  />
                  <InfoTile
                    title="Entrada"
                    body="Código único"
                    icon={
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.1.9-2 2-2h5v10h-5a2 2 0 01-2-2m0-6V7a2 2 0 00-2-2H5v10h5a2 2 0 002-2z" />
                    }
                  />
                </div>
              </div>
            </section>

            <section id="localizacao" className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Localização</p>
                <h3 className="mt-3 text-2xl font-black text-white">Encontre o estacionamento</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  O mapa do Google Maps pode ser configurado para mostrar o ponto exato de acesso dos veículos.
                </p>
                <div className="mt-5 space-y-3 text-sm text-slate-300">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                    <span>Acesso indicado pelo mapa</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-300/10 text-amber-200">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22a10 10 0 100-20 10 10 0 000 20z" />
                      </svg>
                    </span>
                    <span>Chegue com o código de reserva em mãos</span>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
                {mapaUrl ? (
                  <iframe
                    src={mapaUrl}
                    className="h-[360px] w-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização do estacionamento"
                  />
                ) : (
                  <div className="relative flex h-[360px] items-center justify-center overflow-hidden bg-[#101826]">
                    <div className="absolute inset-0 opacity-40">
                      <div className="h-full w-full bg-[linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(0deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:36px_36px]" />
                    </div>
                    <div className="absolute left-10 top-12 h-24 w-1 rotate-45 rounded-full bg-cyan-300/30" />
                    <div className="absolute bottom-10 right-16 h-32 w-1 -rotate-45 rounded-full bg-amber-300/30" />
                    <div className="relative text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/15">
                        <svg className="h-8 w-8 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-black uppercase tracking-widest text-white">Mapa do estacionamento</p>
                      <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
                        Configure `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` para exibir o Google Maps aqui.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Modal de reserva */}
      {modalAberto && (
        <ModalReserva
          onClose={() => setModalAberto(false)}
          onSuccess={handleSucesso}
        />
      )}

      {/* Tela de confirmação */}
      {confirmacao && (
        <ConfirmacaoReserva
          codigo={confirmacao.codigo}
          vagaId={confirmacao.vagaId}
          nome={confirmacao.nome}
          onNova={handleVoltar}
        />
      )}
    </main>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/45 p-4">
      <div className={`text-2xl font-black ${tone}`}>{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
    </div>
  );
}

function InfoTile({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-cyan-200">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
      </div>
      <div className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</div>
      <div className="mt-1 text-lg font-black text-white">{body}</div>
    </div>
  );
}
