import type { Client } from "../../Pages/cadastroClientes";

interface TableClienteProps {
  clientes: Client[];
  currentPage: number;
  totalPage: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onOpenModal: () => void;
  onDelete: (id: number) => void;
  onEdit: (client: Client) => void;
  onGerarProcuracao: (id: number, nome: string) => Promise<void>;
}

const maskCPF = (cpf?: string) => {
  if (!cpf) return "-";
  const digits = cpf.replace(/\D/g, "").padStart(11, "0").slice(0, 11);
  return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
};

const maskPhone = (phone?: string) => {
  if (!phone) return "-";
  const digits = phone.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }

  return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
};

export function TableCliente({
  clientes,
  currentPage,
  totalPage,
  onPrevPage,
  onNextPage,
  onOpenModal,
  onDelete,
  onEdit,
  onGerarProcuracao
}: TableClienteProps) {
  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Lista de Clientes</h2>
        <button
          onClick={onOpenModal}
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition"
        >
          + Adicionar Cliente
        </button>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-white">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Nome</th>
              <th className="p-3 border">CPF</th>
              <th className="p-3 border">Celular</th>
              <th className="p-3 border">Tipo</th>
              <th className="p-3 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => {
              const temVeiculo = (cliente.vehicles?.length ?? 0) > 0;

              return (
                <tr key={cliente.id} className="text-center hover:bg-slate-700">
                  <td className="p-3 border">{cliente.id}</td>
                  <td className="p-3 border">{cliente.nome}</td>
                  <td className="p-3 border">{maskCPF(cliente.cpf)}</td>
                  <td className="p-3 border">{maskPhone(cliente.celular)}</td>
                  <td className="p-3 border">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        cliente.tipo === "Comprou"
                          ? "bg-green-500/20 text-green-400"
                          : cliente.tipo === "Vendeu"
                          ? "bg-red-500/20 text-red-400"
                          : cliente.tipo === "Trocou"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {cliente.tipo}
                    </span>
                  </td>
                  <td className="p-3 border">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(cliente)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(cliente.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition text-sm"
                      >
                        Excluir
                      </button>

                      {temVeiculo ? (
                        <button
                          onClick={() =>
                            onGerarProcuracao(cliente.id, cliente.nome)
                          }
                          className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition text-sm"
                          title="Gerar Procuração"
                        >
                          📄 Procuração
                        </button>
                      ) : (
                        <button
                          disabled
                          className="bg-gray-600 text-gray-400 px-3 py-1 rounded-md cursor-not-allowed text-sm"
                          title="Atribua um veículo para gerar procuração"
                        >
                          ⛔ Sem veículo
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-white">
          Página {currentPage} de {totalPage}
        </span>
        <div className="flex gap-2">
          <button
            onClick={onPrevPage}
            disabled={currentPage === 1}
            className="bg-slate-700 text-white px-4 py-2 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            onClick={onNextPage}
            disabled={currentPage === totalPage}
            className="bg-slate-700 text-white px-4 py-2 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima
          </button>
        </div>
      </div>

      {clientes.length === 0 && (
        <div className="text-center text-white py-8">
          Nenhum cliente encontrado
        </div>
      )}
    </div>
  );
}
