"use client";

import { Vaga } from "@/lib/utils";

interface StatsBarProps {
  vagas: Vaga[];
}

export function StatsBar({ vagas }: StatsBarProps) {
  const total = vagas.length;
  const ocupadas = vagas.filter((v) => v.reservada).length;
  const livres = total - ocupadas;
  const pctOcupadas = total > 0 ? Math.round((ocupadas / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-6">
          <Stat label="Total" value={total} color="text-gray-300" />
          <Stat label="Livres" value={livres} color="text-emerald-400" />
          <Stat label="Ocupadas" value={ocupadas} color="text-red-400" />
        </div>
        <div className="flex-1 min-w-[120px]">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Ocupação</span>
            <span className="font-bold text-white">{pctOcupadas}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-red-500 transition-all duration-700"
              style={{ width: `${pctOcupadas}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
    </div>
  );
}
