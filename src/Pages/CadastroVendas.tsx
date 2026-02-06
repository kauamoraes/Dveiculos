import { useEffect, useState } from "react"
import { ModalVendas } from "../components/vendas/ModalVendas"
import Select from "react-select"
import "../style.css"

// Interfaces
interface Client {
  id: number;
  nome: string;
  rg: string;
  cep: string;
  cpf: string;
  rua: string;
  bairro: string;
  cidade: string;
  celular: string;
  tipo: string;
}

interface Vehicle {
  id: number;
  marca: string;
  modelo: string;
  placa: string;
  anoModelo: string;
  cor: string;
  chassi: string;
  valorCompra: number;
  documentoTipo?: string;
  renavan: string;
  km: number;
  // Adicione outros campos se necessário
}

interface Sale {
  id: number;
  dataVenda: string;
  valorVenda: number;
  financiou: boolean;
  banco?: string;
  possuiAlienacao?: boolean;
  valorFinanciado?: number;
  valorEntrada?: number;
  valorParcela?: number;
  quantidadeParcelas?: number;
  diaVencimento?: number;
  observacoes?: string;
  clientId: number;
  vehicleId: number;
  client: Client;
  vehicle: Vehicle;
}

interface FormData {
  dataVenda: string;
  valorVenda: string;
  financiou: string;
  banco: string;
  possuiAlienacao: string;
  valorFinanciado: string;
  valorEntrada: string;
  valorParcela: string;
  quantidadeParcelas: string;
  diaVencimento: string;
  observacoes: string;
  clientId: number;
  vehicleId: number;
}

const initialForm: FormData = {
  dataVenda: "",
  valorVenda: "",
  financiou: "",
  banco: "",
  possuiAlienacao: "",
  valorFinanciado: "",
  valorEntrada: "",
  valorParcela: "",
  quantidadeParcelas: "",
  diaVencimento: "",
  observacoes: "",
  clientId: 0,
  vehicleId: 0
}

export function CadastroVendas() {
  const [vendas, setVendas] = useState<Sale[]>([])
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [clientes, setClientes] = useState<Client[]>([])
  const [veiculos, setVeiculos] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState<FormData>(initialForm)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)

  // Carrega dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, clientRes, vehicleRes] = await Promise.all([
          fetch("https://back-end-dveiculos.onrender.com/sales?_expand=client&_expand=vehicle"),
          fetch("https://back-end-dveiculos.onrender.com/client"),
          fetch("https://back-end-dveiculos.onrender.com/vehicle")
        ])

        const salesData: Sale[] = await salesRes.json()
        const clientData: Client[] = await clientRes.json()
        const vehicleData: Vehicle[] = await vehicleRes.json()

        setVendas(salesData)
        setClientes(clientData)
        setVeiculos(vehicleData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      }
    }

    fetchData()
  }, [])

  // Filtra vendas
  const filteredSale = vendas.filter((v) =>
    `${v.client.nome} ${v.vehicle.placa} ${v.vehicle.marca} ${v.valorVenda}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const clientsOptions = clientes.map(c => ({
    value: c.id,
    label: c.nome
  }))

  const vehicleOptions = veiculos.map(v => ({
    value: v.id,
    label: `${v.marca} ${v.modelo} - ${v.placa}`
  }))

  // Filtra veículos disponíveis (não vendidos) - exceto se estiver editando
  const veiculosDisponiveis = veiculos.filter(veiculo =>
    !vendas.some(venda => venda.vehicleId === veiculo.id && venda.id !== editingSale?.id)
  )

  // Função para verificar se deve mostrar o ATPV
  const deveMostrarATPV = (documentoTipo?: string) => {
    return documentoTipo?.toUpperCase() === "ATPV"
  }

  const baixarContratoVenda = async (saleId: number) => {
    window.open(`https://back-end-dveiculos.onrender.com/sales/${saleId}/contrato-docx`, "_blank")
  }

  // Aplica máscara monetária
  const aplicarMascaraMonetaria = (valor: string): string => {
    const valorLimpo = valor.replace(/\D/g, '')
    if (valorLimpo === '') return ''

    const numero = parseInt(valorLimpo, 10) / 100
    return numero.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // Remove máscara monetária
  const removerMascaraMonetaria = (valor: string): string => {
    return valor.replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '')
  }

  // Handle input change com máscaras
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    let valorFinal = value

    // Aplica máscaras conforme o campo
    switch (name) {
      case 'valorVenda':
      case 'valorEntrada':
      case 'valorFinanciado':
      case 'valorParcela':
        valorFinal = aplicarMascaraMonetaria(value)
        break
      case 'quantidadeParcelas':
      case 'diaVencimento':
        valorFinal = value.replace(/\D/g, '')
        break
    }

    setForm(prev => ({
      ...prev,
      [name]: valorFinal
    }))
  }

  // Reset form
  const resetForm = () => {
    setForm(initialForm)
    setEditingSale(null)
  }

  // Close modal
  const handleCloseModal = () => {
    resetForm()
    setModalOpen(false)
  }

  // Abrir modal para nova venda
  const handleOpenNewModal = () => {
    resetForm()
    setModalOpen(true)
  }

  // Abrir modal para editar venda
  const handleEditSale = (venda: Sale) => {
    setEditingSale(venda)

    // Formata a data para input type="date"
    const dataFormatada = venda.dataVenda
      ? new Date(venda.dataVenda).toISOString().split('T')[0]
      : ""

    setForm({
      dataVenda: dataFormatada,
      valorVenda: venda.valorVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      financiou: venda.financiou ? "sim" : "nao",
      banco: venda.banco || "",
      possuiAlienacao: venda.possuiAlienacao ? "sim" : "nao",
      valorFinanciado: venda.valorFinanciado?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "",
      valorEntrada: venda.valorEntrada?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "",
      valorParcela: venda.valorParcela?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "",
      quantidadeParcelas: venda.quantidadeParcelas?.toString() || "",
      diaVencimento: venda.diaVencimento?.toString() || "",
      observacoes: venda.observacoes || "",
      clientId: venda.clientId,
      vehicleId: venda.vehicleId
    })

    setModalOpen(true)
  }

  // Excluir venda
  const handleDeleteSale = async (id: number) => {
    const venda = vendas.find(v => v.id === id)
    if (!venda) return

    const confirmacao = window.confirm(
      `Tem certeza que deseja excluir a venda do veículo ${venda.vehicle.marca} ${venda.vehicle.modelo} (${venda.vehicle.placa}) para o cliente ${venda.client.nome}?\n\nEsta ação não pode ser desfeita.`
    )

    if (!confirmacao) return

    try {
      const response = await fetch(`https://back-end-dveiculos.onrender.com/sales/${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        // Remove a venda da lista local
        setVendas(prev => prev.filter(v => v.id !== id))

        // Recarrega veículos para atualizar disponibilidade
        const vehicleRes = await fetch("https://back-end-dveiculos.onrender.com/vehicle")
        const vehicleData: Vehicle[] = await vehicleRes.json()
        setVeiculos(vehicleData)

        alert("Venda excluída com sucesso!")
      } else {
        const errorText = await response.text()
        alert(`Erro ao excluir venda: ${errorText}`)
      }
    } catch (error: unknown) {
      console.error("Erro ao excluir venda:", error)
      let errorMessage = "Erro ao excluir venda. Tente novamente."
      
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
    }
  }

  // Handle submit para criar ou editar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validações
      if (!form.dataVenda || !form.valorVenda || !form.clientId || !form.vehicleId || !form.financiou) {
        alert("Preencha os campos obrigatórios: data, valor, cliente, veículo e financiamento")
        setIsLoading(false)
        return
      }

      // Verifica se veículo já foi vendido (apenas para nova venda)
      if (!editingSale) {
        const veiculoJaVendido = vendas.some(v => v.vehicleId === Number(form.vehicleId))
        if (veiculoJaVendido) {
          alert("Este veículo já foi vendido!")
          setIsLoading(false)
          return
        }
      }

      // Prepara payload
      const payload = {
        dataVenda: new Date(form.dataVenda).toISOString(),
        valorVenda: parseFloat(removerMascaraMonetaria(form.valorVenda)),
        financiou: form.financiou === "sim",
        banco: form.banco || null,
        possuiAlienacao: form.possuiAlienacao ? form.possuiAlienacao === "sim" : null,
        valorFinanciado: form.valorFinanciado ? parseFloat(removerMascaraMonetaria(form.valorFinanciado)) : null,
        valorEntrada: form.valorEntrada ? parseFloat(removerMascaraMonetaria(form.valorEntrada)) : null,
        valorParcela: form.valorParcela ? parseFloat(removerMascaraMonetaria(form.valorParcela)) : null,
        quantidadeParcelas: form.quantidadeParcelas ? parseInt(form.quantidadeParcelas) : null,
        diaVencimento: form.diaVencimento ? parseInt(form.diaVencimento) : null,
        observacoes: form.observacoes || null,
        clientId: Number(form.clientId),
        vehicleId: Number(form.vehicleId)
      }

      const url = editingSale
        ? `https://back-end-dveiculos.onrender.com/sales/${editingSale.id}`
        : "https://back-end-dveiculos.onrender.com/sales"

      const method = editingSale ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const savedSale: Sale = await response.json()

        // Busca cliente e veículo para adicionar aos dados
        const clienteDaVenda = clientes.find(c => c.id === form.clientId)
        const veiculoDaVenda = veiculos.find(v => v.id === form.vehicleId)

        if (editingSale) {
          // Atualiza venda existente
          setVendas(prev => prev.map(v =>
            v.id === savedSale.id
              ? {
                ...savedSale,
                client: clienteDaVenda || v.client,
                vehicle: veiculoDaVenda || v.vehicle
              }
              : v
          ))
        } else {
          // Adiciona nova venda
          setVendas(prev => [...prev, {
            ...savedSale,
            client: clienteDaVenda || { 
              id: 0, 
              nome: "Desconhecido", 
              cpf: "", 
              rua: "", 
              bairro: "", 
              cidade: "", 
              cep: "", 
              celular: "", 
              tipo: "", 
              rg: "" 
            },
            vehicle: veiculoDaVenda || { 
              id: 0, 
              marca: "", 
              modelo: "", 
              placa: "", 
              anoModelo: "", 
              cor: "", 
              chassi: "", 
              valorCompra: 0, 
              documentoTipo: "", 
              renavan: "", 
              km: 0 
            }
          }])
        }

        // Recarrega veículos para atualizar disponibilidade
        const vehicleRes = await fetch("https://back-end-dveiculos.onrender.com/vehicle")
        const vehicleData: Vehicle[] = await vehicleRes.json()
        setVeiculos(vehicleData)

        resetForm()
        setModalOpen(false)
        alert(editingSale ? "Venda atualizada com sucesso!" : "Venda cadastrada com sucesso!")

      } else {
        const errorText = await response.text()
        console.error("Erro na API:", errorText)
        alert("Erro ao salvar venda")
      }

    } catch (error: unknown) {
      console.error("Erro ao salvar venda:", error)
      let errorMessage = "Erro ao salvar venda"
      
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full p-w-full p-2 overflow-x-hidden">
      {/* Busca */}
      <div className="flex justify-center">
        <input
          type="text"
          className="w-96 rounded-md p-2 bg-slate-800 text-white outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Pesquisar venda por cliente, placa ou valor"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Header */}
      <div className="flex justify-between p-2">
        <h1 className="text-orange-500 font-bold text-2xl">Vendas</h1>
        <button
          className="text-white bg-orange-500 p-2 rounded-md hover:bg-orange-600 transition disabled:opacity-50"
          onClick={handleOpenNewModal}
          disabled={isLoading}
        >
          Cadastrar venda
        </button>
      </div>

      {/* Tabela */}
      <div className="relative w-full">
        {/* VIEWPORT INVISÍVEL (ÚNICO LUGAR QUE PODE ROLAR) */}
        <div className="w-full max-h-[400px] overflow-x-auto overflow-y-auto">
          {filteredSale.length > 0 ? (
            <table className="w-max min-w-[1400px] whitespace-nowrap text-white">
              <thead className="bg-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="p-3 border">ID Cliente</th>
                  <th className="p-3 border">Cliente</th>
                  <th className="p-3 border">Veículo</th>
                  <th className="p-3 border">Placa</th>
                  <th className="p-3 border">RG</th>
                  <th className="p-3 border">Valor</th>
                  <th className="p-3 border">CEP</th>
                  <th className="p-3 border">Documento Veículo</th>
                  <th className="p-3 border">Documento Cliente</th>
                  <th className="p-3 border">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredSale.map((venda) => (
                  <tr
                    key={venda.id}
                    className="text-center hover:bg-slate-700 transition"
                  >
                    <td className="p-3 border">{venda.clientId}</td>

                    <td className="p-3 border whitespace-nowrap">
                      {venda.client.nome}
                    </td>

                    <td className="p-3 border whitespace-nowrap">
                      {venda.vehicle.marca} {venda.vehicle.modelo}
                    </td>

                    <td className="p-3 border font-mono">
                      {venda.vehicle.placa}
                    </td>

                    <td className="p-3 border whitespace-nowrap">
                      {venda.client.rg || "N/A"}
                    </td>

                    <td className="p-3 border font-bold whitespace-nowrap">
                      R${" "}
                      {venda.valorVenda.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>

                    <td className="p-3 border whitespace-nowrap">
                      {venda.client.cep}
                    </td>

                    <td className="p-3 border">
                      {deveMostrarATPV(venda.vehicle.documentoTipo) ? (
                        <button
                          onClick={() =>
                            window.open(
                              `https://back-end-dveiculos.onrender.com/sales/${venda.id}/atpv-docx`,
                              "_blank"
                            )
                          }
                          className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-md text-sm transition"
                        >
                          Contrato ATPV
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          {venda.vehicle.documentoTipo || "N/A"}
                        </span>
                      )}
                    </td>

                    <td className="p-3 border">
                      <button
                        onClick={() => baixarContratoVenda(venda.id)}
                        className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded-md text-sm transition whitespace-nowrap"
                      >
                        Contrato Compra e Venda
                      </button>
                    </td>

                    <td className="p-3 border">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSale(venda)}
                          className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded transition"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => handleDeleteSale(venda.id)}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition"
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
            <div className="text-center mt-4 font-bold text-xl text-white">
              {vendas.length === 0
                ? "Carregando vendas..."
                : "Nenhuma venda encontrada"}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <ModalVendas
        modalOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingSale ? "Editar Venda" : "Cadastrar Venda"}
      >
        <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
          {/* Data da Venda - OBRIGATÓRIO */}
          <input
            type="date"
            name="dataVenda"
            value={form.dataVenda}
            onChange={handleInputChange}
            placeholder="Data da Venda *"
            className="p-2 col-span-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            required
            disabled={isLoading}
          />

          {/* Valor da Venda - OBRIGATÓRIO COM MÁSCARA */}
          <input
            name="valorVenda"
            placeholder="Valor da Venda *"
            value={form.valorVenda}
            onChange={handleInputChange}
            className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            required
            disabled={isLoading}
          />

          {/* Valor da Entrada COM MÁSCARA */}
          <input
            name="valorEntrada"
            placeholder="Valor da Entrada"
            value={form.valorEntrada}
            onChange={handleInputChange}
            className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            disabled={isLoading}
          />

          {/* Financiou - OBRIGATÓRIO */}
          <select
            name="financiou"
            className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            value={form.financiou}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          >
            <option value="">Financiou? *</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>

          {/* Banco (apenas se financiou) */}
          {form.financiou === "sim" && (
            <select
              name="banco"
              className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={form.banco}
              onChange={handleInputChange}
              required={form.financiou === "sim"}
              disabled={isLoading}
            >
              <option value="">Selecione o banco *</option>
              <option value="C6 AUTO">C6 AUTO</option>
              <option value="BV FINANCEIRA">BV FINANCEIRA</option>
              <option value="ITAÚ">ITAÚ</option>
              <option value="BRADESCO">BRADESCO</option>
              <option value="SANTANDER">SANTANDER</option>
              <option value="PAN">PAN</option>
              <option value="DYCOVAL">DYCOVAL</option>
              <option value="OMNI">OMNI</option>
            </select>
          )}

          {/* Alienação (apenas se financiou) */}
          {form.financiou === "sim" && (
            <select
              name="possuiAlienacao"
              className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={form.possuiAlienacao}
              onChange={handleInputChange}
              disabled={isLoading}
            >
              <option value="">Possui alienação?</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          )}

          {/* Valor Financiado COM MÁSCARA */}
          <input
            name="valorFinanciado"
            placeholder="Valor Financiado"
            value={form.valorFinanciado}
            onChange={handleInputChange}
            className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            disabled={isLoading}
          />

          {/* Valor da Parcela COM MÁSCARA */}
          <input
            name="valorParcela"
            placeholder="Valor da Parcela"
            value={form.valorParcela}
            onChange={handleInputChange}
            className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            disabled={isLoading}
          />

          {/* Quantidade de Parcelas - APENAS NÚMEROS */}
          <input
            name="quantidadeParcelas"
            placeholder="Quantidade de Parcelas"
            value={form.quantidadeParcelas}
            onChange={handleInputChange}
            className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            maxLength={3}
            disabled={isLoading}
          />

          {/* Dia de Vencimento - APENAS NÚMEROS (1-31) */}
          <input
            name="diaVencimento"
            placeholder="Dia de Vencimento"
            value={form.diaVencimento}
            onChange={handleInputChange}
            className="p-2 col-span-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            maxLength={2}
            disabled={isLoading}
          />

          {/* Veículo - OBRIGATÓRIO */}
          <div className="col-span-2">
            {veiculosDisponiveis.length > 0 || editingSale ? (
              <Select<{ value: number; label: string }>
                options={vehicleOptions}
                placeholder="Selecione o Veículo..."
                isClearable
                isSearchable
                isDisabled={isLoading}
                value={vehicleOptions.find(o => o.value === form.vehicleId) || null}
                onChange={(option) => {
                  setForm(prev => ({
                    ...prev,
                    vehicleId: option ? option.value : 0
                  }));
                }}
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: "#1e293b",
                    borderColor: form.vehicleId === 0 ? "#ef4444" : "#f97316",
                    color: "white"
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "white"
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: "#1e293b"
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? "#f97316" : "#1e293b",
                    color: "white",
                    cursor: "pointer"
                  }),
                  input: (base) => ({
                    ...base,
                    color: "white"
                  })
                }} />
            ) : (
              <div className="p-3 bg-red-900 text-white rounded-md text-center">
                Não há veículos disponíveis para venda
              </div>
            )}
          </div>

          {/* Cliente - OBRIGATÓRIO */}
          <div className="col-span-2">
            <Select<{ value: number; label: string }>
              options={clientsOptions}
              placeholder="Selecione o cliente..."
              isClearable
              isSearchable
              isDisabled={isLoading}
              value={clientsOptions.find(o => o.value === form.clientId) || null}
              onChange={(option) => {
                setForm(prev => ({
                  ...prev,
                  clientId: option ? option.value : 0
                }));
              }}
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: "#1e293b",
                  borderColor: form.clientId === 0 ? "#ef4444" : "#f97316",
                  color: "white"
                }),
                singleValue: (base) => ({
                  ...base,
                  color: "white"
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: "#1e293b"
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? "#f97316" : "#1e293b",
                  color: "white",
                  cursor: "pointer"
                }),
                input: (base) => ({
                  ...base,
                  color: "white"
                })
              }} />
          </div>

          {/* Observações */}
          <textarea
            name="observacoes"
            className="p-2 col-span-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            placeholder="Observações"
            value={form.observacoes}
            onChange={handleInputChange}
            rows={3}
            disabled={isLoading}
          />

          {/* Botões */}
          <div className="flex col-span-2 gap-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 p-2 bg-slate-500 rounded-md text-white hover:bg-slate-600 transition disabled:opacity-50"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 p-2 bg-orange-500 text-white font-bold rounded-md hover:bg-orange-600 transition disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : (editingSale ? "Atualizar" : "Salvar")}
            </button>
          </div>
        </form>
      </ModalVendas>
    </div>
  )
}