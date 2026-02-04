export function PaginacaoVeiculo({ totalPages, currentPage, setCurrentPage }: { totalPages: number; currentPage: number; setCurrentPage: (value: number | ((prev: number) => number)) => void }) {
    return (
        <div>
            {totalPages > 1 && (
                <div className="flex justify-center gap-4 mt-6 text-white">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        className="px-3 py-1 bg-slate-700 rounded disabled:opacity-40"
                    >
                        Anterior
                    </button>

                    <span>
                        Página {currentPage} de {totalPages}
                    </span>

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className="px-3 py-1 bg-slate-700 rounded disabled:opacity-40"
                    >
                        Próxima
                    </button>
                </div>
            )}
        </div>
    )
}