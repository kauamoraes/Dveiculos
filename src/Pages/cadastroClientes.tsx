import { useEffect, useState } from "react";
import { ModalCliente } from "../components/clientes/ModalCliente";
import { TableCliente } from "../components/clientes/TableCliente";

// Interfaces devem vir primeiro
export interface Veiculo {
  id: number;
  placa: string;
  modelo: string;
  marca: string;
  ano: string;
  clientId: number;
  clienteId?: number;
  client_id?: number;
  ownerId?: number;
}

export interface Client {
  cep: string;
  cidade: string;
  bairro: string;
  rua: string;
  rg: string;
  email: string;
  id: number;
  nome: string;
  cpf: string;
  celular: string;
  tipo: string;
  vehicles?: {
    id: number;
    placa: string;
    clientId: number;
  }[];
  temVeiculo?: boolean;
}

interface ClientComVeiculo extends Client {
  temVeiculo?: boolean;
  veiculos?: Veiculo[];
}

interface FormData {
  nome: string;
  email: string;
  cpf: string;
  rg: string;
  rua: string;
  bairro: string;
  cidade: string;
  cep: string;
  celular: string;
  tipo: string;
}

// Interface do detail do evento
interface VeiculoAtribuidoEventDetail {
  clienteId: number;
  veiculo: Veiculo;
}

// Declaração do evento personalizado - CORRIGIDA
declare global {
  interface Window {
    addEventListener(
      type: 'veiculo-atribuido',
      listener: (this: Window, ev: CustomEvent<VeiculoAtribuidoEventDetail>) => void,
      options?: boolean | AddEventListenerOptions
    ): void;
    
    dispatchEvent(event: CustomEvent<VeiculoAtribuidoEventDetail>): boolean;
  }
}

const initialForm: FormData = {
  nome: "",
  email: "",
  cpf: "",
  rg: "",
  rua: "",
  bairro: "",
  cidade: "",
  cep: "",
  celular: "",
  tipo: "",
};

const TIPOS_CLIENTE = [
  "Todos",
  "Comprou",
  "Trocou",
  "Financiou - Terceiro",
  "Vendeu",
  "Consignou"
] as const;

type TipoCliente = typeof TIPOS_CLIENTE[number];

export function CadastroClientes() {
  const [clients, setClients] = useState<ClientComVeiculo[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [filter, setFilter] = useState<TipoCliente>("Todos");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [todosVeiculos, setTodosVeiculos] = useState<Veiculo[]>([]);

  const itemsPerPage = 5;

  const clientesPorBusca = clients.filter((c) =>
    `${c.nome} ${c.cep} ${c.bairro} ${c.cpf} ${c.celular} ${c.tipo}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const clientesFiltrados = filter === "Todos"
    ? clientesPorBusca
    : clientesPorBusca.filter(c => c.tipo === filter);

  const totalPages = Math.ceil(clientesFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const clientesPaginados = clientesFiltrados.slice(startIndex, endIndex);

  const fetchVeiculos = async () => {
    try {
      console.log("🔄 Buscando veículos...");
      const response = await fetch("https://back-end-dveiculos.onrender.com/vehicle");
      if (response.ok) {
        const veiculos: Veiculo[] = await response.json();
        setTodosVeiculos(veiculos);
        console.log(`✅ ${veiculos.length} veículos carregados`);

        veiculos.forEach(v => {
          if (v.clientId) {
            console.log(`   🚗 ${v.placa} -> Cliente ID: ${v.clientId}`);
          }
        });
      } else {
        console.error("❌ Erro ao buscar veículos:", response.status);
      }
    } catch (error: unknown) {
      console.error("❌ Erro ao carregar veículos:", error);
    }
  };

  const fetchClients = async () => {
    try {
      console.log("🔄 Buscando clientes...");

      const response = await fetch("https://back-end-dveiculos.onrender.com/client");
      const clientesData: Client[] = await response.json();

      console.log(`✅ ${clientesData.length} clientes carregados do banco`);
      console.log(`📊 ${todosVeiculos.length} veículos disponíveis para verificação`);

      const clientesComVeiculos: ClientComVeiculo[] = clientesData.map(cliente => {
        const veiculosDoCliente = todosVeiculos.filter(v => {
          const idClienteVeiculo = 
            v.clientId ?? 
            v.clienteId ?? 
            v.client_id ?? 
            v.ownerId ?? 
            null;

          return Number(idClienteVeiculo) === Number(cliente.id);
        });

        return {
          ...cliente,
          veiculos: veiculosDoCliente,
          temVeiculo: veiculosDoCliente.length > 0
        };
      });

      const comVeiculo = clientesComVeiculos.filter(c => c.temVeiculo).length;
      console.log(`📈 ${comVeiculo} clientes têm veículo atribuído`);

      setClients(clientesComVeiculos);
    } catch (error: unknown) {
      console.error("❌ Erro ao carregar clientes:", error);
    }
  };

  useEffect(() => {
    const carregarTudo = async () => {
      await fetchVeiculos();
    };
    carregarTudo();
  }, []);

  useEffect(() => {
    if (todosVeiculos.length > 0) {
      fetchClients();
    }
  }, [todosVeiculos]);

  useEffect(() => {
    const handleVeiculoAtribuido = (event: CustomEvent<VeiculoAtribuidoEventDetail>) => {
      const { clienteId, veiculo } = event.detail;
      setClients(prev =>
        prev.map(c =>
          c.id === clienteId
            ? { 
                ...c, 
                veiculos: [...(c.veiculos || []), veiculo], 
                temVeiculo: true 
              }
            : c
        )
      );
    };

    // Agora o TypeScript reconhece o tipo corretamente
    window.addEventListener('veiculo-atribuido', handleVeiculoAtribuido as EventListener);

    return () => {
      window.removeEventListener('veiculo-atribuido', handleVeiculoAtribuido as EventListener);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    let maskedValue = value;

    if (name === "cpf") maskedValue = maskCPF(value);
    if (name === "cep") maskedValue = maskCEP(value);
    if (name === "celular") maskedValue = maskCelular(value);
    if (name === "rg") maskedValue = maskRG(value);

    setForm((prev) => ({ ...prev, [name]: maskedValue }));
  }

  async function baixarProcuracaoWord(clienteId: number, clienteNome: string): Promise<boolean> {
    try {
      console.log(`📄 Gerando procuração para cliente ID: ${clienteId}, Nome: ${clienteNome}`);

      const cliente = clients.find(c => c.id === clienteId);
      if (!cliente?.temVeiculo) {
        alert(`${clienteNome} ainda não possui veículo atribuído.\nVá para a página de 'Lista de Veículos' e atribua um veículo primeiro.`);
        return false;
      }

      console.log(`✅ Cliente ${clienteNome} tem veículo. Gerando procuração...`);

      const response = await fetch(`https://back-end-dveiculos.onrender.com/client/${clienteId}/procuracao-docx`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erro na resposta da procuração:", errorText);

        if (response.status === 403) {
          alert(`${clienteNome} ainda não possui veículo atribuído.\nAtribua um veículo primeiro para gerar a procuração.`);
          return false;
        }
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `procuracao-${clienteNome.replace(/\s+/g, '-')}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log("✅ Procuração baixada com sucesso!");
      return true;
    } catch (error: unknown) {
      console.error("❌ Erro ao baixar procuração:", error);
      let errorMessage = "Tente novamente.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(`Erro ao gerar procuração: ${errorMessage}`);
      return false;
    }
  }

  async function handleGerarProcuracao(id: number, nome: string) {
    const confirmacao = window.confirm(
      `Deseja gerar a procuração em Word para o cliente:\n\n"${nome}"?\n\nO documento será baixado automaticamente.`
    );

    if (!confirmacao) return;

    try {
      const sucesso = await baixarProcuracaoWord(id, nome);

      if (sucesso) {
        alert(`✅ Procuração gerada com sucesso para ${nome}!\nO documento Word foi baixado automaticamente.`);
      }
    } catch (error: unknown) {
      console.error("❌ Erro ao gerar procuração:", error);
      
      let errorMessage = "Erro ao gerar procuração. Verifique se o cliente tem um veículo atribuído.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(`Erro: ${errorMessage}`);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const camposObrigatorios: (keyof FormData)[] = [
        'nome', 'cpf', 'celular', 'tipo',
        'rua', 'bairro', 'cidade', 'cep'
      ];

      const camposFaltantes = camposObrigatorios.filter(campo => !form[campo].trim());

      if (camposFaltantes.length > 0) {
        alert(`Preencha os campos obrigatórios: ${camposFaltantes.join(', ')}`);
        setIsLoading(false);
        return;
      }

      const cpfFormatado = form.cpf.replace(/\D/g, '');
      const cepFormatado = form.cep.replace(/\D/g, '');
      const celularFormatado = form.celular.replace(/\D/g, '');
      const rgFormatado = form.rg.replace(/\D/g, '');

      if (cpfFormatado.length !== 11) {
        alert("CPF deve ter 11 dígitos!");
        setIsLoading(false);
        return;
      }

      if (!editingClient) {
        const cpfExistente = clients.some(c => {
          const cpfBanco = c.cpf.replace(/\D/g, '');
          return cpfBanco === cpfFormatado;
        });

        if (cpfExistente) {
          alert("CPF já cadastrado!");
          setIsLoading(false);
          return;
        }
      }

      const payload = {
        nome: form.nome.trim(),
        rua: form.rua.trim(),
        bairro: form.bairro.trim(),
        cidade: form.cidade.trim(),
        cep: cepFormatado,
        celular: celularFormatado,
        tipo: form.tipo,
        cpf: cpfFormatado,
        email: form.email.trim() || null,
        rg: rgFormatado || null
      };

      const url = editingClient
        ? `https://back-end-dveiculos.onrender.com/client/${editingClient.id}`
        : "https://back-end-dveiculos.onrender.com/client";

      const method = editingClient ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const novoCliente: Client = await response.json();

      if (editingClient) {
        const clienteAntigo = clients.find(c => c.id === novoCliente.id);
        const clienteAtualizado: ClientComVeiculo = {
          ...novoCliente,
          temVeiculo: clienteAntigo?.temVeiculo || false,
          veiculos: clienteAntigo?.veiculos || []
        };
        setClients(prev => prev.map(c =>
          c.id === clienteAtualizado.id ? clienteAtualizado : c
        ));
      } else {
        setClients(prev => [...prev, { ...novoCliente, temVeiculo: false, veiculos: [] }]);
      }

      setEditingClient(null);
      setForm(initialForm);
      setModalOpen(false);

      alert(editingClient ? "Cliente atualizado com sucesso!" : "Cliente cadastrado com sucesso!");

    } catch (error: unknown) {
      console.error("❌ ERRO AO SALVAR:", error);
      let errorMessage = "Erro ao cadastrar cliente. Verifique os dados e tente novamente.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(`Erro ao cadastrar cliente: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCloseModal = () => {
    setForm(initialForm);
    setModalOpen(false);
    setEditingClient(null);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  function handleEditClient(client: Client) {
    setEditingClient(client);
    setForm({
      nome: client.nome,
      email: client.email || "",
      cpf: maskCPFFromDB(client.cpf),
      rg: client.rg ? maskRGFromDB(client.rg) : "",
      rua: client.rua,
      bairro: client.bairro,
      cidade: client.cidade,
      cep: maskCEPFromDB(client.cep),
      celular: maskCelularFromDB(client.celular),
      tipo: client.tipo,
    });
    setModalOpen(true);
  }

  async function handleDelete(id: number) {
    const confirm = window.confirm("Tem certeza que deseja deletar este cliente?");
    if (!confirm) return;

    try {
      const response = await fetch(`https://back-end-dveiculos.onrender.com/client/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: Não foi possível deletar o cliente. ${errorText}`);
      }

      setClients(prev => prev.filter(c => c.id !== id));
      alert("Cliente deletado com sucesso!");
    } catch (error: unknown) {
      console.error("❌ ERRO AO DELETAR:", error);
      let errorMessage = "Erro ao deletar cliente. Tente novamente mais tarde.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(errorMessage);
    }
  }

  // Funções de máscara
  function maskCPF(value: string): string {
    return value.replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);
  }

  function maskCEP(value: string): string {
    return value.replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);
  }

  function maskCelular(value: string): string {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .slice(0, 14);
    } else {
      return cleaned.replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .slice(0, 15);
    }
  }

  function maskRG(value: string): string {
    return value.replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1})$/, "$1-$2")
      .slice(0, 12);
  }

  function maskCPFFromDB(cpf: string): string {
    const cleaned = cpf.replace(/\D/g, "");
    if (cpf.includes('.') && cpf.includes('-')) return cpf;
    return cleaned.replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);
  }

  function maskCEPFromDB(cep: string): string {
    const cleaned = cep.replace(/\D/g, "");
    if (cep.includes('-')) return cep;
    return cleaned.replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);
  }

  function maskCelularFromDB(celular: string): string {
    const cleaned = celular.replace(/\D/g, "");
    if (celular.includes('(') && celular.includes(')')) return celular;
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .slice(0, 14);
    } else {
      return cleaned.replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .slice(0, 15);
    }
  }

  function maskRGFromDB(rg: string): string {
    const cleaned = rg.replace(/\D/g, "");
    if (rg.includes('.') && rg.includes('-')) return rg;
    return cleaned.replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1})$/, "$1-$2")
      .slice(0, 12);
  }

  return (
    <div className="w-full p-4">
      <div className="flex flex-col md:flex-row justify-center items-center mb-6 gap-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Procurar Clientes"
            className="w-full rounded-md p-2 bg-slate-800 text-white outline-none focus:ring-2 focus:ring-orange-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-12">
        <div className="flex flex-wrap gap-4 mb-4 ">
          {TIPOS_CLIENTE.map((tipo) => (
            <button
              key={tipo}
              className={`px-4 py-2 rounded-full transition-all ${filter === tipo ? "bg-orange-500 text-white" : "bg-gray-600 text-white hover:bg-gray-700"}`}
              onClick={() => setFilter(tipo)}
            >
              {tipo}
            </button>
          ))}
        </div>

        {filter !== "Todos" && (
          <div className="mb-4 mt-4 p-3 bg-blue-900/30 text-blue-300 rounded-md flex items-center justify-between">
            <span>Mostrando clientes que: <strong>{filter}</strong></span>
            <button onClick={() => setFilter("Todos")} className="text-sm px-3 py-1 bg-blue-800/50 hover:bg-blue-700/50 rounded transition-colors">
              Limpar filtro
            </button>
          </div>
        )}

        <TableCliente
          clientes={clientesPaginados}
          currentPage={currentPage}
          totalPage={totalPages}
          onPrevPage={goToPrevPage}
          onNextPage={goToNextPage}
          onOpenModal={() => {
            setEditingClient(null);
            setForm(initialForm);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
          onEdit={handleEditClient}
          onGerarProcuracao={handleGerarProcuracao}
        />
      </div>

      <ModalCliente modalOpen={modalOpen} title={editingClient ? "Editar Cliente" : "Adicionar Cliente"} onClose={handleCloseModal}>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <input type="text" name="nome" placeholder="Nome *" value={form.nome} onChange={handleChange} className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" required disabled={isLoading} />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" disabled={isLoading} />
          <input type="text" name="cpf" value={form.cpf} onChange={handleChange} placeholder="CPF *" className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" disabled={isLoading} maxLength={14} />
          <input type="text" name="rg" placeholder="RG" value={form.rg} onChange={handleChange} className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" disabled={isLoading} maxLength={12} />
          <input type="text" name="rua" placeholder="Rua *" value={form.rua} onChange={handleChange} className="p-2 col-span-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" required disabled={isLoading} />
          <input type="text" name="bairro" placeholder="Bairro *" value={form.bairro} onChange={handleChange} className="p-2 col-span-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" required disabled={isLoading} />
          <input type="text" name="cidade" placeholder="Cidade *" value={form.cidade} onChange={handleChange} className="p-2 col-span-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" required disabled={isLoading} />
          <input type="text" name="cep" placeholder="CEP *" value={form.cep} onChange={handleChange} className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" required disabled={isLoading} maxLength={9} />
          <input type="text" name="celular" placeholder="Celular *" value={form.celular} onChange={handleChange} className="p-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" required disabled={isLoading} maxLength={15} />

          <select name="tipo" value={form.tipo} onChange={handleChange} className="p-2 col-span-2 bg-slate-800 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:outline-none" required disabled={isLoading}>
            <option value="">Selecione o tipo *</option>
            {TIPOS_CLIENTE.filter(tipo => tipo !== "Todos").map((tipo) => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>

          <div className="flex justify-center col-span-2 gap-4">
            <button type="button" onClick={handleCloseModal} className="flex-1 p-2 bg-slate-500 rounded-md text-white hover:bg-slate-600 transition disabled:opacity-50" disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="flex-1 p-2 bg-orange-500 text-white font-bold rounded-md hover:bg-orange-600 transition disabled:opacity-50" disabled={isLoading}>
              {isLoading ? "Salvando..." : editingClient ? "Atualizar" : "Salvar"}
            </button>
          </div>
        </form>
      </ModalCliente>
    </div>
  );
}