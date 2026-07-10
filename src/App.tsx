import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle, Database, HelpCircle, Code, ShoppingCart, Info, ListFilter, Play, ArrowRight, MessageSquare, MapPin } from 'lucide-react';
import { DEMO_LOJAS } from './data';
import { fetchProdutosByLoja, fetchAllLojas } from './supabase';
import { Loja, Produto, CartItem, Gerente } from './types';
import StoreMenu from './components/StoreMenu';
import CartDrawer from './components/CartDrawer';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [lojasList, setLojasList] = useState<Loja[]>([]);
  const [currentLoja, setCurrentLoja] = useState<Loja | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [loggedGerente, setLoggedGerente] = useState<Gerente | null>(() => {
    try {
      const stored = localStorage.getItem('delivery_whitelabel_logged_gerente');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Dialog controls
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'admin'>('info');
  const [activeOrderCount, setActiveOrderCount] = useState(0);
  const [triggerRefreshOrders, setTriggerRefreshOrders] = useState(false);
  const [triggerRefreshProducts, setTriggerRefreshProducts] = useState(false);
  
  // Custom Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Load Lojas List
  const refreshLojas = async () => {
    const list = await fetchAllLojas();
    setLojasList(list);
    
    // Choose active store
    const hash = window.location.hash.replace('#/', '');
    const found = list.find((l) => l.slug_url === hash);
    
    // If gerente logged in, override currentLoja choice
    if (loggedGerente) {
      const managerStore = list.find((l) => l.id === loggedGerente.loja_id);
      if (managerStore) {
        setCurrentLoja(managerStore);
        return;
      }
    }

    if (found) {
      setCurrentLoja(found);
    } else if (list.length > 0 && !currentLoja) {
      setCurrentLoja(list[0]);
    }
  };

  useEffect(() => {
    refreshLojas();
  }, []);

  // Sync manager's store when manager is logged in
  useEffect(() => {
    if (loggedGerente && lojasList.length > 0) {
      const managerStore = lojasList.find((l) => l.id === loggedGerente.loja_id);
      if (managerStore) {
        setCurrentLoja(managerStore);
        window.location.hash = `#/${managerStore.slug_url}`;
      }
    }
  }, [loggedGerente, lojasList]);

  // Load products when store changes or when product list is refreshed
  useEffect(() => {
    async function loadProducts() {
      if (currentLoja) {
        const prods = await fetchProdutosByLoja(currentLoja.id);
        setProdutos(prods);
      }
    }
    loadProducts();
    setCart([]); // Clear cart when switching shops
  }, [currentLoja, triggerRefreshProducts]);

  // Handle URL hash routing (optional, to let users test e.g. #/burguer-mania)
  useEffect(() => {
    const handleHashChange = () => {
      if (lojasList.length === 0) return;
      const hash = window.location.hash.replace('#/', '');
      const found = lojasList.find((l) => l.slug_url === hash);
      if (found) {
        setCurrentLoja(found);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Init
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [lojasList]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = (produto: Produto, quantidade: number, observacoes?: string) => {
    setCart((prevCart) => {
      // Check if product is already in cart with EXACT same observations
      const existingItemIndex = prevCart.findIndex(
        (item) => item.produto.id === produto.id && item.observacoes === observacoes
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantidade += quantidade;
        return newCart;
      }

      return [...prevCart, { produto, quantidade, observacoes }];
    });
    showToast(`Adicionado: ${quantidade}x ${produto.nome}`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.produto.id === productId) {
            const newQty = item.quantidade + delta;
            return { ...item, quantidade: newQty };
          }
          return item;
        })
        .filter((item) => item.quantidade > 0);
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.produto.id !== productId));
    showToast('Item removido do carrinho', 'info');
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOrderCompleted = () => {
    setIsCartOpen(false);
    setActiveOrderCount((prev) => prev + 1);
    setTriggerRefreshOrders((prev) => !prev);
    
    // Show beautiful success notification
    showToast('Pedido finalizado! Redirecionando para o WhatsApp da loja...');
  };

  const handleSelectLojaFromAdmin = (loja: Loja) => {
    setCurrentLoja(loja);
    window.location.hash = `#/${loja.slug_url}`;
    showToast(`Carregando cardápio: ${loja.nome}`, 'info');
  };

  return (
    <div className="bg-orange-50 min-h-screen text-gray-900 flex flex-col md:flex-row font-sans selection:bg-orange-200/50">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border text-sm font-semibold ${
            toast.type === 'success'
              ? 'bg-orange-950/90 text-orange-300 border-orange-800'
              : 'bg-amber-950/90 text-amber-300 border-amber-800'
          }`}>
            <span className="h-2 w-2 rounded-full bg-orange-400 animate-ping" />
            {toast.message}
          </div>
        </div>
      )}

      {/* LEFT PANEL: Professional Developer Cockpit & Docs (Desktop only, hidden on mobile) */}
      <div className="hidden lg:flex flex-col lg:w-[45%] xl:w-[40%] bg-white border-r border-orange-100 shrink-0 h-screen overflow-y-auto shadow-sm">
        {/* Cockpit Nav */}
        <div className="flex border-b border-orange-100 px-6 py-4 items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500 text-white font-black text-sm">DW</span>
            <span className="font-extrabold text-sm tracking-tight text-gray-900">WhiteLabel<span className="text-orange-500">Delivery</span></span>
          </div>

          <div className="flex gap-1.5">
            <button
              id="btn-nav-info"
              onClick={() => setActiveTab('info')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'info'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-gray-500 hover:bg-orange-50 hover:text-gray-900'
              }`}
            >
              Arquitetura & Info
            </button>
            <button
              id="btn-nav-admin"
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-gray-500 hover:bg-orange-50 hover:text-gray-900'
              }`}
            >
              <Database size={13} />
              Banco de Dados
              {activeOrderCount > 0 && (
                <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">{activeOrderCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Cockpit Tab 1: Info & Architecture */}
        {activeTab === 'info' && (
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-orange-600">Visão Geral</span>
              <h2 className="text-xl font-extrabold text-gray-900">Plataforma Whitelabel Mobile-First</h2>
              <p className="text-gray-600 text-xs leading-relaxed">
                Esta solução whitelabel permite que qualquer comércio local tenha um cardápio online com link direto para o WhatsApp. O design é focado na taxa de conversão em dispositivos móveis, sem fricção de cadastro e sem taxas abusivas de intermediários.
              </p>
            </div>

            {/* Whitelabel Features */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Funcionalidades do Protótipo</h3>
              
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                  <span className="p-1.5 rounded-lg bg-orange-100 text-orange-600 mt-0.5">
                    <CheckCircle size={14} />
                  </span>
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">Temas Dinâmicos e Identidade</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Ao alternar a loja, as cores acentuadas, os produtos, o logotipo, a taxa de entrega e o número do WhatsApp de destino mudam instantaneamente de forma integrada.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                  <span className="p-1.5 rounded-lg bg-orange-100 text-orange-600 mt-0.5">
                    <MessageSquare size={14} />
                  </span>
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">Conversão via WhatsApp</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Monta o resumo do pedido perfeitamente formatado com marcadores, totalizador de preço, dados de troco e endereço para o lojista ler e processar no ato.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                  <span className="p-1.5 rounded-lg bg-orange-100 text-orange-600 mt-0.5">
                    <Database size={14} />
                  </span>
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">Banco de Dados Supabase</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Prepara a conexão com as tabelas de <strong>lojas</strong>, <strong>produtos</strong> e <strong>pedidos</strong>. Se as credenciais estiverem ausentes, o app funciona localmente de modo transparente.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Test Switcher */}
            <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                <h4 className="font-bold text-orange-700 text-xs uppercase tracking-wider">Selecione uma loja para testar o Whitelabel:</h4>
              </div>
              
              {loggedGerente ? (
                <div className="bg-orange-100/50 p-3 rounded-lg border border-orange-200 text-[11px] text-orange-800 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-orange-950">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-600 animate-ping" />
                    🔒 Cardápio travado para Gerente
                  </p>
                  <p className="leading-relaxed">
                    Você está conectado como gerente de <strong>{currentLoja?.nome}</strong>. O simulador está travado nesta marca para garantir a privacidade dos seus dados. Para testar outras marcas, faça logout em <strong>"Banco de Dados" &gt; "Sair"</strong>.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-orange-600">
                    Veja o aplicativo no simulador ao lado se reconfigurar inteiro baseado na marca:
                  </p>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {lojasList.map((loja) => (
                      <button
                        key={loja.id}
                        onClick={() => handleSelectLojaFromAdmin(loja)}
                        className={`px-2.5 py-2 rounded-lg text-[11px] font-bold border transition text-center truncate cursor-pointer ${
                          currentLoja?.id === loja.id
                            ? 'bg-orange-500 border-orange-400 text-white'
                            : 'bg-white border-orange-100 text-gray-700 hover:border-orange-200'
                        }`}
                      >
                        {loja.nome.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Explicações da Arquitetura */}
            <div className="space-y-2 pt-2 border-t border-orange-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estrutura das Tabelas</h4>
              <ul className="space-y-1.5 text-[11px] text-gray-600">
                <li className="flex justify-between">
                  <span className="font-mono text-gray-900 font-semibold">lojas</span>
                  <span>ID, Nome, Slug_URL, Tema, WhatsApp</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-mono text-gray-900 font-semibold">produtos</span>
                  <span>ID, Loja_ID (FK), Nome, Preço, Categoria</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-mono text-gray-900 font-semibold">pedidos</span>
                  <span>ID, Loja_ID (FK), Itens (JSON), Dados_Cliente (JSON), Total</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Cockpit Tab 2: Admin SQL & Live Orders */}
        {activeTab === 'admin' && currentLoja && (
          <div className="flex-1 overflow-y-auto bg-slate-900 text-slate-100">
            <AdminPanel
              currentLoja={currentLoja}
              onSelectLoja={handleSelectLojaFromAdmin}
              activeOrderCount={activeOrderCount}
              triggerRefreshOrders={triggerRefreshOrders}
              lojasList={lojasList}
              onRefreshLojas={refreshLojas}
              onRefreshProducts={() => setTriggerRefreshProducts((prev) => !prev)}
              loggedGerente={loggedGerente}
              onLoggedGerenteChange={setLoggedGerente}
            />
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Interactive Phone Emulation or Direct View */}
      <div className="flex-1 flex items-center justify-center p-0 md:p-6 lg:p-8 bg-orange-100/30 border-l border-orange-100 relative h-screen overflow-hidden">
        
        {/* Background Ambient glow */}
        {currentLoja && (
          <div 
            className="absolute w-72 h-72 rounded-full filter blur-[120px] opacity-20 transition-all duration-700"
            style={{ backgroundColor: currentLoja.cor_tema }}
          />
        )}

        {/* Phone Container */}
        {currentLoja ? (
          <div className="relative w-full h-full max-w-md sm:h-[820px] bg-white sm:rounded-[36px] sm:shadow-[0_0_0_12px_#1e293b,0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col transition-all duration-500 border border-orange-100 sm:border-none">
            {/* Status Bar / Speaker Notch */}
            <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 bg-slate-900 w-36 h-6 rounded-b-2xl z-50 flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-800 mr-2" />
              <span className="w-12 h-1 bg-slate-800 rounded-full" />
            </div>

            {/* Interactive Menu App */}
            <div className="flex-1 overflow-hidden flex flex-col h-full bg-slate-50">
              <StoreMenu
                loja={currentLoja}
                produtos={produtos}
                cart={cart}
                onAddToCart={handleAddToCart}
                onOpenCart={() => setIsCartOpen(true)}
                onOpenAdmin={() => {
                  setActiveTab('admin');
                  showToast('Painel do Banco de Dados aberto na lateral!', 'info');
                }}
              />
            </div>

            {/* Cart Drawer */}
            {isCartOpen && (
              <CartDrawer
                loja={currentLoja}
                cartItems={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
                onClose={() => setIsCartOpen(false)}
                onOrderCompleted={handleOrderCompleted}
              />
            )}
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-gray-500">Buscando configurações da marca...</p>
          </div>
        )}
      </div>
    </div>
  );
}
