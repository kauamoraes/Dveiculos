import type { Veiculo } from "../../Pages/listVeiculos";

interface TableProps {
  veiculosPaginados: Veiculo[];
  onEdit: (veiculo: Veiculo) => void;
  onDelete: (id: number) => void;
}

export function Table({ veiculosPaginados, onEdit, onDelete }: TableProps) {
  return (
    <div>
      {veiculosPaginados.length > 0 ? (
        <table className="w-full border-collapse text-white">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-3 border">Id</th>
              <th className="p-3 border">Marca</th>
              <th className="p-3 border">Modelo</th>
              <th className="p-3 border">Ano</th>
              <th className="p-3 border">Cor</th>
              <th className="p-3 border">Data Compra</th>
              <th className="p-3 border">Placa</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Contratos</th>
              <th className="p-3 border">Ações</th>
            </tr>
          </thead>

          <tbody>
            {veiculosPaginados.map((v) => (
              <tr key={v.id} className="text-center hover:bg-slate-700">
                <td className="p-3 border">{v.id}</td>
                <td className="p-3 border">{v.marca}</td>
                <td className="p-3 border">{v.modelo}</td>
                <td className="p-3 border">{v.anoModelo}</td>
                <td className="p-3 border">{v.cor}</td>
                <td className="p-3 border">
                  {new Date(v.dataCompra).toLocaleDateString()}
                </td>
                <td className="p-3 border">{v.placa}</td>

                <td className="p-3 border">
                  <div
                    className={`p-1 rounded-md font-bold ${v.status.toUpperCase() === "VENDIDO"
                      ? "bg-red-500"
                      : "bg-green-500"
                      }`}
                  >
                    {v.status}
                  </div>
                </td>

                <td className="p-3 border">
                  <div className="flex flex-col items-center justify-center h-full min-h-[60px]">
                    {(v.documentoTipo || v.tipoDocumento) ? (
                      <a
                        href={`https://back-end-dveiculos.onrender.com/vehicle/${v.id}/${getContratoUrl(v)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${getContratoCor(v)} text-white p-2 rounded transition w-full text-center`}
                      >
                        {getContratoTexto(v)}
                      </a>
                    ) : (
                      <span className="text-gray-400 italic text-sm">
                        sem cotrato disponivel
                      </span>
                    )}
                  </div>
                </td>

                <td className="p-3 border">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => onEdit(v)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(v.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-white text-lg font-medium text-center">
          Nenhum Veículo encontrado
        </p>
      )}
    </div>
  );
}

// Funções auxiliares para verificar todos os cenários
function getContratoUrl(veiculo: Veiculo): string {
  const tipo = veiculo.documentoTipo || veiculo.tipoDocumento || "";

  if (tipo.includes("CONSIGNOU") || tipo === "Consignou") {
    return "consignacao-docx";
  } else if (tipo.includes("FINANCIOU") || tipo === "Financiou - Terceiro") {
    return "financiamento-docx";
  } else if (tipo.includes("COMPROU") || tipo === "Comprou") {
    return "compra-docx";
  } else if (veiculo.status === "Vendido") {
    return "venda-docx";
  }
  return "geral-docx";
}

function getContratoCor(veiculo: Veiculo): string {
  const tipo = veiculo.documentoTipo || veiculo.tipoDocumento || "";

  if (tipo.includes("CONSIGNOU") || tipo === "Consignou") {
    return "bg-orange-500 hover:bg-orange-600";
  } else if (tipo.includes("FINANCIOU") || tipo === "Financiou - Terceiro") {
    return "bg-blue-500 hover:bg-blue-600";
  } else if (tipo.includes("COMPROU") || tipo === "Comprou") {
    return "bg-purple-500 hover:bg-purple-600";
  } else if (veiculo.status === "Vendido") {
    return "bg-green-500 hover:bg-green-600";
  }
  return "bg-gray-500 hover:bg-gray-600";
}

function getContratoTexto(veiculo: Veiculo): string {
  const tipo = veiculo.documentoTipo || veiculo.tipoDocumento || "";

  if (tipo.includes("CONSIGNOU") || tipo === "Consignou") {
    return "Contrato Consignação";
  } else if (tipo.includes("FINANCIOU") || tipo === "Financiou - Terceiro") {
    return "Contrato Financiamento";
  } else if (tipo.includes("COMPROU") || tipo === "Comprou") {
    return "Contrato Compra";
  } else if (veiculo.status === "Vendido") {
    return "Contrato Venda";
  }
  return "Contrato";
}