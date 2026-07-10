import React, { useState } from 'react';
import { Loja, Gerente } from '../types';
import { getCustomGerentes } from '../supabase';

interface AdminLoginProps {
  mode: 'master' | 'store';
  loja?: Loja;
  onLoginSuccess: (gerente?: Gerente) => void;
  onBack: () => void;
}

const MASTER_CREDENTIALS = { email: '', senha: '' };

export default function AdminLogin({ mode, loja, onLoginSuccess, onBack }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !senha.trim()) {
      setError('Preencha email e senha.');
      return;
    }

    if (mode === 'master') {
      if (email.trim().toLowerCase() === MASTER_CREDENTIALS.email && senha === MASTER_CREDENTIALS.senha) {
        onLoginSuccess();
      } else {
        setError('Credenciais inválidas para admin master.');
      }
      return;
    }

    // Store mode: validate against gerentes list
    const gerentes = getCustomGerentes();
    const found = gerentes.find(
      (g) => g.email === email.trim().toLowerCase() && g.senha === senha
    );

    if (found) {
      if (loja && found.loja_id !== loja.id) {
        setError(`Este usuário não é gerente de "${loja.nome}".`);
        return;
      }
      onLoginSuccess(found);
    } else {
      setError('Credenciais inválidas.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="text-center space-y-1">
            <span className="inline-block p-2 rounded-lg bg-orange-500 text-white font-black text-sm">DW</span>
            <h1 className="text-lg font-black text-white tracking-tight">
              {mode === 'master' ? 'Admin Master' : `Admin ${loja?.nome || ''}`}
            </h1>
            <p className="text-xs text-slate-400">
              {mode === 'master'
                ? 'Acesso restrito ao administrador geral'
                : 'Acesso restrito ao gerente da loja'}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-slate-950 border border-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Senha</label>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••"
                className="w-full bg-slate-950 border border-slate-700 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 text-white placeholder-slate-500"
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer"
          >
            Entrar
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            ← Voltar
          </button>
        </form>
      </div>
    </div>
  );
}
