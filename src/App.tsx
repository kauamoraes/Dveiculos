import { Route, Routes, Navigate } from "react-router-dom";
import { Header } from "./components/sidebar/sidebar";
import { ListVeiculos } from "./Pages/listVeiculos";
import { CadastroVendas } from "./Pages/CadastroVendas";
import { CadastroClientes } from "./Pages/cadastroClientes";
import { Register } from "./Pages/register";
import { Login } from "./Pages/login";

function AuthLayout() {
  return (
    <div className="min-h-screen bg-black">
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

function DashboardLayout() {
  return (
    <div className="bg-black h-screen flex">
      <Header />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/veiculos" element={<ListVeiculos />} />
          <Route path="/cadastroVendas" element={<CadastroVendas />} />
          <Route path="/cadastroClientes" element={<CadastroClientes />} />
          <Route path="*" element={<Navigate to="/app/veiculos" />} />
        </Routes>
      </div>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/*" element={<AuthLayout />} />

      <Route path="/app/*" element={<DashboardLayout />} />
    </Routes>
  );
}
