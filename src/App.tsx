import React, { useState, useEffect } from 'react';
import { Database } from 'lucide-react';
import { fetchProdutosByLoja, fetchAllLojas } from './supabase';
import { Loja, Produto, CartItem, Gerente } from './types';
import StoreMenu from './components/StoreMenu';
import CartDrawer from './components/CartDrawer';
import AdminPanel from './components/AdminPanel';
import PWAPrompt from './components/PWAPrompt';
import QRCodeDisplay from './components/QRCodeDisplay';

// Detect if the hash contains /admin suffix and extract the slug
function parseHash(): { slug: string | null; isAdmin: boolean } {
  const hash = window.location.hash.replace('#/', '').replace(/\/+$/, '');
  if (hash.endsWith('/admin')) {
    return { slug: hash.replace('/admin', ''), isAdmin: true };
  }
  return { slug: hash || null, isAdmin: false };
}

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

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'admin'>('info');
  const [activeOrderCount, setActiveOrderCount] = useState(0);
  const [triggerRefreshOrders, setTriggerRefreshOrders] = useState(false);
  const [triggerRefreshProducts, setTriggerRefreshProducts] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Router state
  const [route, setRoute] = useState(parseHash());

  // Load stores
  const refreshLojas = async () => {
    const list = await fetchAllLojas();
    setLojasList(list);
  };

  useEffect(() => {
    refreshLojas();
  }, []);

  // Handle hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const newRoute = parseHash();
      setRoute(newRoute);

      if (lojasList.length === 0) return;
      const found = lojasList.find((l) => l.slug_url === newRoute.slug);
      if (found) {
        setCurrentLoja(found);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [lojasList]);

  // Sync with route on initial load and when lojasList updates
  useEffect(() => {
    if (lojasList.length === 0) return;
    const r = parseHash();
    setRoute(r);

    if (r.slug) {
      const found = lojasList.find((l) => l.slug_url === r.slug);
      if (found) {
        setCurrentLoja(found);
      }
    }
  }, [lojasList]);

  // Sync manager's store when logged in
  useEffect(() => {
    if (loggedGerente && lojasList.length > 0) {
      const managerStore = lojasList.find((l) => l.id === loggedGerente.loja_id);
      if (managerStore) {
        setCurrentLoja(managerStore);
        window.location.hash = `#/${managerStore.slug_url}/admin`;
      }
    }
  }, [loggedGerente, lojasList]);

  // Load products
  useEffect(() => {
    async function loadProducts() {
      if (currentLoja) {
        const prods = await fetchProdutosByLoja(currentLoja.id);
        setProdutos(prods);
      }
    }
    loadProducts();
    setCart([]);
  }, [currentLoja, triggerRefreshProducts]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = (produto: Produto, quantidade: number, observacoes?: string) => {
    setCart((prevCart) => {
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
    showToast('Pedido finalizado! Redirecionando para o WhatsApp da loja...');
  };

  const handleSelectLojaFromAdmin = (loja: Loja) => {
    setCurrentLoja(loja);
    window.location.hash = `#/${loja.slug_url}`;
    showToast(`Carregando cardápio: ${loja.nome}`, 'info');
  };

  // Toast
  const toastEl = toast && (
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
  );

  // ============================================================
  // ROUTE: /{slug}/admin — Full Admin Panel
  // ============================================================
  if (route.isAdmin && currentLoja) {
    return (
      <div className="bg-slate-900 min-h-screen text-slate-100 font-sans">
        {toastEl}

        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href={`#/${currentLoja.slug_url}`}
              className="text-orange-400 hover:text-orange-300 text-xs font-bold transition"
            >
              ← Ver Cardápio
            </a>
            <span className="text-slate-600">|</span>
            <span className="text-sm font-bold text-white">{currentLoja.nome}</span>
            <span className="bg-orange-500/20 text-orange-400 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] text-slate-400">URL do cardápio:</span>
              <a
                href={`#/${currentLoja.slug_url}`}
                className="text-[10px] font-mono text-orange-400 truncate max-w-[150px]"
              >
                /{currentLoja.slug_url}
              </a>
              <span className="w-px h-4 bg-slate-700" />
              <a
                href={`#/${currentLoja.slug_url}/admin`}
                className="text-[10px] font-mono text-blue-400 truncate max-w-[150px]"
              >
                /{currentLoja.slug_url}/admin
              </a>
            </div>

            <QRCodeDisplay
              url={`${window.location.origin}${window.location.pathname.replace(/\/+$/, '')}/#/${currentLoja.slug_url}`}
              size={80}
            />
          </div>
        </div>

        <div className="overflow-y-auto">
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
      </div>
    );
  }

  // ============================================================
  // ROUTE: /{slug} — Full Customer View (full screen on mobile, phone on desktop)
  // ============================================================
  if (route.slug && currentLoja && !route.isAdmin) {
    return (
      <div className="bg-orange-50 min-h-screen text-gray-900 font-sans selection:bg-orange-200/50">
        {toastEl}

        {/* Desktop nav hint */}
        <div className="hidden lg:flex items-center justify-between px-4 py-2 bg-white border-b border-orange-100">
          <span className="text-xs text-gray-500">{currentLoja.nome}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400">Admin:</span>
            <a
              href={`#/${currentLoja.slug_url}/admin`}
              className="text-[10px] font-bold text-orange-600 hover:text-orange-700 transition"
            >
              {currentLoja.slug_url}/admin →
            </a>
          </div>
        </div>

        <div className="flex-1 flex items-start justify-center">
          <StoreMenu
            loja={currentLoja}
            produtos={produtos}
            cart={cart}
            onAddToCart={handleAddToCart}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenAdmin={() => {
              window.location.hash = `#/${currentLoja.slug_url}/admin`;
            }}
          />
        </div>

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

        <PWAPrompt />
      </div>
    );
  }

  // ============================================================
  // DEFAULT: Desktop Dev Cockpit with Phone Emulation
  // ============================================================
  return (
    <div className="bg-orange-50 min-h-screen text-gray-900 flex flex-col md:flex-row font-sans selection:bg-orange-200/50">
      {toastEl}

      {/* LEFT PANEL: Developer Cockpit */}
      <div className="hidden lg:flex flex-col lg:w-[45%] xl:w-[40%] bg-white border-r border-orange-100 shrink-0 h-screen overflow-y-auto shadow-sm">
        <div className="flex border-b border-orange-100 px-6 py-4 items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500 text-white font-black text-sm">DW</span>
            <span className="font-extrabold text-sm tracking-tight text-gray-900">WhiteLabel<span className="text-orange-500">Delivery</span></span>
          </div>
          <div className="flex gap-1.5">
            <button
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

        {activeTab === 'info' && (
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-orange-600">Visão Geral</span>
              <h2 className="text-xl font-extrabold text-gray-900">Plataforma Whitelabel Mobile-First</h2>
              <p className="text-gray-600 text-xs leading-relaxed">
                Esta solução whitelabel permite que qualquer comércio local tenha um cardápio online com link direto para o WhatsApp.
              </p>
            </div>

            {/* Store Switcher */}
            <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                <h4 className="font-bold text-orange-700 text-xs uppercase tracking-wider">Selecione uma loja:</h4>
              </div>

              {loggedGerente ? (
                <div className="bg-orange-100/50 p-3 rounded-lg border border-orange-200 text-[11px] text-orange-800">
                  <p className="font-bold">🔒 Cardápio travado para Gerente de <strong>{currentLoja?.nome}</strong></p>
                </div>
              ) : (
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
              )}

              {/* URLs for each store */}
              <div className="space-y-1 pt-2 border-t border-orange-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">URLs das Lojas</p>
                {lojasList.map((loja) => (
                  <div key={loja.id} className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-gray-600">{loja.nome}:</span>
                    <div className="flex gap-2">
                      <a
                        href={`#/${loja.slug_url}`}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        /{loja.slug_url}
                      </a>
                      <a
                        href={`#/${loja.slug_url}/admin`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        /{loja.slug_url}/admin
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture info */}
            <div className="space-y-2 pt-2 border-t border-orange-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rotas da Aplicação</h4>
              <ul className="space-y-1.5 text-[11px] text-gray-600">
                <li><strong>/#/{'{slug}'}</strong> → Visão do Cliente (cardápio + PWA)</li>
                <li><strong>/#/{'{slug}'}/admin</strong> → Painel do Gerente (QR Code, produtos, pedidos)</li>
                <li><strong>/#/</strong> (sem hash) → Ambiente de Desenvolvimento</li>
              </ul>
            </div>
          </div>
        )}

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

      {/* RIGHT PANEL: Phone Emulation */}
      <div className="flex-1 flex items-center justify-center p-0 md:p-6 lg:p-8 bg-orange-100/30 border-l border-orange-100 relative h-screen overflow-hidden">
        {currentLoja && (
          <div
            className="absolute w-72 h-72 rounded-full filter blur-[120px] opacity-20 transition-all duration-700"
            style={{ backgroundColor: currentLoja.cor_tema }}
          />
        )}

        {currentLoja ? (
          <div className="relative w-full h-full max-w-md sm:h-[820px] bg-white sm:rounded-[36px] sm:shadow-[0_0_0_12px_#1e293b,0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col transition-all duration-500 border border-orange-100 sm:border-none">
            <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 bg-slate-900 w-36 h-6 rounded-b-2xl z-50 flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-800 mr-2" />
              <span className="w-12 h-1 bg-slate-800 rounded-full" />
            </div>
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

export { parseHash };
