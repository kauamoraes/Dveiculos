import { useEffect, useState } from "react";
import { ModalVeiculo } from "../components/veiculos/ModalVeiculos";
import { Table } from "../components/veiculos/TableVeiculo";
import { PaginacaoVeiculo } from "../components/veiculos/PaginacaoVeiculo";
import Select from "react-select";

// Interfaces
interface Client {
  id: number;
  nome: string;
  // Adicione outros campos do cliente se necessário
}

interface Veiculo {
  id: number;
  dataCompra: string;
  marca: string;
  modelo: string;
  placa: string;
  anoModelo: string;
  cor: string;
  chassi: string;
  renavan: string;
  valorCompra: number;
  km: number;
  status: string;
  documentoTipo: string;
  clientId: number;
  client?: {
    id: number;
    nome: string;
  };
}

interface FormData {
  dataCompra: string;
  marca: string;
  modelo: string;
  placa: string;
  anoModelo: string;
  cor: string;
  chassi: string;
  renavan: string;
  valorCompra: number;
  km: number;
  status: string;
  documentoTipo: string;
  clientId: number;
}

// Declaração do evento personalizado
declare global {
  interface WindowEventMap {
    'veiculo-atribuido': CustomEvent<{ clienteId: number }>;
  }
}

const initialForm: FormData = {
  dataCompra: "",
  marca: "",
  modelo: "",
  placa: "",
  anoModelo: "",
  cor: "",
  chassi: "",
  renavan: "",
  valorCompra: 0,
  km: 0,
  status: "",
  documentoTipo: "",
  clientId: 0,
};

const tipoStatusVeiculo = [
  "Todos",
  "Disponível",
  "Vendido"
]

export function ListVeiculos() {
  // Estados
  const [modalOpen, setModalOpen] = useState(false);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [clientes, setClientes] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormData>(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("Todos");
  const [editingVehicle, setEditingVehicle] = useState<Veiculo | null>(null);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Busca
  const veiculosFiltrados = veiculos.filter((v) =>
    `${v.marca} ${v.modelo} ${v.placa} ${v.anoModelo} ${v.client?.nome || ""} ${v.cor} ${v.chassi}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const clientsOptions = clientes.map(c => ({
    value: c.id,
    label: c.nome
  }));

  const veiculosFiltradosEstoque = filter === "Todos"
    ? veiculosFiltrados
    : veiculosFiltrados.filter(v => v.status === filter);

  // Cálculos da paginação
  const totalPages = Math.ceil(veiculosFiltradosEstoque.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const veiculosPaginados = veiculosFiltradosEstoque.slice(startIndex, endIndex);

  // Carrega veículos com dados do cliente
  useEffect(() => {
    const fetchVeiculos = async () => {
      try {
        const res = await fetch("https://back-end-dveiculos.onrender.com/vehicle?_expand=client");
        if (res.ok) {
          const data = await res.json();
          setVeiculos(data);
        }
      } catch (error) {
        console.error("Erro ao carregar veículos:", error);
      }
    };

    fetchVeiculos();
  }, []);

  // Carrega clientes
  useEffect(() => {
    fetch("https://back-end-dveiculos.onrender.com/client")
      .then((res) => res.json())
      .then((data: Client[]) => setClientes(data))
      .catch(console.error);
  }, []);

  // Volta para primeira página quando busca muda
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Handle Change
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    const numberFields = ["valorCompra", "km", "clientId"];

    setForm((prev) => ({
      ...prev,
      [name]: numberFields.includes(name)
        ? (value === "" ? 0 : Number(value))
        : value
    }));
  }

  // Handle Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validações CONFORME SCHEMA
      const errors: string[] = [];

      // Campos obrigatórios no schema (String, não optional)
      if (!form.marca) errors.push("marca");
      if (!form.modelo) errors.push("modelo");
      if (!form.placa) errors.push("placa");
      if (!form.anoModelo) errors.push("anoModelo");
      if (!form.cor) errors.push("cor");
      if (!form.chassi) errors.push("chassi");
      if (!form.renavan) errors.push("renavan");
      if (!form.status) errors.push("status");
      if (!form.documentoTipo) errors.push("documentoTipo");
      if (!form.clientId || form.clientId === 0) errors.push("cliente");

      if (errors.length > 0) {
        alert(`Preencha os campos obrigatórios: ${errors.join(", ")}`);
        setIsLoading(false);
        return;
      }

      // Verifica se placa já existe
      if (!editingVehicle) {
        const placaExistente = veiculos.some(v => v.placa === form.placa);
        if (placaExistente) {
          alert("Placa já cadastrada!");
          setIsLoading(false);
          return;
        }
      } else {
        // Para edição, verifica se outra placa diferente tem o mesmo valor
        const placaExistente = veiculos.some(v => v.placa === form.placa && v.id !== editingVehicle.id);
        if (placaExistente) {
          alert("Placa já cadastrada para outro veículo!");
          setIsLoading(false);
          return;
        }
      }

      // Prepara payload CONFORME SCHEMA
      const payload = {
        dataCompra: form.dataCompra
          ? new Date(form.dataCompra).toISOString()
          : new Date().toISOString(),
        marca: form.marca,
        modelo: form.modelo,
        placa: form.placa,
        anoModelo: form.anoModelo,
        cor: form.cor,
        chassi: form.chassi,
        renavan: form.renavan,
        valorCompra: form.valorCompra || 0,
        km: form.km || 0,
        status: form.status,
        documentoTipo: form.documentoTipo,
        clientId: form.clientId
      };

      console.log("Enviando payload:", payload);

      const url = editingVehicle
        ? `https://back-end-dveiculos.onrender.com/vehicle/${editingVehicle.id}`
        : "https://back-end-dveiculos.onrender.com/vehicle";

      const method = editingVehicle ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const savedVehicle: Veiculo = await response.json();
      console.log("Resposta do servidor:", savedVehicle);

      // Busca o cliente para adicionar ao novo veículo
      const clienteDoVeiculo = clientes.find(c => c.id === form.clientId);

      // Atualiza a lista de veículos
      if (editingVehicle) {
        setVeiculos(prev =>
          prev.map(v => v.id === savedVehicle.id
            ? { 
                ...savedVehicle, 
                client: clienteDoVeiculo ? { 
                  id: clienteDoVeiculo.id, 
                  nome: clienteDoVeiculo.nome 
                } : undefined 
              }
            : v
          )
        );
      } else {
        setVeiculos(prev => [...prev, {
          ...savedVehicle,
          client: clienteDoVeiculo ? { 
            id: clienteDoVeiculo.id, 
            nome: clienteDoVeiculo.nome 
          } : undefined
        }]);
      }

      // DISPARA EVENTO PARA NOTIFICAR OS CLIENTES QUE UM VEÍCULO FOI ATRIBUÍDO
      if (form.clientId && form.clientId !== 0) {
        const event = new CustomEvent('veiculo-atribuido', {
          detail: { clienteId: form.clientId }
        });
        window.dispatchEvent(event);
      }

      // Limpa formulário e fecha modal
      setForm(initialForm);
      setEditingVehicle(null);
      setModalOpen(false);

      alert(editingVehicle ? "Veículo atualizado com sucesso!" : "Veículo cadastrado com sucesso!");

    } catch (error: unknown) {
      console.error("ERRO AO SALVAR:", error);
      let errorMessage = "Erro ao salvar veículo. Tente novamente.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // Função para editar veículo
  function handleEditVehicle(vehicle: Veiculo) {
    setEditingVehicle(vehicle);

    // Formata a data para o input type="date"
    const dataFormatada = vehicle.dataCompra
      ? new Date(vehicle.dataCompra).toISOString().split('T')[0]
      : "";

    setForm({
      dataCompra: dataFormatada,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      placa: vehicle.placa,
      anoModelo: String(vehicle.anoModelo),
      cor: vehicle.cor,
      chassi: vehicle.chassi,
      renavan: vehicle.renavan,
      valorCompra: vehicle.valorCompra,
      km: vehicle.km,
      status: vehicle.status,
      documentoTipo: vehicle.documentoTipo,
      clientId: vehicle.clientId
    });

    setModalOpen(true);
  }

  // Função para excluir veículo
  async function handleDeleteVehicle(id: number) {
    const confirm = window.confirm("Tem certeza que deseja excluir este veículo?");
    if (!confirm) return;

    try {
      const response = await fetch(`https://back-end-dveiculos.onrender.com/vehicle/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      setVeiculos(prev => prev.filter(v => v.id !== id));
      alert("Veículo excluído com sucesso!");
    } catch (error: unknown) {
      console.error("ERRO AO EXCLUIR:", error);
      let errorMessage = "Erro ao excluir veículo. Tente novamente.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  }

  // Fecha modal e reseta formulário
  const handleCloseModal = () => {
    setForm(initialForm);
    setEditingVehicle(null);
    setModalOpen(false);
  }

  // Abrir modal para adicionar novo veículo
  const handleOpenModal = () => {
    setEditingVehicle(null);
    setForm(initialForm);
    setModalOpen(true);
  }

  return (
    <div className="w-full flex flex-col gap-4 p-4">
      {/* SEARCH */}
      <div className="flex justify-center gap-8">
        <input
          type="text"
          className="w-96 rounded-md p-2 bg-slate-800 text-white outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Pesquisar veículos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-orange-500 font-bold text-2xl">
          Lista de Veículos
        </h1>

        <button
          type="button"
          className="text-white bg-orange-500 p-2 rounded-md hover:bg-orange-600 transition disabled:opacity-50"
          onClick={handleOpenModal}
          disabled={isLoading}
        >
          Adicionar Veículo
        </button>
      </div>

      <div className="flex flex-row gap-4">
        {tipoStatusVeiculo.map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFilter(tipo)}
            className={`px-4 py-2 rounded-full transition-all ${filter === tipo
              ? "bg-orange-500 text-white"
              : "bg-gray-600 text-white hover:bg-gray-700"
              }`}
          >
            {tipo}
          </button>
        ))}
      </div>

      {/* TABELA E PAGINAÇÃO */}
      <div className="overflow-x-auto mt-2">
        <Table
          veiculosPaginados={veiculosPaginados}
          onEdit={handleEditVehicle}
          onDelete={handleDeleteVehicle}
        />
        {totalPages > 0 && (
          <PaginacaoVeiculo
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>

      {/* MODAL */}
      <ModalVeiculo
        modalOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingVehicle ? "Editar Veículo" : "Adicionar Veículo"}
      >
        <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
          {/* Marca */}
          <input
            name="marca"
            placeholder="Marca *"
            value={form.marca}
            onChange={handleChange}
            className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            required
            disabled={isLoading}
          />

          {/* Modelo */}
          <input
            name="modelo"
            placeholder="Modelo *"
            value={form.modelo}
            onChange={handleChange}
            className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            required
            disabled={isLoading}
          />

          {/* Ano do Modelo */}
          <input
            type="text"
            name="anoModelo"
            placeholder="2024/2024 *"
            value={form.anoModelo}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');

              if (value.length > 8) value = value.substring(0, 8);

              if (value.length > 4) {
                value = value.substring(0, 4) + '/' + value.substring(4);
              }

              handleChange({
                target: {
                  name: 'anoModelo',
                  value: value
                }
              } as React.ChangeEvent<HTMLInputElement>);
            }}
            className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            required
            disabled={isLoading}
            maxLength={9}
          />

          {/* Cor */}
          <input
            name="cor"
            placeholder="Cor *"
            value={form.cor}
            onChange={handleChange}
            className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            required
            disabled={isLoading}
          />

          {/* Status */}
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            required
            disabled={isLoading}
          >
            <option value="">Status do Veículo *</option>
            <option value="Disponível">Disponível</option>
            <option value="Vendido">Vendido</option>
          </select>

          {/* Data da Compra */}
          <input
            type="date"
            name="dataCompra"
            value={form.dataCompra}
            onChange={handleChange}
            className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            required
            disabled={isLoading}
          />

          {/* Placa */}
          <input
            name="placa"
            placeholder="ABC-1234 *"
            value={form.placa}
            onChange={(e) => {
              let value = e.target.value.toUpperCase();
              value = value.replace(/[^A-Z0-9]/g, '');

              if (value.length > 7) value = value.substring(0, 7);

              if (value.length > 3) {
                value = value.substring(0, 3) + '-' + value.substring(3);
              }

              handleChange({
                target: {
                  name: 'placa',
                  value: value
                }
              } as React.ChangeEvent<HTMLInputElement>);
            }}
            className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            required
            disabled={isLoading}
            maxLength={8}
          />

          {/* Chassi */}
          <input
            name="chassi"
            placeholder="Chassi (17 caracteres) *"
            value={form.chassi}
            onChange={(e) => {
              let value = e.target.value.toUpperCase();
              value = value.replace(/[^A-Z0-9]/g, '');

              if (value.length > 17) value = value.substring(0, 17);

              handleChange({
                target: {
                  name: 'chassi',
                  value: value
                }
              } as React.ChangeEvent<HTMLInputElement>);
            }}
            className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            required
            disabled={isLoading}
            maxLength={17}
          />

          {/* Renavan */}
          <input
            name="renavan"
            placeholder="Renavan (11 dígitos) *"
            value={form.renavan}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');

              if (value.length > 11) value = value.substring(0, 11);

              handleChange({
                target: {
                  name: 'renavan',
                  value: value
                }
              } as React.ChangeEvent<HTMLInputElement>);
            }}
            className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            required
            disabled={isLoading}
            maxLength={11}
          />

          {/* KM */}
          <input
            type="text"
            name="km"
            placeholder="KM *"
            value={form.km}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');

              if (value.length > 6) value = value.substring(0, 6);

              const numericValue = value ? parseInt(value, 10) : 0;

              handleChange({
                target: {
                  name: 'km',
                  value: numericValue.toString()
                }
              } as React.ChangeEvent<HTMLInputElement>);
            }}
            className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            required
            disabled={isLoading}
            maxLength={6}
          />

          {/* Valor de Compra */}
          <input
            type="text"
            name="valorCompra"
            placeholder="Valor de Compra *"
            value={form.valorCompra}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');

              if (value.length > 6) value = value.substring(0, 6);

              handleChange({
                target: {
                  name: 'valorCompra',
                  value: value
                }
              } as React.ChangeEvent<HTMLInputElement>);
            }}
            className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            required
            disabled={isLoading}
          />

          {/* Tipo de Documento */}
          <select
            name="documentoTipo"
            value={form.documentoTipo}
            onChange={handleChange}
            className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            required
            disabled={isLoading}
          >
            <option value="">Tipo de Documento *</option>
            <option value="ATPV">ATPV</option>
            <option value="DUT">DUT</option>
          </select>

          <div className="col-span-2">
            <Select
              options={clientsOptions}
              placeholder="Selecione o cliente..."
              isClearable
              isSearchable
              isDisabled={isLoading}
              value={clientsOptions.find(o => o.value === form.clientId) || null}
              onChange={(option: { value: number; label: string } | null) => {
                const clientId = option ? option.value : 0;
                setForm(prev => ({
                  ...prev,
                  clientId
                }));
              }}
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: "#1e293b",
                  borderColor: "#f97316",
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
              }}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-center col-span-2 gap-4">
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
              {isLoading ? "Salvando..." : (editingVehicle ? "Atualizar" : "Salvar")}
            </button>
          </div>
        </form>
      </ModalVeiculo>
    </div>
  );
}