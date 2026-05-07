"use client";

import { Vaga } from "@/lib/utils";

interface VagaCardProps {
  vaga: Vaga;
  onReservar: (vaga: Vaga) => void;
}

export function VagaCard({ vaga, onReservar }: VagaCardProps) {
  const livre = !vaga.reservada;

  return (
    <div
      className={`
        relative flex flex-col items-center justify-between
        rounded-xl border-2 p-3 transition-all duration-200
        ${
          livre
            ? "border-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 hover:scale-105"
            : "border-red-500/50 bg-red-950/30 opacity-75"
        }
      `}
    >
      {/* Número da vaga */}
      <span
        className={`
          text-xs font-bold tracking-widest uppercase mb-1
          ${livre ? "text-emerald-400" : "text-red-400"}
        `}
      >
        VAGA
      </span>
      <span
        className={`
          text-2xl font-black leading-none mb-2
          ${livre ? "text-white" : "text-red-200"}
        `}
      >
        {String(vaga.id).padStart(3, "0")}
      </span>

      {/* Status badge */}
      <span
        className={`
          text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full mb-3
          ${
            livre
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : "bg-red-500/20 text-red-300 border border-red-500/40"
          }
        `}
      >
        {livre ? "LIVRE" : "OCUPADA"}
      </span>

      {/* Botão */}
      <button
        onClick={() => onReservar(vaga)}
        disabled={!livre}
        className={`
          w-full text-xs font-bold py-1.5 px-3 rounded-lg transition-all duration-150
          ${
            livre
              ? "bg-emerald-500 hover:bg-emerald-400 text-black cursor-pointer active:scale-95"
              : "bg-gray-700/50 text-gray-500 cursor-not-allowed"
          }
        `}
      >
        {livre ? "Reservar" : "Ocupada"}
      </button>
    </div>
  );
}
