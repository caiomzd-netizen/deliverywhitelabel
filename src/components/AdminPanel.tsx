import React, { useState, useEffect } from 'react';
import { 
  Database, Copy, Check, Info, FileText, ToggleLeft, ShoppingBag, 
  Plus, Trash2, UserPlus, Settings, Layers, Sparkles, Filter, 
  Activity, CheckCircle2, ChevronRight, RefreshCw, Percent, QrCode,
  Smartphone, ExternalLink, LayoutDashboard, Bell, Clock, 
  ArrowRight, XCircle, Package
} from 'lucide-react';
import QRCodeDisplay from './QRCodeDisplay';
import { SQL_SCHEMA_SCRIPT, DEMO_PRODUTOS, DEFAULT_HORARIO } from '../data';
import {
  isSupabaseConfigured, fetchPedidosLocais, getCustomLojas,
  saveCustomLoja, getCustomProdutos, saveCustomProduto, deleteCustomProduto,
  getCustomGerentes, saveCustomGerente, updatePedidoStatusLocal,
  getCustomAtendentes, saveCustomAtendente
} from '../supabase';
import { Pedido, Loja, Produto, Gerente, HorarioFuncionamento, HorarioDia } from '../types';

interface AdminPanelProps {
  currentLoja: Loja;
  onSelectLoja: (loja: Loja) => void;
  onClose?: () => void;
  activeOrderCount: number;
  triggerRefreshOrders?: boolean;
  lojasList: Loja[];
  onRefreshLojas: () => void;
  onRefreshProducts: () => void;
  loggedGerente: Gerente | null;
  onLoggedGerenteChange: (gerente: Gerente | null) => void;
}

export default function AdminPanel({
  currentLoja,
  onSelectLoja,
  activeOrderCount,
  triggerRefreshOrders,
  lojasList,
  onRefreshLojas,
  onRefreshProducts,
  loggedGerente,
  onLoggedGerenteChange
}: AdminPanelProps) {
  // Tabs for the administration panel
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lojas' | 'produtos' | 'pedidos' | 'sql'>('dashboard');
  const [copied, setCopied] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Role is now determined by loggedGerente: master admin (null) or gerente (non-null)

  // --- Form States for New Store ---
  const [novaLojaNome, setNovaLojaNome] = useState('');
  const [novaLojaSlug, setNovaLojaSlug] = useState('');
  const [novaLojaNiche, setNovaLojaNiche] = useState('distribuidora_bebidas');
  const [novaLojaWhatsApp, setNovaLojaWhatsApp] = useState('5511999998888');
  const [novaLojaEndereco, setNovaLojaEndereco] = useState('');
  const [novaLojaTaxa, setNovaLojaTaxa] = useState('5.00');
  const [novaLojaTempo, setNovaLojaTempo] = useState('25-40 min');
  const [novaLojaCor, setNovaLojaCor] = useState('#f97316'); // default orange-500
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [customBannerUrl, setCustomBannerUrl] = useState('');
  const [novaLojaPwaIcon, setNovaLojaPwaIcon] = useState('');

  // --- Store configuration editing state ---
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [storeFormNome, setStoreFormNome] = useState('');
  const [storeFormSlug, setStoreFormSlug] = useState('');
  const [storeFormLogo, setStoreFormLogo] = useState('');
  const [storeFormBanner, setStoreFormBanner] = useState('');
  const [storeFormWhatsApp, setStoreFormWhatsApp] = useState('');
  const [storeFormEndereco, setStoreFormEndereco] = useState('');
  const [storeFormTaxa, setStoreFormTaxa] = useState('');
  const [storeFormTempo, setStoreFormTempo] = useState('');
  const [storeFormCor, setStoreFormCor] = useState('#f97316');
  const [storeFormNiche, setStoreFormNiche] = useState('hamburgueria');
  const [storeFormPwaIcon, setStoreFormPwaIcon] = useState('');
  const [storeFormHorario, setStoreFormHorario] = useState<HorarioFuncionamento>(DEFAULT_HORARIO);

  // --- Form States for Products ---
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [prodNome, setProdNome] = useState('');
  const [prodDescricao, setProdDescricao] = useState('');
  const [prodPreco, setProdPreco] = useState('');
  const [prodCategoria, setProdCategoria] = useState('');
  const [prodImagem, setProdImagem] = useState('');
  const [prodDisponivel, setProdDisponivel] = useState(true);
  const [prodEstoque, setProdEstoque] = useState('25');

  // --- Form States for Manager Creation ---
  const [novaLojaGerenteNome, setNovaLojaGerenteNome] = useState('');
  const [novaLojaGerenteEmail, setNovaLojaGerenteEmail] = useState('');
  const [novaLojaGerenteSenha, setNovaLojaGerenteSenha] = useState('');

  // --- Form States for Attendant Creation ---
  const [atendenteNome, setAtendenteNome] = useState('');
  const [atendenteEmail, setAtendenteEmail] = useState('');
  const [atendenteSenha, setAtendenteSenha] = useState('');
  const [atendentesList, setAtendentesList] = useState<Gerente[]>([]);

  // --- Login States ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- Manager List & Sync ---
  const [gerentesList, setGerentesList] = useState<Gerente[]>([]);

  useEffect(() => {
    setGerentesList(getCustomGerentes());
    setAtendentesList(getCustomAtendentes());
  }, []);

  // Load orders
  useEffect(() => {
    async function loadPedidos() {
      const p = await fetchPedidosLocais();
      setPedidos(p);
    }
    loadPedidos();
  }, [activeOrderCount, triggerRefreshOrders, activeTab]);

  const isGerente = !!loggedGerente;

  const handleRegisterAtendente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!atendenteNome || !atendenteEmail || !atendenteSenha) {
      alert('Preencha todos os dados do atendente.');
      return;
    }
    const novo: Gerente = {
      id: `atd-custom-${Date.now()}`,
      nome: atendenteNome,
      email: atendenteEmail.trim().toLowerCase(),
      senha: atendenteSenha,
      loja_id: currentLoja.id
    };
    saveCustomAtendente(novo);
    setAtendentesList(getCustomAtendentes());
    setAtendenteNome('');
    setAtendenteEmail('');
    setAtendenteSenha('');
    alert(`Atendente "${novo.nome}" cadastrado com sucesso!`);
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Niche templates for brand assets and preset product templates
  const NICHE_PRESETS: Record<string, { logo: string; banner: string; categories: string[]; name: string }> = {
    distribuidora_bebidas: {
      name: 'Distribuidora de Bebidas',
      logo: 'https://images.unsplash.com/photo-1597262975002-c5c3b14bb34e?w=150&h=150&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1471421298428-1513ab720a8e?w=800&auto=format&fit=crop&q=80',
      categories: ['Cervejas', 'Destilados', 'Sem Álcool', 'Petiscos e Gelo']
    },
    distribuidora_gas_agua: {
      name: 'Distribuidora de Gás & Água',
      logo: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=150&h=150&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
      categories: ['Água Mineral', 'Gás de Cozinha', 'Acessórios']
    },
    restaurante: {
      name: 'Restaurante / Gourmet',
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&h=150&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80',
      categories: ['Pratos Executivos', 'Porções', 'Bebidas', 'Sobremesas']
    },
    hamburgueria: {
      name: 'Hamburgueria Artesanal',
      logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&h=150&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
      categories: ['Hambúrgueres', 'Acompanhamentos', 'Bebidas']
    },
    mini_mercado: {
      name: 'Mini Mercado / Conveniência',
      logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&h=150&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
      categories: ['Padaria & Matinais', 'Mercearia Fina', 'Limpeza & Higiene']
    }
  };

  // Color theme choices
  const COLOR_THEMES = [
    { hex: '#f97316', label: 'Laranja Distribuidora' },
    { hex: '#e11d48', label: 'Vermelho Burguer' },
    { hex: '#16a34a', label: 'Verde Natural' },
    { hex: '#2563eb', label: 'Azul Comercial' },
    { hex: '#4f46e5', label: 'Índigo Tech' },
    { hex: '#d97706', label: 'Amber Gás/Água' },
    { hex: '#7c3aed', label: 'Roxo Lounge' },
  ];

  // Auto-generate slug when typing store name
  const handleNomeChange = (val: string) => {
    setNovaLojaNome(val);
    const generated = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^a-z0-9\s-]/g, '') // remove special characters
      .trim()
      .replace(/\s+/g, '-');
    setNovaLojaSlug(generated);
  };

  // Register New Store / Business
  const handleRegisterLoja = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaLojaNome || !novaLojaSlug) return;

    if (!novaLojaGerenteNome || !novaLojaGerenteEmail || !novaLojaGerenteSenha) {
      alert('⚠️ Por favor, preencha todos os dados de acesso do Gerente! O cadastro do gerente é obrigatório para esta loja local.');
      return;
    }

    const preset = NICHE_PRESETS[novaLojaNiche];

    const nova: Loja = {
      id: `loja-custom-${Date.now()}`,
      nome: novaLojaNome,
      slug_url: novaLojaSlug,
      logo: customLogoUrl || preset.logo,
      banner: customBannerUrl || preset.banner,
      cor_tema: novaLojaCor,
      telefone_whatsapp: novaLojaWhatsApp.replace(/\D/g, ''),
      endereco_fisico: novaLojaEndereco || 'Disponível na sua região',
      taxa_entrega: parseFloat(novaLojaTaxa) || 0,
      tempo_entrega: novaLojaTempo,
      ativo: true,
      niche: novaLojaNiche,
      pwa_icon_url: novaLojaPwaIcon || undefined
    };

    saveCustomLoja(nova);

    // Save mandatory manager user
    const novoGerente: Gerente = {
      id: `ger-custom-${Date.now()}`,
      nome: novaLojaGerenteNome,
      email: novaLojaGerenteEmail.trim().toLowerCase(),
      senha: novaLojaGerenteSenha,
      loja_id: nova.id
    };
    saveCustomGerente(novoGerente);
    setGerentesList(getCustomGerentes());

    onRefreshLojas();
    onSelectLoja(nova);

    // Register preset starter products for this store niche to make the experience instant!
    createStarterProducts(nova.id, novaLojaNiche);

    // Reset Form
    setNovaLojaNome('');
    setNovaLojaSlug('');
    setNovaLojaEndereco('');
    setCustomLogoUrl('');
    setCustomBannerUrl('');
    setNovaLojaPwaIcon('');
    setNovaLojaGerenteNome('');
    setNovaLojaGerenteEmail('');
    setNovaLojaGerenteSenha('');
    
    alert(`🎉 Loja "${nova.nome}" cadastrada com sucesso!\n👤 Gerente cadastrado: ${novoGerente.nome} (${novoGerente.email})\nUse estas credenciais para logar no portal do parceiro.`);
  };

  // Starter products to fill the catalog of the newly created store automatically
  const createStarterProducts = (lojaId: string, niche: string) => {
    let starters: Omit<Produto, 'id' | 'loja_id'>[] = [];

    if (niche === 'distribuidora_bebidas') {
      starters = [
        {
          nome: 'Pack Heineken Lata 350ml (12 un)',
          descricao: 'Cerveja puro malte Heineken fardo com 12 latas. Trincando de gelada!',
          preco: 58.90,
          imagem: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop&q=80',
          categoria: 'Cervejas',
          disponivel: true
        },
        {
          nome: 'Refrigerante Coca-Cola 2 Litros',
          descricao: 'Coca-Cola embalagem retornável/pet 2L bem gelada para o seu churrasco.',
          preco: 11.50,
          imagem: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop&q=80',
          categoria: 'Sem Álcool',
          disponivel: true
        },
        {
          nome: 'Saco de Gelo Filtro 5kg',
          descricao: 'Gelo em cubos cristalinos de água filtrada, ideal para drinks.',
          preco: 12.00,
          imagem: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=400&h=300&fit=crop&q=80',
          categoria: 'Petiscos e Gelo',
          disponivel: true
        }
      ];
    } else if (niche === 'distribuidora_gas_agua') {
      starters = [
        {
          nome: 'Galão de Água Mineral 20L (Retornável)',
          descricao: 'Água mineral leve de fonte purificada. Necessário garrafão vazio.',
          preco: 14.00,
          imagem: 'https://images.unsplash.com/photo-1548839140-29a849356628?w=400&h=300&fit=crop&q=80',
          categoria: 'Água Mineral',
          disponivel: true
        },
        {
          nome: 'Carga de Gás de Cozinha P13',
          descricao: 'Gás de cozinha GLP cilindro de 13kg oficial, lacrado e com selo de segurança.',
          preco: 115.00,
          imagem: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=300&fit=crop&q=80',
          categoria: 'Gás de Cozinha',
          disponivel: true
        }
      ];
    } else if (niche === 'mini_mercado') {
      starters = [
        {
          nome: 'Pão de Forma Pullman Clássico 450g',
          descricao: 'Pão de forma tradicional Pullman, super macio e fofinho, ideal para torradas.',
          preco: 7.90,
          imagem: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&q=80',
          categoria: 'Padaria & Matinais',
          disponivel: true
        },
        {
          nome: 'Leite Integral Longa Vida Piracanjuba 1L',
          descricao: 'Leite UHT integral de alta qualidade fortificado com vitaminas A e D.',
          preco: 5.49,
          imagem: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop&q=80',
          categoria: 'Padaria & Matinais',
          disponivel: true
        },
        {
          nome: 'Arroz Agulhinha Tipo 1 Prato Fino 5kg',
          descricao: 'Arroz branco Tipo 1, grãos selecionados e polidos, fica super soltinho.',
          preco: 29.90,
          imagem: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&q=80',
          categoria: 'Mercearia Fina',
          disponivel: true
        },
        {
          nome: 'Detergente Líquido de Coco Ypê 500ml',
          descricao: 'Detergente líquido de coco com alto rendimento para remoção de gorduras.',
          preco: 2.49,
          imagem: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop&q=80',
          categoria: 'Limpeza & Higiene',
          disponivel: true
        }
      ];
    } else {
      // General Restaurant
      starters = [
        {
          nome: 'Prato Feito Especial Executivo',
          descricao: 'Arroz soltinho, feijão caseiro, fritas crocantes, salada mista e grelhado premium.',
          preco: 24.90,
          imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80',
          categoria: 'Pratos Executivos',
          disponivel: true
        },
        {
          nome: 'Porção Batata Frita com Queijo e Bacon',
          descricao: 'Batata frita palito crocante coberta com cheddar cremoso derretido e bacon bits.',
          preco: 32.00,
          imagem: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop&q=80',
          categoria: 'Porções',
          disponivel: true
        }
      ];
    }

    starters.forEach((p, idx) => {
      saveCustomProduto({
        ...p,
        id: `prod-auto-${lojaId}-${idx}-${Date.now()}`,
        loja_id: lojaId
      });
    });

    onRefreshProducts();
  };

  // Add or Edit Product
  const handleSaveProduto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNome || !prodPreco || !prodCategoria) {
      alert('Por favor, preencha Nome, Preço e Categoria do produto!');
      return;
    }

    const defaultImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80';

    const p: Produto = {
      id: editingProduto ? editingProduto.id : `prod-custom-${Date.now()}`,
      loja_id: currentLoja.id,
      nome: prodNome,
      descricao: prodDescricao,
      preco: parseFloat(prodPreco) || 0,
      imagem: prodImagem || defaultImg,
      categoria: prodCategoria,
      disponivel: prodDisponivel,
      estoque: parseInt(prodEstoque) || 0
    };

    saveCustomProduto(p);
    onRefreshProducts();
    
    // Reset Form
    setEditingProduto(null);
    setProdNome('');
    setProdDescricao('');
    setProdPreco('');
    setProdCategoria('');
    setProdImagem('');
    setProdDisponivel(true);
    setProdEstoque('25');

    alert(`📦 Produto salvo com sucesso! Confira na simulação do cardápio mobile ao lado.`);
  };

  const handleEditClick = (p: Produto) => {
    setEditingProduto(p);
    setProdNome(p.nome);
    setProdDescricao(p.descricao);
    setProdPreco(p.preco.toString());
    setProdCategoria(p.categoria);
    setProdImagem(p.imagem);
    setProdDisponivel(p.disponivel);
    setProdEstoque((p.estoque ?? 25).toString());
    // Scroll form into view
    document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Tem certeza que deseja remover este produto do cardápio?')) {
      deleteCustomProduto(id);
      onRefreshProducts();
    }
  };

  const handleResetProductForm = () => {
    setEditingProduto(null);
    setProdNome('');
    setProdDescricao('');
    setProdPreco('');
    setProdCategoria('');
    setProdImagem('');
    setProdDisponivel(true);
    setProdEstoque('25');
  };

  const handleImportPredefinedMenu = () => {
    if (!confirm('Importar cardápio pré-definido com base no segmento da loja? Isso adicionará produtos de exemplo ao cardápio atual.')) return;
    const segmentKey = currentLoja.niche || 'hamburgueria';
    const demo: Produto[] = DEMO_PRODUTOS.map((p) => ({
      ...p,
      id: `prod-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      loja_id: currentLoja.id,
    }));
    demo.forEach((p) => saveCustomProduto(p));
    onRefreshProducts();
    alert(`Cardápio pré-definido importado com sucesso (${demo.length} produtos)!`);
  };

  // Get active products for this store
  // Since we also have demo products loaded in app, let's grab the custom ones or the active product list
  const activeNichePreset = Object.keys(NICHE_PRESETS).find(
    (k) => currentLoja.nome.toLowerCase().includes('burguer') && k === 'hamburgueria' ||
           currentLoja.nome.toLowerCase().includes('pizza') && k === 'restaurante'
  ) || 'distribuidora_bebidas';

  const handleUpdateStatus = (pedidoId: string, novoStatus: Pedido['status']) => {
    const updated = updatePedidoStatusLocal(pedidoId, novoStatus);
    if (updated) {
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoId ? { ...p, status: novoStatus } : p))
      );
    }
  };

  const renderPedidosTab = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
          <ShoppingBag size={15} className="text-orange-400" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-100">Pedidos</h3>
          <p className="text-[11px] text-slate-500">Pedidos processados pelo carrinho de compras</p>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-800/80 rounded-2xl bg-slate-900/20">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="text-slate-500" size={28} />
          </div>
          <p className="text-slate-400 text-sm font-semibold">Nenhum pedido recebido</p>
          <p className="text-slate-500 text-xs mt-1">Simule uma compra no cardápio mobile ao lado!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((p, idx) => renderPedidoCard(p, idx))}
        </div>
      )}
    </div>
  );

  const renderPedidoCard = (p: Pedido, idx: number) => (
    <div key={p.id || idx} className="bg-slate-800/50 border border-slate-800/70 rounded-2xl overflow-hidden group hover:border-slate-700/60 transition-all">
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-900/40 border-b border-slate-800/60">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-[11px] text-indigo-400/80 font-semibold truncate">{p.id}</span>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border flex items-center gap-1 ${getStatusColor(p.status)}`}>
            {p.status}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-slate-500 bg-slate-900/40 px-2 py-1 rounded-lg">
            {p.criado_em ? new Date(p.criado_em).toLocaleTimeString('pt-BR') : 'Agora'}
          </span>
          <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-lg ${p.dados_cliente.tipo_entrega === 'entrega' ? 'bg-blue-950/40 text-blue-300' : 'bg-violet-950/40 text-violet-300'}`}>
            {p.dados_cliente.tipo_entrega === 'entrega' ? '🚚 Entrega' : '🏪 Retirada'}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900/30 rounded-xl p-3">
            <div className="text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-1.5 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-slate-500" /> Cliente
            </div>
            <div className="text-slate-100 font-semibold">{p.dados_cliente.nome}</div>
            <div className="text-slate-400 mt-0.5">{p.dados_cliente.telefone}</div>
            {p.dados_cliente.tipo_entrega === 'entrega' && p.dados_cliente.endereco && (
              <div className="text-slate-500 text-[10px] leading-snug mt-2 pt-2 border-t border-slate-800/40">
                {p.dados_cliente.endereco.rua}, {p.dados_cliente.endereco.numero} - {p.dados_cliente.endereco.bairro}
                {p.dados_cliente.endereco.complemento && ` (${p.dados_cliente.endereco.complemento})`}
                <br />
                {p.dados_cliente.endereco.cidade}
              </div>
            )}
          </div>

          <div className="bg-slate-900/30 rounded-xl p-3">
            <div className="text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-1.5 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-slate-500" /> Pagamento
            </div>
            <div className="text-slate-200 capitalize">
              <span className="text-slate-400">Forma:</span> <span className="font-semibold">{p.dados_cliente.forma_pagamento === 'pix' ? '💳 Pix' : '💵 Dinheiro'}</span>
            </div>
            {p.dados_cliente.troco_para && (
              <div className="text-amber-400 text-[10px] mt-0.5">Troco para: R$ {p.dados_cliente.troco_para}</div>
            )}
            <div className="mt-3 pt-2 border-t border-slate-800/40 space-y-0.5">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-300">R$ {p.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Taxa Entrega</span>
                <span className="text-slate-300">R$ {p.taxa_entrega.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800/40">
                <span className="font-bold text-slate-300">Total</span>
                <span className="font-black text-orange-400 tabular-nums">R$ {p.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/30 rounded-xl p-3">
          <div className="text-slate-500 font-bold uppercase tracking-wider text-[9px] mb-2 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-slate-500" /> Itens ({p.itens_pedido.length})
          </div>
          <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
            {p.itens_pedido.map((it, itemIdx) => (
              <div key={itemIdx} className="flex justify-between items-start text-[11px] text-slate-300 py-1 border-b border-slate-800/30 last:border-b-0">
                <span>
                  <strong className="text-orange-400 font-mono">{it.quantidade}x</strong> {it.nome}
                  {it.observacoes && (
                    <span className="block text-slate-600 italic font-sans pl-4 text-[10px]">Obs: "{it.observacoes}"</span>
                  )}
                </span>
                <span className="font-semibold text-slate-200 tabular-nums shrink-0 ml-2">R$ {it.total_item.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {p.status !== 'entregue' && p.status !== 'cancelado' && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            {p.status === 'pendente' && (
              <button onClick={() => handleUpdateStatus(p.id, 'preparando')} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition">
                <Activity size={13} /> Iniciar Preparo
              </button>
            )}
            {p.status === 'preparando' && (
              <button onClick={() => handleUpdateStatus(p.id, 'saiu_entrega')} className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition">
                <ArrowRight size={13} /> Marcar Saiu p/ Entrega
              </button>
            )}
            {p.status === 'saiu_entrega' && (
              <button onClick={() => handleUpdateStatus(p.id, 'entregue')} className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition">
                <CheckCircle2 size={13} /> Confirmar Entrega
              </button>
            )}
            {p.status !== 'cancelado' && (
              <button onClick={() => handleUpdateStatus(p.id, 'cancelado')} className="bg-rose-800/50 hover:bg-rose-800 text-rose-200 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition ml-auto">
                <XCircle size={13} /> Cancelar Pedido
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div id="admin-panel" className="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Superior */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 via-slate-800/40 to-slate-900/80 border border-slate-700/60 p-5 md:p-6">
          <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between relative">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-extrabold text-xs tracking-widest shadow-lg shadow-orange-500/20">
                  PORTAL PARCEIRO
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Whitelabel SaaS</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-100">
                Painel de Gestão <span className="bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">Whitelabel</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Gerencie lojas, usuários, cardápios e acompanhe pedidos em tempo real.
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">

            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isSupabaseConfigured 
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' 
                : 'bg-amber-950/40 text-amber-400 border-amber-800/60'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isSupabaseConfigured ? 'Supabase Conectado' : 'Modo Local Ativo'}
            </span>
          </div>
        </div>
        </div>

        {/* QR Code + URLs da Loja Ativa */}
        {currentLoja && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-800/10 border border-slate-700/60 p-5 md:p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="flex flex-col items-center gap-2 relative">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">QR Code</span>
              <div className="bg-white rounded-2xl p-2 shadow-xl shadow-black/20">
                <QRCodeDisplay
                  url={`${window.location.origin}/#/${currentLoja.slug_url}`}
                  size={110}
                  label="Compartilhe com seus clientes!"
                />
              </div>
            </div>
            <div className="flex-1 space-y-3 relative">
              <div>
                <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                    <Smartphone size={14} className="text-orange-400" />
                  </div>
                  {currentLoja.nome}
                </h4>
                <p className="text-[10px] text-slate-500 mt-1">
                  Links de acesso direto:
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-slate-950/70 px-4 py-2.5 rounded-xl border border-slate-700/50 group hover:border-slate-600/60 transition-colors">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider w-14 shrink-0">Cliente</span>
                  <a
                    href={`#/${currentLoja.slug_url}`}
                    className="text-xs font-mono text-orange-300 hover:text-orange-200 truncate flex-1"
                  >
                    /{currentLoja.slug_url}
                  </a>
                  <ExternalLink size={12} className="text-slate-600 group-hover:text-slate-400 transition shrink-0" />
                </div>
                <div className="flex items-center gap-3 bg-slate-950/70 px-4 py-2.5 rounded-xl border border-slate-700/50 group hover:border-slate-600/60 transition-colors">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider w-14 shrink-0">Admin</span>
                  <a
                    href={`#/${currentLoja.slug_url}/admin`}
                    className="text-xs font-mono text-blue-300 hover:text-blue-200 truncate flex-1"
                  >
                    /{currentLoja.slug_url}/admin
                  </a>
                  <ExternalLink size={12} className="text-slate-600 group-hover:text-slate-400 transition shrink-0" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Informações Whitelabel para oferecer a Distribuidoras e Comércios */}
        {!isGerente && <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/20 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <h4 className="font-bold text-orange-400 flex items-center gap-1.5">
              <Sparkles size={14} /> Foco em Distribuidoras
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Distribuidoras de bebidas/gás operam sob alto volume de pedidos imediatos. O link direto para o WhatsApp agiliza sem exigir cadastro burocrático de aplicativo.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-orange-400 flex items-center gap-1.5">
              <Percent size={14} /> Economia de Taxas
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Ao oferecer o Whitelabel, o restaurante ou distribuidora economiza até 30% em relação às taxas das grandes plataformas centralizadoras de delivery.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-orange-400 flex items-center gap-1.5">
              <Layers size={14} /> Multi-Inquilino (SaaS)
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Você pode vender esse sistema como um serviço mensal (SaaS). Cada cliente tem sua URL e painel próprio, rodando na mesma infraestrutura!
            </p>
          </div>
        </div>}

        {/* Tabs de Navegação */}
        <div className="flex overflow-x-auto border-b border-slate-800/60 gap-1 scrollbar-none pb-0.5 bg-slate-800/10 rounded-t-xl px-1 pt-1">
          <button
            id="tab-dashboard"
            onClick={() => { setActiveTab('dashboard'); handleResetProductForm(); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-orange-400 shadow-sm shadow-black/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>

          <button
            id="tab-lojas"
            onClick={() => { setActiveTab('lojas'); handleResetProductForm(); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'lojas'
                ? 'bg-slate-800 text-orange-400 shadow-sm shadow-black/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <ToggleLeft size={16} />
            Lojas & Usuários ({lojasList.length})
          </button>
          
          <button
            id="tab-produtos"
            onClick={() => setActiveTab('produtos')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'produtos'
                ? 'bg-slate-800 text-orange-400 shadow-sm shadow-black/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Plus size={16} />
            Cardápio & Produtos
          </button>

          <button
            id="tab-pedidos"
            onClick={() => { setActiveTab('pedidos'); handleResetProductForm(); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all relative whitespace-nowrap ${
              activeTab === 'pedidos'
                ? 'bg-slate-800 text-orange-400 shadow-sm shadow-black/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <ShoppingBag size={16} />
            Pedidos
            {pedidos.length > 0 && (
              <span className="bg-orange-500 text-white text-[9px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1">
                {pedidos.length}
              </span>
            )}
          </button>

          {!isGerente && (
            <button
              id="tab-sql"
              onClick={() => { setActiveTab('sql'); handleResetProductForm(); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'sql'
                  ? 'bg-slate-800 text-orange-400 shadow-sm shadow-black/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <FileText size={16} />
              SQL
            </button>
          )}
        </div>

        {/* ==================== TAB CONTENT: DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <DashboardView
            loja={currentLoja}
            pedidos={pedidos}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {/* ==================== TAB CONTENT: LOJAS & USUARIOS ==================== */}
        {activeTab === 'lojas' && (
          <div className="space-y-6">
            
            {/* Seção de Cadastro de Novo Usuário / Comerciante */}
            {!isGerente ? (
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800/80 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <UserPlus className="text-orange-500" size={18} />
                  <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">Cadastrar Nova Distribuidora ou Restaurante (Parceiro)</h3>
                </div>

                <form onSubmit={handleRegisterLoja} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome da Loja */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Nome Comercial *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Adega do Gordo, Gas Express"
                      value={novaLojaNome}
                      onChange={(e) => handleNomeChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Slug URL */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Link URL do Cardápio (Slug) *</label>
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                      <span className="text-slate-500 text-xs pr-1 font-mono">#/</span>
                      <input
                        type="text"
                        required
                        placeholder="adega-gordo"
                        value={novaLojaSlug}
                        onChange={(e) => setNovaLojaSlug(e.target.value)}
                        className="w-full bg-transparent border-none text-xs focus:outline-none text-orange-400 font-mono"
                      />
                    </div>
                  </div>

                  {/* Niche select */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Segmento / Tipo de Comércio</label>
                    <select
                      value={novaLojaNiche}
                      onChange={(e) => setNovaLojaNiche(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none text-slate-300"
                    >
                      <option value="distribuidora_bebidas">🍺 Distribuidora de Bebidas (Cervejas, Gelo)</option>
                      <option value="distribuidora_gas_agua">🔥 Distribuidora de Gás & Água Mineral</option>
                      <option value="mini_mercado">🛒 Mini Mercado / Conveniência</option>
                      <option value="restaurante">🍲 Restaurante / Delivery Gourmet</option>
                      <option value="hamburgueria">🍔 Hamburgueria Artesanal / Lanchonete</option>
                    </select>
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">WhatsApp para Receber Pedidos *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 5511999998888 (com DDI + DDD)"
                      value={novaLojaWhatsApp}
                      onChange={(e) => setNovaLojaWhatsApp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none text-slate-300"
                    />
                  </div>

                  {/* Endereço */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Endereço Físico (Opcional - Exibe no topo do menu)</label>
                    <input
                      type="text"
                      placeholder="Ex: Av. Brasil, 1500 - Centro, São Paulo"
                      value={novaLojaEndereco}
                      onChange={(e) => setNovaLojaEndereco(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  {/* Taxa de Entrega e Tempo */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Taxa de Entrega (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="5.00"
                      value={novaLojaTaxa}
                      onChange={(e) => setNovaLojaTaxa(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Tempo Médio de Entrega</label>
                    <input
                      type="text"
                      placeholder="Ex: 30-45 min"
                      value={novaLojaTempo}
                      onChange={(e) => setNovaLojaTempo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  {/* Seleção de Cor Tema */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Selecione a Cor da Marca (Identidade Visual)</label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_THEMES.map((theme) => (
                        <button
                          key={theme.hex}
                          type="button"
                          onClick={() => setNovaLojaCor(theme.hex)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition ${
                            novaLojaCor === theme.hex
                              ? 'border-white bg-slate-800 text-white shadow-md'
                              : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: theme.hex }} />
                          {theme.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PWA Icon URL */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Ícone PWA (URL) — Opcional</label>
                    <input
                      type="text"
                      placeholder="https://... (deixe vazio para usar o ícone padrão)"
                      value={novaLojaPwaIcon}
                      onChange={(e) => setNovaLojaPwaIcon(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <p className="text-[10px] text-slate-500">Ícone exibido quando o cliente instalar o app (PWA) no celular.</p>
                  </div>

                  {/* Dados de Acesso do Gerente */}
                  <div className="md:col-span-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-2 pb-3">
                      <UserPlus className="text-orange-500" size={16} />
                      <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">Dados de Acesso do Gerente da Loja (obrigatório)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase">Nome do Gerente *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: João Silva"
                          value={novaLojaGerenteNome}
                          onChange={(e) => setNovaLojaGerenteNome(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase">Email do Gerente *</label>
                        <input
                          type="email"
                          required
                          placeholder="gerente@email.com"
                          value={novaLojaGerenteEmail}
                          onChange={(e) => setNovaLojaGerenteEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase">Senha do Gerente *</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••"
                          value={novaLojaGerenteSenha}
                          onChange={(e) => setNovaLojaGerenteSenha(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-3 flex justify-end">
                    <button
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider py-3 px-6 rounded-xl flex items-center gap-2 cursor-pointer transition shadow-lg"
                    >
                      <UserPlus size={16} />
                      Criar Negócio & Gerar Cardápio Ativo
                    </button>
                  </div>
                </form>
              </div>
            ) : isGerente && (
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800/80 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <UserPlus className="text-orange-500" size={18} />
                  <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">Cadastrar Atendente (Apenas visualiza pedidos)</h3>
                </div>
                <form onSubmit={handleRegisterAtendente} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Nome *</label>
                    <input type="text" required placeholder="Ex: Maria" value={atendenteNome} onChange={(e) => setAtendenteNome(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Email *</label>
                    <input type="email" required placeholder="maria@email.com" value={atendenteEmail} onChange={(e) => setAtendenteEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Senha *</label>
                    <input type="password" required placeholder="••••••" value={atendenteSenha} onChange={(e) => setAtendenteSenha(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500" />
                  </div>
                  <div className="md:col-span-3 pt-2 flex justify-end">
                    <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl flex items-center gap-2 cursor-pointer transition shadow-lg">
                      <UserPlus size={15} /> Cadastrar Atendente
                    </button>
                  </div>
                </form>
                {atendentesList.filter((a) => a.loja_id === currentLoja.id).length > 0 && (
                  <div className="pt-2 border-t border-slate-800">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-2">Atendentes cadastrados:</h4>
                    <div className="space-y-1.5">
                      {atendentesList.filter((a) => a.loja_id === currentLoja.id).map((a) => (
                        <div key={a.id} className="text-xs text-slate-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          {a.nome} — <span className="text-slate-500">{a.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Lista de Lojas — Configuração de Clientes para Admin Master */}
            {!isGerente && <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Configuração de Clientes ({lojasList.length})</h3>
                <span className="text-[10px] text-orange-400 font-bold">Gerencie dados de cada loja</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {lojasList.map((loja) => {
                  const isSelected = currentLoja.id === loja.id;
                  const storeGerente = gerentesList.find((g) => g.loja_id === loja.id);
                  const isEditing = editingStoreId === loja.id;
                  return (
                    <div
                      key={loja.id}
                      className={`rounded-xl overflow-hidden border transition-all ${
                        isEditing
                          ? 'border-orange-500 ring-2 ring-orange-500/30 bg-slate-800/60'
                          : isSelected
                            ? 'border-orange-500/50 bg-slate-800/40'
                            : 'border-slate-800 bg-slate-900/60'
                      }`}
                    >
                      {!isEditing ? (
                        <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <img src={loja.logo} alt={loja.nome} className="w-12 h-12 rounded-full object-cover border border-white/20 shrink-0" />
                            <div className="min-w-0">
                              <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                                {loja.nome}
                                {isSelected && <span className="bg-orange-500 text-[8px] text-white font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">Ativo</span>}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono truncate">/{loja.slug_url}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                WhatsApp: <span className="text-slate-300">{loja.telefone_whatsapp}</span>
                                <span className="mx-1.5">•</span>
                                R$ {loja.taxa_entrega.toFixed(2)} • {loja.tempo_entrega}
                              </div>
                              {storeGerente && (
                                <div className="text-[11px] text-orange-400/70 mt-0.5">
                                  Gerente: {storeGerente.nome} ({storeGerente.email})
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStoreId(loja.id);
                                setStoreFormNome(loja.nome);
                                setStoreFormSlug(loja.slug_url);
                                setStoreFormLogo(loja.logo);
                                setStoreFormBanner(loja.banner);
                                setStoreFormWhatsApp(loja.telefone_whatsapp);
                                setStoreFormEndereco(loja.endereco_fisico || '');
                                setStoreFormTaxa(loja.taxa_entrega.toString());
                                setStoreFormTempo(loja.tempo_entrega);
                                setStoreFormCor(loja.cor_tema);
                                setStoreFormNiche(loja.niche || 'hamburgueria');
                                setStoreFormPwaIcon(loja.pwa_icon_url || '');
                                setStoreFormHorario(loja.horario_funcionamento || DEFAULT_HORARIO);
                              }}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg transition cursor-pointer border border-slate-700/50"
                            >
                              Configurar
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectLoja(loja)}
                              className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                                isSelected
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              {isSelected ? 'Menu Carregado' : 'Carregar Menu'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-5 space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <h4 className="font-extrabold text-sm text-orange-400 uppercase tracking-wider flex items-center gap-2">
                              <Settings size={16} /> Configuração: {loja.nome}
                            </h4>
                            <button
                              type="button"
                              onClick={() => setEditingStoreId(null)}
                              className="text-[10px] text-slate-400 hover:text-slate-200 font-bold px-2 py-1 rounded-lg transition cursor-pointer"
                            >
                              Fechar
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase">Nome</label>
                              <input type="text" value={storeFormNome} onChange={(e) => setStoreFormNome(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase">Slug (URL)</label>
                              <input type="text" value={storeFormSlug} onChange={(e) => setStoreFormSlug(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs font-mono text-orange-300" />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase">WhatsApp</label>
                              <input type="text" value={storeFormWhatsApp} onChange={(e) => setStoreFormWhatsApp(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase">Logo (URL)</label>
                              <input type="text" value={storeFormLogo} onChange={(e) => setStoreFormLogo(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase">Banner (URL)</label>
                              <input type="text" value={storeFormBanner} onChange={(e) => setStoreFormBanner(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase">Segmento</label>
                              <select value={storeFormNiche} onChange={(e) => setStoreFormNiche(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300">
                                <option value="distribuidora_bebidas">Distribuidora de Bebidas</option>
                                <option value="distribuidora_gas_agua">Gás & Água</option>
                                <option value="mini_mercado">Mini Mercado</option>
                                <option value="restaurante">Restaurante</option>
                                <option value="hamburgueria">Hamburgueria</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase">Endereço</label>
                              <input type="text" value={storeFormEndereco} onChange={(e) => setStoreFormEndereco(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase">Taxa Entrega (R$)</label>
                              <input type="number" step="0.01" value={storeFormTaxa} onChange={(e) => setStoreFormTaxa(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase">Tempo Entrega</label>
                              <input type="text" value={storeFormTempo} onChange={(e) => setStoreFormTempo(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase">Cor Tema (hex)</label>
                              <div className="flex gap-2 items-center">
                                <input type="color" value={storeFormCor} onChange={(e) => setStoreFormCor(e.target.value)} className="w-9 h-9 rounded-lg border border-slate-800 bg-transparent cursor-pointer" />
                                <input type="text" value={storeFormCor} onChange={(e) => setStoreFormCor(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs font-mono" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase">Ícone PWA (URL)</label>
                              <input type="text" value={storeFormPwaIcon} onChange={(e) => setStoreFormPwaIcon(e.target.value)} placeholder="https://..." className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs" />
                            </div>
                          </div>

                          {/* Horário de Funcionamento */}
                          <div className="pt-2 border-t border-slate-800">
                            <div className="flex items-center justify-between mb-3">
                              <label className="block text-[11px] font-bold text-slate-400 uppercase">Horário de Funcionamento</label>
                              <button
                                type="button"
                                onClick={() => setStoreFormHorario(DEFAULT_HORARIO)}
                                className="text-[10px] text-slate-500 hover:text-orange-300 font-bold transition"
                              >
                                Restaurar Padrão
                              </button>
                            </div>
                            <div className="space-y-2">
                              {(['seg','ter','qua','qui','sex','sab','dom'] as (keyof HorarioFuncionamento)[]).map((dia) => {
                                const cfg = storeFormHorario[dia];
                                const labelMap: Record<string, string> = {
                                  seg: 'Segunda', ter: 'Terça', qua: 'Quarta', qui: 'Quinta',
                                  sex: 'Sexta', sab: 'Sábado', dom: 'Domingo',
                                };
                                const updateDia = (patch: Partial<HorarioDia>) => {
                                  setStoreFormHorario((prev) => ({
                                    ...prev,
                                    [dia]: { ...prev[dia], ...patch },
                                  }));
                                };
                                return (
                                  <div key={dia} className="flex items-center gap-3 bg-slate-950/40 rounded-xl px-3 py-2">
                                    <button
                                      type="button"
                                      onClick={() => updateDia({ aberto: !cfg.aberto })}
                                      className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors shrink-0 ${cfg.aberto ? 'bg-orange-500' : 'bg-slate-700'}`}
                                    >
                                      <span className={`inline-block h-3 w-3 rounded-full bg-white transition-all ${cfg.aberto ? 'ml-3.5' : 'ml-0.5'}`} />
                                    </button>
                                    <span className="text-[11px] font-bold text-slate-300 w-16 shrink-0 capitalize">{labelMap[dia]}</span>
                                    <input
                                      type="time"
                                      disabled={!cfg.aberto}
                                      value={cfg.inicio}
                                      onChange={(e) => updateDia({ inicio: e.target.value })}
                                      className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200 disabled:opacity-40 disabled:text-slate-600"
                                    />
                                    <span className="text-slate-600 text-[10px]">às</span>
                                    <input
                                      type="time"
                                      disabled={!cfg.aberto}
                                      value={cfg.fim}
                                      onChange={(e) => updateDia({ fim: e.target.value })}
                                      className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200 disabled:opacity-40 disabled:text-slate-600"
                                    />
                                    <span className={`ml-auto text-[10px] font-bold ${cfg.aberto ? 'text-green-400' : 'text-rose-400'}`}>
                                      {cfg.aberto ? 'Aberto' : 'Fechado'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {storeGerente && (
                            <div className="pt-3 border-t border-slate-800 text-xs text-slate-400">
                              Gerente vinculado: <span className="text-orange-300 font-semibold">{storeGerente.nome}</span> — <span className="text-slate-400">{storeGerente.email}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setEditingStoreId(null)}
                              className="text-xs text-slate-400 hover:text-slate-200 font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated: Loja = {
                                  ...loja,
                                  nome: storeFormNome,
                                  slug_url: storeFormSlug,
                                  logo: storeFormLogo,
                                  banner: storeFormBanner,
                                  telefone_whatsapp: storeFormWhatsApp.replace(/\D/g, ''),
                                  endereco_fisico: storeFormEndereco || 'Disponível na sua região',
                                  taxa_entrega: parseFloat(storeFormTaxa) || 0,
                                  tempo_entrega: storeFormTempo,
                                  cor_tema: storeFormCor,
                                  niche: storeFormNiche,
                                  pwa_icon_url: storeFormPwaIcon || undefined,
                                  horario_funcionamento: storeFormHorario,
                                };
                                saveCustomLoja(updated);
                                onRefreshLojas();
                                setEditingStoreId(null);
                                alert(`Configurações de "${updated.nome}" salvas com sucesso!`);
                              }}
                              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition cursor-pointer shadow-lg flex items-center gap-2"
                            >
                              <Check size={15} /> Salvar Configurações
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>}

          </div>
        )}

        {/* ==================== TAB CONTENT: PRODUTOS ==================== */}
        {activeTab === 'produtos' && (
          <div className="space-y-6">
            
            {/* Form de Cadastro / Edição de Produto */}
            <div id="product-form" className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Plus className="text-orange-500" size={18} />
                  <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">
                    {editingProduto ? `Editar Produto: ${editingProduto.nome}` : `Cadastrar Produto no Cardápio`}
                  </h3>
                </div>
                {editingProduto && (
                  <button
                    type="button"
                    onClick={handleResetProductForm}
                    className="text-xs bg-slate-950 text-slate-400 px-2.5 py-1 rounded-lg hover:text-slate-200"
                  >
                    Cancelar Edição
                  </button>
                )}
              </div>

              {/* Dica de segmentação */}
              <div className="p-3 rounded-lg bg-orange-950/20 text-[11px] text-orange-300 flex items-center gap-2">
                <Sparkles size={14} className="shrink-0" />
                <span>Você está inserindo produtos para a loja ativa <strong>{currentLoja.nome}</strong>. Cadastre categorias congruentes como <em>"Bebidas", "Combos", "Água", "Gás", "Hambúrgueres"</em> etc.</span>
              </div>

              <form onSubmit={handleSaveProduto} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Heineken Garrafa 600ml, Hambúrguer Smash"
                    value={prodNome}
                    onChange={(e) => setProdNome(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Categoria */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Categoria *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Cervejas, Hambúrgueres, Água, Gás"
                    value={prodCategoria}
                    onChange={(e) => setProdCategoria(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Preço */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Preço de Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 14.90"
                    value={prodPreco}
                    onChange={(e) => setProdPreco(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Imagem */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">URL da Imagem (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Cole um link de imagem do Unsplash ou deixe vazio"
                    value={prodImagem}
                    onChange={(e) => setProdImagem(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Descrição / Ingredientes / Detalhes</label>
                  <textarea
                    rows={2}
                    placeholder="Descreva o produto, volume, se acompanha gelo, ingredientes de hambúrguer ou acessórios inclusos."
                    value={prodDescricao}
                    onChange={(e) => setProdDescricao(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Disponibilidade */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="checkbox-disponivel"
                    checked={prodDisponivel}
                    onChange={(e) => setProdDisponivel(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-orange-500 focus:ring-orange-500"
                  />
                  <label htmlFor="checkbox-disponivel" className="text-xs text-slate-300 font-bold select-none cursor-pointer">
                    Produto disponível para venda imediata
                  </label>
                </div>

                <div className="md:col-span-2 pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider py-3 px-6 rounded-xl flex items-center gap-2 cursor-pointer transition shadow-lg"
                  >
                    {editingProduto ? 'Salvar Alterações' : 'Cadastrar no Cardápio'}
                  </button>
                </div>
              </form>
            </div>

            {/* Importar cardápio pré-definido */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleImportPredefinedMenu}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer transition border border-slate-700/50"
              >
                <Package size={15} />
                Importar Cardápio Pré-definido
              </button>
            </div>

            {/* Listagem de Produtos Cadastrados da Loja Ativa */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cardápio Atual: {currentLoja.nome}</h3>
                  <p className="text-[11px] text-slate-500">Veja abaixo os itens cadastrados nessa filial. Você pode editá-los ou removê-los.</p>
                </div>
              </div>

              {/* Buscador de produtos para gerenciar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquisar entre os produtos cadastrados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none"
                />
              </div>

              {/* Simular produtos (Puxando de DEMO_PRODUTOS + Customizados de localStorage) */}
              <ProductsCatalogList 
                lojaId={currentLoja.id}
                searchTerm={searchTerm}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                lojaCor={currentLoja.cor_tema}
              />
            </div>

          </div>
        )}

        {/* ==================== TAB CONTENT: PEDIDOS RECEBIDOS ==================== */}
        {activeTab === 'pedidos' && renderPedidosTab()}

        {/* ==================== TAB CONTENT: SQL SCRIPT ==================== */}
        {activeTab === 'sql' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-200">Script de Tabelas Supabase</h3>
                <p className="text-xs text-slate-400">Cole este script no Editor SQL do seu projeto Supabase para configurar as tabelas com integridade referencial.</p>
              </div>
              <button
                id="btn-copy-sql"
                onClick={handleCopySQL}
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copiado!' : 'Copiar SQL'}
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-[11px] font-mono leading-relaxed text-slate-300 max-h-[450px]">
              <pre id="sql-script-container">{SQL_SCHEMA_SCRIPT}</pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function getStatusColor(status: Pedido['status']) {
  switch (status) {
    case 'pendente': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'preparando': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'saiu_entrega': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'entregue': return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelado': return 'bg-rose-100 text-rose-800 border-rose-200';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// Subcomponent: Dashboard de Acompanhamento de Pedidos
interface DashboardViewProps {
  loja: Loja;
  pedidos: Pedido[];
  onUpdateStatus: (pedidoId: string, novoStatus: Pedido['status']) => void;
}

function DashboardView({ loja, pedidos, onUpdateStatus }: DashboardViewProps) {
  const [notifyToggle, setNotifyToggle] = useState(() => localStorage.getItem('delivery_whitelabel_notify_new') === 'true');
  const FILA_STATUS: Pedido['status'][] = ['pendente', 'preparando', 'saiu_entrega', 'entregue'];

  const pedidosLoja = pedidos.filter((p) => p.loja_id === loja.id);
  const pendentes = pedidosLoja.filter((p) => p.status === 'pendente');
  const preparando = pedidosLoja.filter((p) => p.status === 'preparando');
  const saiuEntrega = pedidosLoja.filter((p) => p.status === 'saiu_entrega');
  const entreguesHoje = pedidosLoja.filter(
    (p) => p.status === 'entregue' && p.criado_em &&
      new Date(p.criado_em).toDateString() === new Date().toDateString()
  );
  const cancelados = pedidosLoja.filter((p) => p.status === 'cancelado');

  const activeOrders = [...pendentes, ...preparando, ...saiuEntrega];

  const nextStatus = (atual: Pedido['status']): Pedido['status'] | null => {
    const idx = FILA_STATUS.indexOf(atual);
    if (idx === -1 || idx >= FILA_STATUS.length - 1) return null;
    return FILA_STATUS[idx + 1];
  };

  const timeSince = (dateStr?: string) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Agora';
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    return `${h}h ${min % 60}min`;
  };

  const statusConfig: Record<Pedido['status'], { label: string; bg: string; dot: string; icon: React.ReactNode }> = {
    pendente: { label: 'Pendente', bg: 'bg-amber-950/30 border-amber-800/40', dot: 'bg-amber-400', icon: <Clock size={14} /> },
    preparando: { label: 'Preparando', bg: 'bg-blue-950/30 border-blue-800/40', dot: 'bg-blue-400', icon: <Activity size={14} /> },
    saiu_entrega: { label: 'Saiu p/ Entrega', bg: 'bg-indigo-950/30 border-indigo-800/40', dot: 'bg-indigo-400', icon: <ArrowRight size={14} /> },
    entregue: { label: 'Entregue', bg: 'bg-green-950/30 border-green-800/40', dot: 'bg-green-400', icon: <CheckCircle2 size={14} /> },
    cancelado: { label: 'Cancelado', bg: 'bg-rose-950/30 border-rose-800/40', dot: 'bg-rose-400', icon: <XCircle size={14} /> },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="Pendentes" value={pendentes.length} color="text-amber-400" bg="bg-amber-950/20" icon={<Clock size={18} />} dot="bg-amber-400" />
        <SummaryCard label="Preparando" value={preparando.length} color="text-blue-400" bg="bg-blue-950/20" icon={<Activity size={18} />} dot="bg-blue-400" />
        <SummaryCard label="Saiu Entrega" value={saiuEntrega.length} color="text-indigo-400" bg="bg-indigo-950/20" icon={<ArrowRight size={18} />} dot="bg-indigo-400" />
        <SummaryCard label="Entregues Hoje" value={entreguesHoje.length} color="text-green-400" bg="bg-green-950/20" icon={<CheckCircle2 size={18} />} dot="bg-green-400" />
        <SummaryCard label="Cancelados" value={cancelados.length} color="text-rose-400" bg="bg-rose-950/20" icon={<XCircle size={18} />} dot="bg-rose-400" />
        <SummaryCard label="Total" value={pedidosLoja.length} color="text-slate-100" bg="bg-slate-800/40" icon={<ShoppingBag size={18} />} dot="bg-slate-400" />
      </div>

      {/* Active Orders */}
      <div className="bg-slate-800/20 rounded-2xl border border-slate-800/50 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30">
              <Bell size={16} className="text-orange-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">Pedidos Ativos</h3>
              <p className="text-[10px] text-slate-500">{activeOrders.length} aguardando ação</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Notificar</span>
              <button
                type="button"
                role="switch"
                aria-checked={notifyToggle}
                onClick={() => {
                  const next = !notifyToggle;
                  setNotifyToggle(next);
                  localStorage.setItem('delivery_whitelabel_notify_new', String(next));
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  notifyToggle ? 'bg-orange-500' : 'bg-slate-700'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-all ${notifyToggle ? 'ml-[1.125rem]' : 'ml-0.5'}`} />
              </button>
            </label>
            <span className="text-[10px] text-slate-600 font-mono">{pedidosLoja.length} total</span>
          </div>
        </div>

        {activeOrders.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800/80 rounded-xl bg-slate-900/20">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="text-green-400" size={28} />
            </div>
            <p className="text-slate-300 text-sm font-semibold">Nenhum pedido ativo</p>
            <p className="text-slate-500 text-xs mt-1">Pedidos pendentes aparecerão aqui em tempo real.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((p) => {
              const cfg = statusConfig[p.status];
              const next = nextStatus(p.status);
              return (
                <div key={p.id} className={`${cfg.bg} border rounded-2xl overflow-hidden group`}>
                  {/* Colored top bar */}
                  <div className={`h-1 w-full ${cfg.dot.replace('bg-', 'bg-').replace('400', '500')}`} />
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot} animate-ping absolute opacity-30`} />
                        <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot} relative`} />
                        <span className="font-mono text-[10px] text-slate-500 truncate">{p.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border flex items-center gap-1.5 ${getStatusColor(p.status)}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 bg-slate-900/40 px-2 py-1 rounded-lg">
                          <Clock size={10} />
                          {timeSince(p.criado_em)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(p.id!, 'cancelado')}
                          className="p-1.5 rounded-lg text-rose-400/60 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                          title="Cancelar Pedido"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-900/30 rounded-xl p-3">
                        <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider flex items-center gap-1.5 mb-1.5">
                          <span className="w-1 h-1 rounded-full bg-slate-500" /> Cliente
                        </span>
                        <p className="font-semibold text-slate-100">{p.dados_cliente.nome}</p>
                        <p className="text-slate-400 text-[11px] mt-0.5">{p.dados_cliente.telefone}</p>
                      </div>
                      <div className="bg-slate-900/30 rounded-xl p-3">
                        <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider flex items-center gap-1.5 mb-1.5">
                          <span className="w-1 h-1 rounded-full bg-slate-500" /> Itens
                        </span>
                        {p.itens_pedido.slice(0, 3).map((it, i) => (
                          <p key={i} className="text-slate-300 truncate text-[11px]">
                            <span className="text-orange-400 font-mono font-bold">{it.quantidade}x</span> {it.nome}
                          </p>
                        ))}
                        {p.itens_pedido.length > 3 && (
                          <p className="text-slate-600 text-[9px] font-medium mt-0.5">+{p.itens_pedido.length - 3} itens</p>
                        )}
                      </div>
                      <div className="bg-slate-900/30 rounded-xl p-3 flex flex-col justify-center">
                        <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider mb-1">Total</span>
                        <p className="font-black text-lg text-orange-400 tabular-nums">R$ {p.total.toFixed(2)}</p>
                        <span className={`text-[10px] font-medium mt-0.5 ${p.dados_cliente.tipo_entrega === 'entrega' ? 'text-blue-400' : 'text-violet-400'}`}>
                          {p.dados_cliente.tipo_entrega === 'entrega' ? '🚚 Entrega' : '🏪 Retirada'}
                        </span>
                      </div>
                    </div>

                    {/* Quick Status Buttons */}
                    {next && (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/40">
                        <span className="text-[9px] text-slate-600 uppercase font-bold tracking-wider shrink-0">Avançar:</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {FILA_STATUS.slice(FILA_STATUS.indexOf(p.status) + 1).map((st) => {
                            const isNext = st === next;
                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => onUpdateStatus(p.id!, st)}
                                className={`text-[10px] px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isNext
                                    ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20'
                                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                }`}
                              >
                                {statusConfig[st].icon}
                                {statusConfig[st].label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed / Cancelled Orders */}
      {[...entreguesHoje, ...cancelados].length > 0 && (
        <div className="bg-slate-800/10 rounded-2xl border border-slate-800/40 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-500" />
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Finalizados Hoje</h3>
            <span className="text-[10px] text-slate-600 font-mono">({[...entreguesHoje, ...cancelados].length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[...entreguesHoje, ...cancelados].slice(0, 8).map((p) => {
              const cfg = statusConfig[p.status];
              return (
                <div key={p.id} className="bg-slate-800/20 border border-slate-800/50 rounded-xl p-3 flex items-center justify-between group hover:border-slate-700/60 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`h-2 w-2 rounded-full ${cfg.dot} shrink-0`} />
                    <div className="min-w-0">
                      <span className="text-xs text-slate-300 truncate block">{p.dados_cliente.nome}</span>
                      <span className="text-[9px] text-slate-600 font-mono truncate block">{p.id}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-[11px] font-bold text-slate-400 tabular-nums">R$ {p.total.toFixed(2)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${getStatusColor(p.status)}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color, bg, icon, dot }: {
  label: string;
  value: number;
  color: string;
  bg: string;
  icon: React.ReactNode;
  dot: string;
}) {
  const progressColors: Record<string, string> = {
    'text-amber-400': 'bg-amber-500',
    'text-blue-400': 'bg-blue-500',
    'text-indigo-400': 'bg-indigo-500',
    'text-green-400': 'bg-green-500',
    'text-rose-400': 'bg-rose-500',
    'text-slate-100': 'bg-slate-500',
  };
  const barColor = progressColors[color] || 'bg-slate-500';
  const maxVal = Math.max(value, 1);
  const pct = Math.min((value / 50) * 100, 100);
  return (
    <div className={`${bg} border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center text-center gap-1.5 relative overflow-hidden group hover:scale-[1.03] hover:shadow-lg hover:border-slate-700/80 transition-all duration-300 cursor-default`}>
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
      <div className="relative flex flex-col items-center gap-1.5">
        <span className={`${dot} h-2 w-2 rounded-full animate-pulse`} />
        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{label}</span>
        <span className={`text-2xl font-black tabular-nums ${color}`}>{value}</span>
        <span className="text-slate-600/60 text-[9px]">{icon}</span>
        <div className="w-full h-1 bg-slate-900/40 rounded-full mt-1 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

// Subcomponent to fetch and render the current active products list dynamically
interface ProductsCatalogListProps {
  lojaId: string;
  searchTerm: string;
  onEdit: (produto: Produto) => void;
  onDelete: (id: string) => void;
  lojaCor: string;
}

function ProductsCatalogList({ lojaId, searchTerm, onEdit, onDelete, lojaCor }: ProductsCatalogListProps) {
  const [localProds, setLocalProds] = useState<Produto[]>([]);

  useEffect(() => {
    // Collect from both Demo Products and Custom LocalStorage Products
    import('../data').then((m) => {
      const demos = m.DEMO_PRODUTOS;
      const customs = getCustomProdutos();
      const merged = [...demos, ...customs].filter((p) => p.loja_id === lojaId);
      setLocalProds(merged);
    });
  }, [lojaId, searchTerm]);

  // Filter products by search input
  const filtered = localProds.filter(
    (p) => p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
           p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filtered.length === 0) {
    return (
      <div className="text-center py-8 border border-slate-800 rounded-xl bg-slate-900/10 text-xs text-slate-400">
        Nenhum produto cadastrado corresponde aos critérios de busca.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {filtered.map((p) => (
        <div key={p.id} className="group bg-slate-900/60 border border-slate-800/60 rounded-2xl p-3 flex gap-3.5 items-center justify-between hover:border-slate-700/60 hover:bg-slate-900/80 transition-all duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={p.imagem}
                alt={p.nome}
                className="w-14 h-14 rounded-xl object-cover bg-slate-950 border border-slate-700/60"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${p.disponivel ? 'bg-green-400' : 'bg-slate-600'}`} />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-xs text-slate-100 truncate max-w-[180px]">{p.nome}</h4>
                <span className="text-[8px] bg-slate-800/80 px-2 py-0.5 rounded-full text-slate-400 font-bold uppercase tracking-wider border border-slate-700/40">{p.categoria}</span>
                {!p.disponivel && <span className="text-[8px] bg-rose-950/40 text-rose-300 px-1.5 py-0.5 rounded-full font-bold uppercase">Indisponível</span>}
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">{p.descricao || 'Sem descrição'}</p>
              <span className="inline-block text-sm font-black mt-1.5 tabular-nums" style={{ color: lojaCor }}>
                R$ {p.preco.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onEdit(p)}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer border border-slate-700/40"
              title="Editar Produto"
            >
              <Settings size={13} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(p.id)}
              className="p-2 rounded-xl bg-rose-950/30 text-rose-400/70 hover:text-rose-300 hover:bg-rose-900/50 transition cursor-pointer border border-rose-800/30"
              title="Deletar Produto"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
