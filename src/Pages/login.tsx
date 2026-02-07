import { useState } from "react";

export function Login() {
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: { preventDefault: () => void; }) {
    e.preventDefault();
    setMsg("");

    if (!senha) {
      setMsg("Informe a senha");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("https://back-end-dveiculos.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Senha inválida");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Redireciona para o dashboard
      window.location.href = "/app/veiculos";
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-md bg-slate-800 rounded-xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Entrar
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-2 rounded bg-slate-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite sua senha"
            />
          </div>

          {msg && (
            <p className="text-sm text-center text-red-400">
              {msg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 transition text-white font-semibold disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-sm text-center text-slate-400 mt-4">
          Não tem conta?{" "}
          <span
            className="text-blue-400 hover:underline cursor-pointer"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Criar senha
          </span>
        </p>
      </div>
    </div>
  );
}
