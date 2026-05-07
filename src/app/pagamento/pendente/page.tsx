import Link from "next/link";

interface PagamentoPendentePageProps {
  searchParams: {
    codigo?: string;
    vaga?: string;
  };
}

export default function PagamentoPendentePage({
  searchParams,
}: PagamentoPendentePageProps) {
  return (
    <main className="min-h-screen bg-gray-950 px-4 py-10">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/20 border-2 border-yellow-500">
          <svg className="h-10 w-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-white mb-2">Pagamento pendente</h1>
        <p className="text-gray-400 mb-6">
          Assim que o pagamento for aprovado, sua reserva poderá ser validada na entrada.
        </p>

        {searchParams.codigo && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-6">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Código provisório</p>
            <p className="font-mono text-2xl font-black tracking-widest text-white">
              {searchParams.codigo}
            </p>
            {searchParams.vaga && (
              <p className="mt-2 text-xs text-gray-500">
                Vaga #{String(Number(searchParams.vaga)).padStart(3, "0")}
              </p>
            )}
          </div>
        )}

        <Link
          href="/"
          className="block w-full rounded-xl bg-white/10 py-3.5 font-black text-white hover:bg-white/15 transition-colors"
        >
          Voltar
        </Link>
      </div>
    </main>
  );
}
