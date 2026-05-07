import Link from "next/link";

export default function PagamentoFalhaPage() {
  return (
    <main className="min-h-screen bg-gray-950 px-4 py-10">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 border-2 border-red-500">
          <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-white mb-2">Pagamento não concluído</h1>
        <p className="text-gray-400 mb-8">
          Não conseguimos confirmar o pagamento. Você pode tentar fazer a reserva novamente.
        </p>

        <Link
          href="/"
          className="block w-full rounded-xl bg-emerald-500 py-3.5 font-black text-black hover:bg-emerald-400 transition-colors"
        >
          Tentar novamente
        </Link>
      </div>
    </main>
  );
}
