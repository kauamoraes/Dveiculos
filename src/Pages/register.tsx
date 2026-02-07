import { useState } from "react";

export function Register() {
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: { preventDefault: () => void; }) {
    e.preventDefault();
    setMsg("");

    if (!senha || !confirmarSenha) {
      setMsg("Preencha todos os campos");
      return;
    }

    if (senha !== confirmarSenha) {
      setMsg("As senhas não coincidem");
      return;
    }

    if (senha.length < 6) {
      setMsg("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("https://back-end-dveiculos.onrender.com/api/auth/criar-senha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar senha");
      }

      setMsg("Senha criada com sucesso! Agora faça login.");
      setSenha("");
      setConfirmarSenha("");

      // Aqui você pode redirecionar para login se quiser:
      // window.location.href = "/login";
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erro ao criar senha");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-md bg-slate-800 rounded-xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Criar Senha
        </h1>

        <form onSubmit={handleRegister} className="space-y-4">
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

          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Confirmar senha
            </label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full px-4 py-2 rounded bg-slate-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirme sua senha"
            />
          </div>

          {msg && (
            <p className="text-sm text-center text-amber-400">
              {msg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 transition text-white font-semibold disabled:opacity-60"
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        {/* Link para login */}
        <p className="text-sm text-center text-slate-400 mt-4">
          Já tem conta?{" "}
          <span
            className="text-blue-400 hover:underline cursor-pointer"
            onClick={() => {
              // ajuste conforme sua navegação
              window.location.href = "/login";
            }}
          >
            Entrar
          </span>
        </p>
      </div>
    </div>
  );
}
