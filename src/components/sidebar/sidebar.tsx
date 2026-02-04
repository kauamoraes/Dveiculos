import { BadgeDollarSign, Car, UserRoundPlus } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {

    return (
        <div className="w-56 border-r h-screen">
            <img src="/src/assets/logo.png" alt="Logo Dveiculos" />

            <nav>
                <ul>
                    <li className="text-white text-xl p-4 hover:bg-orange-500 cursor-pointer mt-8">
                        <Link to="/app/cadastroClientes" className="flex text-nowrap gap-4">
                            <UserRoundPlus />Cadastrar Clientes
                        </Link>
                    </li>
                    <li className="text-white text-xl text-nowrap p-4 hover:bg-orange-500 cursor-pointer">
                        <Link to="/app/veiculos" className="flex gap-4">
                            <Car />Veículos
                        </Link>
                    </li>
                    <li className="text-white text-xl text-nowrap p-4 hover:bg-orange-500 cursor-pointer">
                        <Link to="/app/cadastroVendas" className="flex gap-4">
                            <BadgeDollarSign />Cadastrar Vendas
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}