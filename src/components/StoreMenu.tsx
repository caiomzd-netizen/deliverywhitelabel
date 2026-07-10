import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, ShoppingBag, Clock, MapPin, Check, ChevronRight, X } from 'lucide-react';
import { Loja, Produto, CartItem } from '../types';

interface StoreMenuProps {
  loja: Loja;
  produtos: Produto[];
  cart: CartItem[];
  onAddToCart: (produto: Produto, quantidade: number, observacoes?: string) => void;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
}

export default function StoreMenu({
  loja,
  produtos,
  cart,
  onAddToCart,
  onOpenCart,
  onOpenAdmin
}: StoreMenuProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  
  // Product Detail Modal State
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemObs, setItemObs] = useState('');

  // Extract Categories
  const categories = useMemo(() => {
    const list = new Set(produtos.map((p) => p.categoria));
    return ['Todos', ...Array.from(list)];
  }, [produtos]);

  // Filter Products
  const filteredProducts = useMemo(() => {
    return produtos.filter((p) => {
      const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || p.categoria === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [produtos, searchTerm, selectedCategory]);

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantidade, 0);
  const cartTotalPrice = cart.reduce((sum, item) => sum + item.produto.preco * item.quantidade, 0);

  const handleOpenProduct = (produto: Produto) => {
    setSelectedProduct(produto);
    setItemQuantity(1);
    setItemObs('');
  };

  const handleConfirmAdd = () => {
    if (selectedProduct) {
      onAddToCart(selectedProduct, itemQuantity, itemObs.trim());
      setSelectedProduct(null);
    }
  };

  return (
    <div id="store-menu-wrapper" className="bg-orange-50/30 min-h-screen text-gray-800 pb-24 font-sans selection:bg-orange-100/50">
      {/* Banner Capa */}
      <div className="h-44 md:h-56 w-full relative">
        <img
          src={loja.banner}
          alt={loja.nome}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/40 to-black/10" />
        
        {/* Floating Quick Swapping indicator for Admin */}
        <button
          id="btn-admin-floating"
          onClick={onOpenAdmin}
          className="absolute top-3 right-3 bg-white/95 text-gray-900 backdrop-blur-xs text-[10px] uppercase font-black tracking-wider px-3 py-2 rounded-xl hover:bg-orange-50 transition flex items-center gap-1.5 shadow-lg border border-orange-100 cursor-pointer"
        >
          <span>🔧</span> Painel Dev
        </button>
      </div>

      {/* Perfil da Loja */}
      <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-10 animate-fade-in">
        <div className="bg-white rounded-2xl p-5 shadow-xl border border-orange-100/60 flex flex-col items-center sm:items-start sm:flex-row gap-4">
          <img
            src={loja.logo}
            alt={loja.nome}
            className="w-20 h-20 rounded-2xl border-4 border-white object-cover shadow-md -mt-12 sm:-mt-14"
          />
          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 justify-center sm:justify-start">
              <h1 className="text-xl font-extrabold text-gray-950 tracking-tight">{loja.nome}</h1>
              <span className="self-center bg-orange-100 text-orange-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Loja Ativa</span>
            </div>
            
            {loja.endereco_fisico && (
              <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
                <MapPin size={12} className="shrink-0 text-orange-500" />
                {loja.endereco_fisico}
              </p>
            )}

            <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-gray-600 font-medium">
              <span className="flex items-center gap-1 bg-orange-50/50 border border-orange-100/50 px-2.5 py-1 rounded-full">
                <Clock size={12} style={{ color: loja.cor_tema }} />
                {loja.tempo_entrega}
              </span>
              <span className="flex items-center gap-1 bg-orange-50/50 border border-orange-100/50 px-2.5 py-1 rounded-full">
                💰 Entrega: {loja.taxa_entrega === 0 ? 'Grátis' : `R$ ${loja.taxa_entrega.toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-4">
        {/* Campo de Busca */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500/70" size={18} />
          <input
            id="input-menu-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar no cardápio..."
            className="w-full bg-white border border-orange-100 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 shadow-sm placeholder-gray-400"
          />
          {searchTerm && (
            <button
              id="btn-clear-menu-search"
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Categorias Deslizantes */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                id={`btn-category-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  backgroundColor: isSelected ? loja.cor_tema : undefined,
                  borderColor: isSelected ? loja.cor_tema : undefined,
                }}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold border transition ${
                  isSelected
                    ? 'text-white shadow-md scale-102'
                    : 'bg-white text-gray-600 border-orange-100 hover:border-orange-200 hover:bg-orange-50/50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Produtos (Vitrine) */}
      <div className="max-w-2xl mx-auto px-4 mt-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-orange-100 p-6">
            <Search className="mx-auto text-orange-200 mb-3" size={32} />
            <p className="text-gray-500 font-semibold">Nenhum produto encontrado</p>
            <p className="text-gray-400 text-xs mt-1">Tente ajustar os termos da busca ou filtre outra categoria.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Agrupamento Visual por Categoria */}
            {selectedCategory === 'Todos' ? (
              // Mostrar com cabeçalho de categoria
              categories.filter(c => c !== 'Todos').map((cat) => {
                const categoryProducts = filteredProducts.filter((p) => p.categoria === cat);
                if (categoryProducts.length === 0) return null;
                
                return (
                  <div key={cat} className="space-y-3 pt-2">
                    <h2 className="text-xs font-bold text-orange-700/80 uppercase tracking-widest pl-1">{cat}</h2>
                    <div className="grid grid-cols-1 gap-3">
                      {categoryProducts.map((p) => (
                        <div
                          key={p.id}
                          id={`product-card-${p.id}`}
                          onClick={() => handleOpenProduct(p)}
                          className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100/50 flex gap-4 cursor-pointer hover:border-orange-200 hover:shadow-md transition duration-300"
                        >
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h3 className="text-sm font-bold text-gray-900 leading-snug">{p.nome}</h3>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{p.descricao}</p>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-sm font-black" style={{ color: loja.cor_tema }}>
                                R$ {p.preco.toFixed(2)}
                              </span>
                              <button
                                id={`btn-add-product-${p.id}`}
                                type="button"
                                style={{ color: loja.cor_tema, backgroundColor: `${loja.cor_tema}12` }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition transform active:scale-95"
                              >
                                <Plus size={14} />
                                Adicionar
                              </button>
                            </div>
                          </div>
                          
                          <img
                            src={p.imagem}
                            alt={p.nome}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-gray-100 shrink-0 self-center border border-orange-50"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              // Mostrar sem agrupamento porque já filtramos uma específica
              <div className="grid grid-cols-1 gap-3">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    id={`product-card-${p.id}`}
                    onClick={() => handleOpenProduct(p)}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100/50 flex gap-4 cursor-pointer hover:border-orange-200 hover:shadow-md transition duration-300 animate-fade-in"
                  >
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 leading-snug">{p.nome}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{p.descricao}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-black" style={{ color: loja.cor_tema }}>
                          R$ {p.preco.toFixed(2)}
                        </span>
                        <button
                          id={`btn-add-product-${p.id}`}
                          type="button"
                          style={{ color: loja.cor_tema, backgroundColor: `${loja.cor_tema}12` }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition transform active:scale-95"
                        >
                          <Plus size={14} />
                          Adicionar
                        </button>
                      </div>
                    </div>
                    
                    <img
                      src={p.imagem}
                      alt={p.nome}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-gray-100 shrink-0 self-center border border-orange-50"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Bottom Bar (Carrinho) */}
      {cartTotalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-100 to-transparent pointer-events-none z-40">
          <div className="max-w-2xl mx-auto pointer-events-auto">
            <button
              id="btn-floating-cart-bar"
              onClick={onOpenCart}
              style={{ backgroundColor: loja.cor_tema }}
              className="w-full flex items-center justify-between text-white font-bold px-5 py-4 rounded-2xl shadow-xl transition transform active:scale-[0.99] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="bg-white/20 px-2.5 py-1 rounded-lg text-xs font-extrabold">
                  {cartTotalItems} {cartTotalItems === 1 ? 'item' : 'itens'}
                </span>
                <span className="text-xs font-semibold text-white/90">Ver Carrinho</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold">R$ {cartTotalPrice.toFixed(2)}</span>
                <ChevronRight size={16} />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Product Customization Modal */}
      {selectedProduct && (
        <div id="product-detail-modal-container" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <div 
            id="product-backdrop"
            onClick={() => setSelectedProduct(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Box */}
          <div 
            id="product-detail-modal"
            className="relative bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col z-10 animate-slide-in-up"
          >
            <button
              id="btn-close-product-modal"
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
            >
              <X size={18} />
            </button>

            <img
              src={selectedProduct.imagem}
              alt={selectedProduct.nome}
              className="w-full h-48 sm:h-56 object-cover"
            />

            <div className="p-5 flex-1 space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                  {selectedProduct.categoria}
                </span>
                <h3 className="text-lg font-extrabold text-gray-900 mt-1">{selectedProduct.nome}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{selectedProduct.descricao}</p>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-xs font-bold text-gray-400 uppercase">Preço</span>
                <span className="text-lg font-extrabold" style={{ color: loja.cor_tema }}>
                  R$ {selectedProduct.preco.toFixed(2)}
                </span>
              </div>

              {/* Observação */}
              <div className="space-y-1">
                <label htmlFor="input-obs" className="block text-xs font-bold text-gray-600 uppercase">Observações</label>
                <textarea
                  id="input-obs"
                  rows={2}
                  value={itemObs}
                  onChange={(e) => setItemObs(e.target.value)}
                  placeholder="Ex: sem cebola, ponto da carne, etc..."
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder-gray-400 resize-none"
                />
              </div>

              {/* Controles de Quantidade e Confirmar */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                  <button
                    id="btn-modal-quantity-minus"
                    type="button"
                    onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                    className="p-2.5 text-gray-500 hover:text-gray-800 transition"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-3 text-sm font-extrabold text-gray-800">{itemQuantity}</span>
                  <button
                    id="btn-modal-quantity-plus"
                    type="button"
                    onClick={() => setItemQuantity(itemQuantity + 1)}
                    className="p-2.5 text-gray-500 hover:text-gray-800 transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  id="btn-modal-add-to-cart"
                  onClick={handleConfirmAdd}
                  style={{ backgroundColor: loja.cor_tema }}
                  className="flex-1 text-white font-bold py-3 px-4 rounded-xl shadow-md transition transform active:scale-98 text-xs cursor-pointer"
                >
                  Adicionar • R$ {(selectedProduct.preco * itemQuantity).toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
