import React, { useState } from 'react';
import { X, MapPin, UserPlus, LogIn, Check, AlertCircle, Mic } from 'lucide-react';
import { Loja, Cliente, ClienteEndereco } from '../types';
import {
  authenticateCliente,
  getClienteByEmail,
  registerCliente,
} from '../supabase';

interface ClienteAuthProps {
  loja: Loja;
  onAuthenticated: (cliente: Cliente) => void;
  onClose: () => void;
}

export default function ClienteAuth({ loja, onAuthenticated, onClose }: ClienteAuthProps) {
  const [mode, setMode] = useState<'login' | 'registro'>('login');

  // Login
  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');

  // Registro
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [complemento, setComplemento] = useState('');
  const [cidade, setCidade] = useState('');

  const [geo, setGeo] = useState<{ lat: number; lng: number; precisao: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const capturarLocalizacao = () => {
    setGeoError(null);
    if (!('geolocation' in navigator)) {
      setGeoError('Seu navegador não suporta geolocalização.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          precisao: pos.coords.accuracy,
        });
        setGeoLoading(false);
      },
      (err) => {
        setGeoError('Não foi possível obter sua localização. Preencha o endereço manualmente.');
        setGeoLoading(false);
        console.warn('Geolocation error:', err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!emailLogin.trim() || !senhaLogin) {
      setError('Informe e-mail e senha.');
      return;
    }
    const cliente = authenticateCliente(loja.id, emailLogin.trim(), senhaLogin);
    if (!cliente) {
      setError('E-mail ou senha inválidos.');
      return;
    }
    onAuthenticated(cliente);
  };

  const handleRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!nome.trim() || !email.trim() || !senha || !telefone.trim()) {
      setError('Nome, e-mail, senha e telefone são obrigatórios.');
      return;
    }
    if (senha.length < 4) {
      setError('A senha deve ter ao menos 4 caracteres.');
      return;
    }
    if (getClienteByEmail(loja.id, email.trim())) {
      setError('Já existe um cliente com este e-mail nesta loja.');
      return;
    }

    const endereco: ClienteEndereco = {
      rua: rua.trim(),
      numero: numero.trim(),
      bairro: bairro.trim(),
      complemento: complemento.trim() || undefined,
      cidade: cidade.trim() || 'São Paulo, SP',
      ...(geo ? { lat: geo.lat, lng: geo.lng, precisao: geo.precisao } : {}),
    };

    const cliente = registerCliente({
      loja_id: loja.id,
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
      senha,
      endereco,
    });
    onAuthenticated(cliente);
  };

  return (
    <div id="cliente-auth-modal" className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" />

      <div className="relative bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col z-10 animate-slide-in-up max-h-[92vh] flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-orange-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600">
              {mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
            </span>
            <h3 className="font-black text-gray-900 text-sm">
              {mode === 'login' ? 'Entrar como cliente' : 'Criar minha conta'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-orange-100 text-gray-500 transition">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Toggle */}
          <div className="grid grid-cols-2 gap-2 mb-5 bg-orange-50 rounded-xl p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`py-2 rounded-lg text-xs font-bold transition ${mode === 'login' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}
            >
              Já tenho conta
            </button>
            <button
              type="button"
              onClick={() => { setMode('registro'); setError(null); }}
              className={`py-2 rounded-lg text-xs font-bold transition ${mode === 'registro' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}
            >
              Sou novo aqui
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-800 text-xs leading-relaxed mb-4 animate-shake">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={emailLogin}
                  onChange={(e) => setEmailLogin(e.target.value)}
                  placeholder="voce@email.com"
                  className="w-full text-sm border border-orange-100 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Senha</label>
                <input
                  type="password"
                  required
                  value={senhaLogin}
                  onChange={(e) => setSenhaLogin(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full text-sm border border-orange-100 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <button
                type="submit"
                style={{ backgroundColor: loja.cor_tema }}
                className="w-full text-white font-black py-3 px-4 rounded-xl shadow-lg transition transform active:scale-[0.98] text-sm cursor-pointer"
              >
                Entrar
              </button>
              <p className="text-[11px] text-gray-400 text-center">
                Sua conta é vinculada à loja <span className="font-bold text-gray-600">{loja.nome}</span>.
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegistro} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Nome completo *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Maria Silva"
                    className="w-full text-sm border border-orange-100 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                    className="w-full text-sm border border-orange-100 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Senha *</label>
                  <input
                    type="password"
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Mín. 4 caracteres"
                    className="w-full text-sm border border-orange-100 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 99999-8888"
                    className="w-full text-sm border border-orange-100 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>
              </div>

              {/* Localização */}
              <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-600 uppercase flex items-center gap-1.5">
                    <MapPin size={13} className="text-orange-500" /> Endereço de entrega
                  </span>
                  <button
                    type="button"
                    onClick={capturarLocalizacao}
                    disabled={geoLoading}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 disabled:opacity-50"
                  >
                    <MapPin size={12} />
                    {geoLoading ? 'Localizando...' : geo ? 'Refazer' : 'Usar minha localização'}
                  </button>
                </div>

                {geo && (
                  <div className="flex items-center gap-2 text-[10px] text-green-700 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1.5">
                    <Check size={12} />
                    Localização aproximada capturada
                    {geo.precisao ? ` (±${Math.round(geo.precisao)}m)` : ''} — ajuste o endereço abaixo se necessário.
                  </div>
                )}
                {geoError && (
                  <div className="flex items-center gap-2 text-[10px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
                    <AlertCircle size={12} />
                    {geoError}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Rua</label>
                    <input
                      type="text"
                      value={rua}
                      onChange={(e) => setRua(e.target.value)}
                      placeholder="Rua"
                      className="w-full text-xs border border-orange-100 bg-white px-2.5 py-1.5 rounded-lg mt-0.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Nº</label>
                    <input
                      type="text"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      placeholder="123"
                      className="w-full text-xs border border-orange-100 bg-white px-2.5 py-1.5 rounded-lg mt-0.5 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Bairro</label>
                    <input
                      type="text"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      placeholder="Bairro"
                      className="w-full text-xs border border-orange-100 bg-white px-2.5 py-1.5 rounded-lg mt-0.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Complemento</label>
                    <input
                      type="text"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      placeholder="Apto/Bloco"
                      className="w-full text-xs border border-orange-100 bg-white px-2.5 py-1.5 rounded-lg mt-0.5 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Cidade / Estado</label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="São Paulo, SP"
                    className="w-full text-xs border border-orange-100 bg-white px-2.5 py-1.5 rounded-lg mt-0.5 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ backgroundColor: loja.cor_tema }}
                className="w-full text-white font-black py-3 px-4 rounded-xl shadow-lg transition transform active:scale-[0.98] text-sm cursor-pointer"
              >
                Criar conta e salvar endereço
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
