import { BadgeDollarSign, Car, UserRoundPlus } from "lucide-react";
import { NavLink } from "react-router-dom";

export function Header() {
  const baseItem =
    "text-white text-xl p-4 cursor-pointer text-nowrap flex gap-4";
  const activeItem = "bg-orange-500";
  const hoverItem = "hover:bg-orange-500";

  return (
    <div className="w-56 border-r h-screen">
      <img src="/src/assets/logo.png" alt="Logo Dveiculos" />

      <nav>
        <ul className="mt-8">
          <li>
            <NavLink
              to="/app/cadastroClientes"
              className={({ isActive }) =>
                `${baseItem} ${hoverItem} ${isActive ? activeItem : ""}`
              }
            >
              <UserRoundPlus />
              Cadastrar Clientes
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/app/veiculos"
              className={({ isActive }) =>
                `${baseItem} ${hoverItem} ${isActive ? activeItem : ""}`
              }
            >
              <Car />
              Veículos
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/app/cadastroVendas"
              className={({ isActive }) =>
                `${baseItem} ${hoverItem} ${isActive ? activeItem : ""}`
              }
            >
              <BadgeDollarSign />
              Cadastrar Vendas
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}
