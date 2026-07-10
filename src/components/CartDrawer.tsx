import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, MapPin, Store, CreditCard, DollarSign, Send, MessageSquare, AlertCircle } from 'lucide-react';
import { CartItem, Pedido, Loja } from '../types';
import { savePedido } from '../supabase';

interface CartDrawerProps {
  loja: Loja;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onClose: () => void;
  onOrderCompleted: () => void;
}

export default function CartDrawer({
  loja,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onClose,
  onOrderCompleted
}: CartDrawerProps) {
  // Form States
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState<'entrega' | 'retirada'>('entrega');
  
  // Address States
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [complemento, setComplemento] = useState('');
  const [cidade, setCidade] = useState('São Paulo, SP');

  // Payment States
  const [formaPagamento, setFormaPagamento] = useState<'pix' | 'dinheiro'>('pix');
  const [trocoPara, setTrocoPara] = useState('');

  // Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = cartItems.reduce((acc, item) => acc + item.produto.preco * item.quantidade, 0);
  const taxaEntrega = tipoEntrega === 'entrega' ? loja.taxa_entrega : 0;
  const total = subtotal + taxaEntrega;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    
    // Validation
    if (!nome.trim()) {
      setError('Por favor, informe seu nome.');
      return;
    }
    if (!telefone.trim() || telefone.length < 10) {
      setError('Por favor, informe um telefone/WhatsApp válido.');
      return;
    }

    if (tipoEntrega === 'entrega') {
      if (!rua.trim() || !numero.trim() || !bairro.trim()) {
        setError('Por favor, preencha todos os campos obrigatórios do endereço (Rua, Número e Bairro).');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    const pedido: Pedido = {
      loja_id: loja.id,
      dados_cliente: {
        nome,
        telefone,
        tipo_entrega: tipoEntrega,
        ...(tipoEntrega === 'entrega' ? {
          endereco: { rua, numero, bairro, complemento, cidade }
        } : {}),
        forma_pagamento: formaPagamento,
        ...(formaPagamento === 'dinheiro' && trocoPara ? { troco_para: trocoPara } : {})
      },
      itens_pedido: cartItems.map(item => ({
        produto_id: item.produto.id,
        nome: item.produto.nome,
        quantidade: item.quantidade,
        preco_unitario: item.produto.preco,
        total_item: item.produto.preco * item.quantidade,
        observacoes: item.observacoes
      })),
      subtotal,
      taxa_entrega: taxaEntrega,
      total,
      status: 'pendente'
    };

    const res = await savePedido(pedido);

    if (res.success) {
      // Formatar mensagem para WhatsApp
      const msg = formatWhatsAppMessage(loja, pedido);
      const encodedMsg = encodeURIComponent(msg);
      
      // WhatsApp redirect link
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${loja.telefone_whatsapp}&text=${encodedMsg}`;
      
      onClearCart();
      onOrderCompleted();
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } else {
      setError(res.error || 'Ocorreu um erro ao salvar o pedido no banco de dados.');
      setIsSubmitting(false);
    }
  };

  // Helper formatting for WhatsApp message
  const formatWhatsAppMessage = (loja: Loja, ped: Pedido): string => {
    const dc = ped.dados_cliente;
    const itemsStr = ped.itens_pedido.map(it => {
      let itemLine = `*${it.quantidade}x* ${it.nome} - R$ ${it.total_item.toFixed(2)}`;
      if (it.observacoes) {
        itemLine += `\n   _(Obs: ${it.observacoes})_`;
      }
      return itemLine;
    }).join('\n');

    let addressStr = '';
    if (dc.tipo_entrega === 'entrega' && dc.endereco) {
      addressStr = `*Endereço para Entrega:*\n📍 Rua: ${dc.endereco.rua}, Nº ${dc.endereco.numero}\nBairro: ${dc.endereco.bairro}\n`;
      if (dc.endereco.complemento) {
        addressStr += `Comp: ${dc.endereco.complemento}\n`;
      }
      addressStr += `Cidade: ${dc.endereco.cidade}\n`;
    } else {
      addressStr = `*Retirada no Balcão:*\n🏪 Loja: ${loja.nome}\n📍 Endereço: ${loja.endereco_fisico || 'Retirar no endereço da loja'}\n`;
    }

    const paymentStr = `*Forma de Pagamento:*\n💳 ${dc.forma_pagamento.toUpperCase()}${
      dc.forma_pagamento === 'dinheiro' && dc.troco_para ? ` (Troco para R$ ${dc.troco_para})` : ''
    }`;

    return `*Novo Pedido de Delivery! 🛍️*
---------------------------------------
🔔 *Cliente:* ${dc.nome}
📱 *WhatsApp:* ${dc.telefone}
---------------------------------------
🛒 *Itens do Pedido:*\n${itemsStr}
---------------------------------------
${addressStr}---------------------------------------
${paymentStr}
---------------------------------------
Subtotal: R$ ${ped.subtotal.toFixed(2)}
Taxa de Entrega: ${ped.taxa_entrega === 0 ? 'Grátis' : `R$ ${ped.taxa_entrega.toFixed(2)}`}
*Total Geral: R$ ${ped.total.toFixed(2)}*
---------------------------------------
_Pedido gerado via Plataforma Delivery Whitelabel_`;
  };

  return (
    <div id="cart-drawer-container" className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        id="cart-backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div 
        id="cart-drawer-panel"
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in-right"
      >
        {/* Header */}
        <div className="px-4 py-4 border-b border-orange-100 flex items-center justify-between bg-orange-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-gray-950 tracking-tight">Seu Carrinho</h2>
            <span className="bg-orange-100 text-orange-700 text-xs px-2.5 py-0.5 rounded-full font-black">
              {cartItems.reduce((sum, item) => sum + item.quantidade, 0)}
            </span>
          </div>
          <button 
            id="btn-close-cart"
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-orange-100 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
          {/* Cart Items List */}
          {cartItems.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Trash2 className="mx-auto mb-3 text-orange-200" size={40} />
              <p className="text-sm font-semibold text-gray-500">Carrinho vazio</p>
              <p className="text-xs mt-1 text-gray-400">Adicione alguns produtos para iniciar o pedido.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-orange-700/80 uppercase tracking-widest">Itens Selecionados</h3>
              {cartItems.map((item) => (
                <div 
                  key={item.produto.id} 
                  id={`cart-item-${item.produto.id}`}
                  className="flex items-start gap-3 p-3 bg-white rounded-xl border border-orange-100/60 shadow-xs"
                >
                  <img
                    src={item.produto.imagem}
                    alt={item.produto.nome}
                    className="w-14 h-14 object-cover rounded-lg bg-gray-100 border border-orange-50"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-950 truncate leading-snug">{item.produto.nome}</h4>
                    <p className="text-xs text-orange-600 font-extrabold mt-0.5">R$ {item.produto.preco.toFixed(2)}</p>
                    
                    {item.observacoes && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 rounded px-2 py-0.5 mt-1.5 border border-amber-100/70 inline-block truncate max-w-full">
                        Obs: "{item.observacoes}"
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2.5">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-orange-100 bg-orange-50/20 rounded-lg">
                        <button
                          id={`btn-cart-minus-${item.produto.id}`}
                          type="button"
                          onClick={() => onUpdateQuantity(item.produto.id, -1)}
                          className="p-1 text-gray-500 hover:text-gray-700 transition"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-2 text-xs font-black text-gray-800">{item.quantidade}</span>
                        <button
                          id={`btn-cart-plus-${item.produto.id}`}
                          type="button"
                          onClick={() => onUpdateQuantity(item.produto.id, 1)}
                          className="p-1 text-gray-500 hover:text-gray-700 transition"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        id={`btn-cart-remove-${item.produto.id}`}
                        type="button"
                        onClick={() => onRemoveItem(item.produto.id)}
                        className="text-gray-400 hover:text-rose-500 p-1 rounded transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Checkout Form */}
          {cartItems.length > 0 && (
            <form onSubmit={handleSubmit} className="space-y-5 pt-4 border-t border-orange-100">
              {/* Seção Dados Pessoais */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-orange-700/80 uppercase tracking-widest">Identificação</h3>
                <div>
                  <label htmlFor="input-nome" className="block text-xs font-bold text-gray-700 mb-1">Seu Nome *</label>
                  <input
                    id="input-nome"
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: João Silva"
                    className="w-full text-sm border border-orange-100 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>
                <div>
                  <label htmlFor="input-phone" className="block text-xs font-bold text-gray-700 mb-1">WhatsApp / Telefone *</label>
                  <input
                    id="input-phone"
                    type="tel"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="Ex: (11) 99999-8888"
                    className="w-full text-sm border border-orange-100 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>
              </div>

              {/* Seção Tipo de Entrega */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-orange-700/80 uppercase tracking-widest">Como deseja receber?</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    id="btn-opt-entrega"
                    type="button"
                    onClick={() => setTipoEntrega('entrega')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition ${
                      tipoEntrega === 'entrega'
                        ? 'border-gray-950 bg-gray-950 text-white shadow-md'
                        : 'border-orange-100 bg-white text-gray-700 hover:bg-orange-50/50'
                    }`}
                  >
                    <MapPin size={16} />
                    Entrega
                  </button>
                  <button
                    id="btn-opt-retirada"
                    type="button"
                    onClick={() => setTipoEntrega('retirada')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition ${
                      tipoEntrega === 'retirada'
                        ? 'border-gray-950 bg-gray-950 text-white shadow-md'
                        : 'border-orange-100 bg-white text-gray-700 hover:bg-orange-50/50'
                    }`}
                  >
                    <Store size={16} />
                    Retirar
                  </button>
                </div>

                {/* Bloco de Endereço se entrega */}
                {tipoEntrega === 'entrega' && (
                  <div className="space-y-3 p-3 bg-orange-50/30 rounded-xl border border-orange-100/70 animate-fade-in">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label htmlFor="input-rua" className="block text-[10px] font-bold text-gray-500 uppercase">Rua *</label>
                        <input
                          id="input-rua"
                          type="text"
                          required
                          value={rua}
                          onChange={(e) => setRua(e.target.value)}
                          placeholder="Rua..."
                          className="w-full text-xs border border-orange-100 bg-white px-2.5 py-1.5 rounded-lg mt-0.5 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="input-numero" className="block text-[10px] font-bold text-gray-500 uppercase">Número *</label>
                        <input
                          id="input-numero"
                          type="text"
                          required
                          value={numero}
                          onChange={(e) => setNumero(e.target.value)}
                          placeholder="123"
                          className="w-full text-xs border border-orange-100 bg-white px-2.5 py-1.5 rounded-lg mt-0.5 focus:outline-none"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="input-bairro" className="block text-[10px] font-bold text-gray-500 uppercase">Bairro *</label>
                        <input
                          id="input-bairro"
                          type="text"
                          required
                          value={bairro}
                          onChange={(e) => setBairro(e.target.value)}
                          placeholder="Bairro..."
                          className="w-full text-xs border border-orange-100 bg-white px-2.5 py-1.5 rounded-lg mt-0.5 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="input-complemento" className="block text-[10px] font-bold text-gray-500 uppercase">Complemento</label>
                        <input
                          id="input-complemento"
                          type="text"
                          value={complemento}
                          onChange={(e) => setComplemento(e.target.value)}
                          placeholder="Apto/Bloco"
                          className="w-full text-xs border border-orange-100 bg-white px-2.5 py-1.5 rounded-lg mt-0.5 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="input-cidade" className="block text-[10px] font-bold text-gray-500 uppercase">Cidade / Estado</label>
                      <input
                        id="input-cidade"
                        type="text"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        placeholder="São Paulo, SP"
                        className="w-full text-xs border border-orange-100 bg-white px-2.5 py-1.5 rounded-lg mt-0.5 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Seção Forma de Pagamento */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-orange-700/80 uppercase tracking-widest">Forma de Pagamento</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    id="btn-opt-pix"
                    type="button"
                    onClick={() => setFormaPagamento('pix')}
                    className={`flex items-center justify-center gap-1.5 p-3 rounded-xl border text-sm font-bold transition ${
                      formaPagamento === 'pix'
                        ? 'border-orange-500 bg-orange-50 text-orange-950 shadow-2xs'
                        : 'border-orange-100 bg-white text-gray-700 hover:bg-orange-50/50'
                    }`}
                  >
                    <CreditCard size={15} />
                    Pix (Na entrega)
                  </button>
                  <button
                    id="btn-opt-dinheiro"
                    type="button"
                    onClick={() => setFormaPagamento('dinheiro')}
                    className={`flex items-center justify-center gap-1.5 p-3 rounded-xl border text-sm font-bold transition ${
                      formaPagamento === 'dinheiro'
                        ? 'border-orange-500 bg-orange-50 text-orange-950 shadow-2xs'
                        : 'border-orange-100 bg-white text-gray-700 hover:bg-orange-50/50'
                    }`}
                  >
                    <DollarSign size={15} />
                    Dinheiro
                  </button>
                </div>

                {/* Troco para dinheiro */}
                {formaPagamento === 'dinheiro' && (
                  <div className="p-3 bg-orange-50/30 rounded-xl border border-orange-100/70 animate-fade-in">
                    <label htmlFor="input-troco" className="block text-[10px] font-bold text-gray-500 uppercase">Precisa de troco para quanto?</label>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-400 font-bold mr-1.5">R$</span>
                      <input
                        id="input-troco"
                        type="text"
                        value={trocoPara}
                        onChange={(e) => setTrocoPara(e.target.value)}
                        placeholder="Deixe vazio se não precisar"
                        className="w-full text-xs border border-orange-100 bg-white px-2.5 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Erro */}
              {error && (
                <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-800 text-xs leading-relaxed animate-shake">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Totais do Pedido */}
              <div className="bg-orange-50/40 rounded-2xl p-4 border border-orange-100/75 space-y-2 text-xs">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-700">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Taxa de Entrega</span>
                  <span className="font-bold text-gray-700">
                    {taxaEntrega === 0 ? 'Grátis' : `R$ ${taxaEntrega.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-extrabold text-gray-900 pt-2 border-t border-orange-100">
                  <span>Total Geral</span>
                  <span className="text-base font-black text-orange-600">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Botão de Confirmação */}
              <button
                id="btn-submit-order"
                type="submit"
                disabled={isSubmitting}
                style={{ backgroundColor: loja.cor_tema }}
                className="w-full flex items-center justify-center gap-2 text-white font-black py-3.5 px-4 rounded-xl shadow-lg cursor-pointer disabled:opacity-50 transition transform active:scale-98 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando Pedido...
                  </>
                ) : (
                  <>
                    <MessageSquare size={17} />
                    Finalizar e Enviar no WhatsApp
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
