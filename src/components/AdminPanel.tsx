import React, { useState, useEffect } from 'react';
import { 
  Database, Copy, Check, Info, FileText, ToggleLeft, ShoppingBag, 
  Plus, Trash2, UserPlus, Settings, Layers, Sparkles, Filter, 
  Activity, CheckCircle2, ChevronRight, RefreshCw, Percent, QrCode,
  Smartphone, ExternalLink
} from 'lucide-react';
import QRCodeDisplay from './QRCodeDisplay';
import { SQL_SCHEMA_SCRIPT } from '../data';
import { 
  isSupabaseConfigured, fetchPedidosLocais, getCustomLojas, 
  saveCustomLoja, getCustomProdutos, saveCustomProduto, deleteCustomProduto,
  getCustomGerentes, saveCustomGerente
} from '../supabase';
import { Pedido, Loja, Produto, Gerente } from '../types';

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
  const [activeTab, setActiveTab] = useState<'lojas' | 'produtos' | 'pedidos' | 'sql'>('lojas');
  const [copied, setCopied] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Role simulation: Admin Geral can register any store, Gerente de Loja manages the current store
  const [userRole, setUserRole] = useState<'admin_geral' | 'gerente_loja'>('admin_geral');

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

  // --- Login States ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- Manager List & Sync ---
  const [gerentesList, setGerentesList] = useState<Gerente[]>([]);

  useEffect(() => {
    setGerentesList(getCustomGerentes());
  }, []);

  useEffect(() => {
    if (loggedGerente) {
      setUserRole('gerente_loja');
    }
  }, [loggedGerente]);

  // Load orders
  useEffect(() => {
    async function loadPedidos() {
      const p = await fetchPedidosLocais();
      setPedidos(p);
    }
    loadPedidos();
  }, [activeOrderCount, triggerRefreshOrders, activeTab]);

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
      ativo: true
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

  const getStatusColor = (status: Pedido['status']) => {
    switch (status) {
      case 'pendente': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'preparando': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'saiu_entrega': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'entregue': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get active products for this store
  // Since we also have demo products loaded in app, let's grab the custom ones or the active product list
  const activeNichePreset = Object.keys(NICHE_PRESETS).find(
    (k) => currentLoja.nome.toLowerCase().includes('burguer') && k === 'hamburgueria' ||
           currentLoja.nome.toLowerCase().includes('pizza') && k === 'restaurante'
  ) || 'distribuidora_bebidas';

  return (
    <div id="admin-panel" className="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Superior */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500 text-white font-extrabold text-sm">
                PORTAL PARCEIRO
              </span>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">Painel de Gestão Whitelabel</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Gerencie lojas, usuários de distribuidoras/restaurantes, cadastre produtos e monitore pedidos em tempo real.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
            {/* Simulador de Cargo */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setUserRole('admin_geral')}
                className={`px-3 py-1.5 rounded-md font-bold transition ${
                  userRole === 'admin_geral'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Admin Geral (Cria Lojas)
              </button>
              <button
                type="button"
                onClick={() => setUserRole('gerente_loja')}
                className={`px-3 py-1.5 rounded-md font-bold transition ${
                  userRole === 'gerente_loja'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Gerente da Loja Ativa
              </button>
            </div>

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

        {/* QR Code + URLs da Loja Ativa */}
        {currentLoja && (
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col md:flex-row items-center gap-6">
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">QR Code do Cardápio</span>
              <QRCodeDisplay
                url={`${window.location.origin}${window.location.pathname.replace(/\/+$/, '')}/#/${currentLoja.slug_url}`}
                size={130}
                label="Compartilhe com seus clientes!"
              />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h4 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                  <Smartphone size={14} className="text-orange-400" />
                  {currentLoja.nome}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Links de acesso para sua loja:
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-700/60">
                  <span className="text-[10px] font-bold text-orange-400 uppercase w-16 shrink-0">Cliente:</span>
                  <a
                    href={`#/${currentLoja.slug_url}`}
                    className="text-xs font-mono text-orange-300 hover:text-orange-200 truncate"
                  >
                    /{currentLoja.slug_url}
                  </a>
                  <ExternalLink size={12} className="text-slate-500 shrink-0" />
                </div>
                <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-700/60">
                  <span className="text-[10px] font-bold text-blue-400 uppercase w-16 shrink-0">Admin:</span>
                  <a
                    href={`#/${currentLoja.slug_url}/admin`}
                    className="text-xs font-mono text-blue-300 hover:text-blue-200 truncate"
                  >
                    /{currentLoja.slug_url}/admin
                  </a>
                  <ExternalLink size={12} className="text-slate-500 shrink-0" />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Clientes escaneiam o QR Code, abrem o link e podem instalar o PWA no celular — sempre acessando diretamente o cardápio da sua loja.
              </p>
            </div>
          </div>
        )}

        {/* Informações Whitelabel para oferecer a Distribuidoras e Comércios */}
        <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/20 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
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
        </div>

        {/* Tabs de Navegação */}
        <div className="flex overflow-x-auto border-b border-slate-800 gap-2 scrollbar-none pb-0.5">
          <button
            id="tab-lojas"
            onClick={() => { setActiveTab('lojas'); handleResetProductForm(); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'lojas'
                ? 'border-orange-500 text-orange-400 bg-orange-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <ToggleLeft size={16} />
            Lojas & Usuários ({lojasList.length})
          </button>
          
          <button
            id="tab-produtos"
            onClick={() => setActiveTab('produtos')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'produtos'
                ? 'border-orange-500 text-orange-400 bg-orange-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Plus size={16} />
            Gerenciar Cardápio & Produtos
          </button>

          <button
            id="tab-pedidos"
            onClick={() => { setActiveTab('pedidos'); handleResetProductForm(); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all relative whitespace-nowrap ${
              activeTab === 'pedidos'
                ? 'border-orange-500 text-orange-400 bg-orange-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <ShoppingBag size={16} />
            Pedidos do Carrinho
            {pedidos.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                {pedidos.length}
              </span>
            )}
          </button>

          <button
            id="tab-sql"
            onClick={() => { setActiveTab('sql'); handleResetProductForm(); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'sql'
                ? 'border-orange-500 text-orange-400 bg-orange-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <FileText size={16} />
            Código SQL Supabase
          </button>
        </div>

        {/* ==================== TAB CONTENT: LOJAS & USUARIOS ==================== */}
        {activeTab === 'lojas' && (
          <div className="space-y-6">
            
            {/* Seção de Cadastro de Novo Usuário / Comerciante */}
            {userRole === 'admin_geral' ? (
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
            ) : (
              <div className="bg-slate-800/30 p-4 rounded-xl border border-dashed border-slate-800 text-xs text-center space-y-2">
                <Info className="mx-auto text-orange-400" size={20} />
                <h4 className="font-bold text-slate-200">Acesso Restrito ao Gerente</h4>
                <p className="text-slate-400 max-w-md mx-auto">
                  Você está simulando o cargo de <strong>Gerente da Loja Ativa</strong>. Para cadastrar novas lojas ou adegas no sistema como um administrador da plataforma SaaS, altere o seletor de cargo no topo para <strong>"Admin Geral"</strong>.
                </p>
              </div>
            )}

            {/* Lista de Lojas Disponíveis para Alternância */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Alternar entre Lojas Ativas ({lojasList.length})</h3>
                <span className="text-[10px] text-orange-400 font-bold">Simule o whitelabel instantaneamente</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lojasList.map((loja) => {
                  const isSelected = currentLoja.id === loja.id;
                  return (
                    <div
                      key={loja.id}
                      className={`flex flex-col rounded-xl overflow-hidden border transition-all ${
                        isSelected
                          ? 'border-orange-500 ring-2 ring-orange-500/30 bg-slate-800/60'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="h-28 w-full relative">
                        <img
                          src={loja.banner}
                          alt={loja.nome}
                          className="w-full h-full object-cover opacity-75"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />
                        <div className="absolute bottom-2.5 left-3 flex items-center gap-2.5">
                          <img
                            src={loja.logo}
                            alt={loja.nome}
                            className="w-9 h-9 rounded-full border border-white/30 object-cover bg-white"
                          />
                          <div>
                            <span className="font-extrabold text-sm text-white drop-shadow-sm flex items-center gap-1.5">
                              {loja.nome}
                              {isSelected && <span className="bg-orange-500 text-[8px] text-white font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">Ativo</span>}
                            </span>
                            <span className="block text-[10px] text-slate-300 font-mono">/{loja.slug_url}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3.5 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">WhatsApp Comercial:</span>
                          <span className="text-slate-200 font-mono">{loja.telefone_whatsapp}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Endereço:</span>
                          <span className="text-slate-200 text-right truncate max-w-[200px]">{loja.endereco_fisico}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Parâmetros de Entrega:</span>
                          <span className="text-slate-200 font-bold">R$ {loja.taxa_entrega.toFixed(2)} • {loja.tempo_entrega}</span>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: loja.cor_tema }} />
                            <span className="text-[10px] font-mono font-bold" style={{ color: loja.cor_tema }}>{loja.cor_tema}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onSelectLoja(loja)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                              isSelected 
                                ? 'bg-orange-500 text-white cursor-default' 
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer'
                            }`}
                          >
                            {isSelected ? 'Menu Carregado' : 'Carregar Menu'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

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
        {activeTab === 'pedidos' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-200">Pedidos Emulados / Salvos</h3>
              <p className="text-xs text-slate-400">Veja em tempo real os pedidos que foram processados pelo fluxo do carrinho de compras.</p>
            </div>

            {pedidos.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                <ShoppingBag className="mx-auto text-slate-600 mb-3" size={36} />
                <p className="text-slate-400 text-sm">Nenhum pedido recebido ainda nesta sessão.</p>
                <p className="text-slate-500 text-xs mt-1">Simule uma compra no cardápio mobile ao lado!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pedidos.map((p, idx) => (
                  <div key={p.id || idx} className="bg-slate-800/50 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                      <div>
                        <span className="font-mono text-xs text-indigo-400 font-semibold">{p.id}</span>
                        <div className="text-slate-400 text-[10px] mt-0.5">
                          {p.criado_em ? new Date(p.criado_em).toLocaleTimeString('pt-BR') : 'Agora mesmo'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(p.status)}`}>
                          {p.status}
                        </span>
                        <span className="text-xs bg-slate-700/80 px-2 py-0.5 rounded text-slate-200">
                          {p.dados_cliente.tipo_entrega === 'entrega' ? '🚚 Entrega' : '🏪 Retirada'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* Cliente */}
                      <div className="space-y-1">
                        <div className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Cliente</div>
                        <div className="text-slate-200 font-semibold">{p.dados_cliente.nome}</div>
                        <div className="text-slate-300">{p.dados_cliente.telefone}</div>
                        {p.dados_cliente.tipo_entrega === 'entrega' && p.dados_cliente.endereco && (
                          <div className="text-slate-400 text-[11px] leading-snug mt-1">
                            {p.dados_cliente.endereco.rua}, {p.dados_cliente.endereco.numero} - {p.dados_cliente.endereco.bairro}
                            {p.dados_cliente.endereco.complemento && ` (${p.dados_cliente.endereco.complemento})`}
                            <br />
                            {p.dados_cliente.endereco.cidade}
                          </div>
                        )}
                      </div>

                      {/* Pagamento e Totais */}
                      <div className="space-y-1 sm:text-right">
                        <div className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Pagamento & Total</div>
                        <div className="text-slate-200 font-medium capitalize">
                          Forma: <span className="font-semibold text-slate-100">{p.dados_cliente.forma_pagamento}</span>
                        </div>
                        {p.dados_cliente.troco_para && (
                          <div className="text-amber-400">Troco para: R$ {p.dados_cliente.troco_para}</div>
                        )}
                        <div className="pt-2 sm:pt-1 text-slate-400">
                          Subtotal: <span className="text-slate-300">R$ {p.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="text-slate-400">
                          Taxa Entrega: <span className="text-slate-300">R$ {p.taxa_entrega.toFixed(2)}</span>
                        </div>
                        <div className="text-sm font-bold text-orange-400 mt-1">
                          Total: R$ {p.total.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Itens */}
                    <div className="pt-2 border-t border-slate-800">
                      <div className="text-slate-400 font-medium uppercase tracking-wider text-[10px] mb-1.5">Itens do Pedido</div>
                      <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                        {p.itens_pedido.map((it, itemIdx) => (
                          <div key={itemIdx} className="flex justify-between items-start text-[11px] text-slate-300">
                            <span>
                              <strong className="text-orange-400 font-mono">{it.quantidade}x</strong> {it.nome}
                              {it.observacoes && (
                                <span className="block text-slate-500 italic font-sans pl-4">Obs: "{it.observacoes}"</span>
                              )}
                            </span>
                            <span className="font-semibold text-slate-200">R$ {it.total_item.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
    <div className="grid grid-cols-1 gap-3">
      {filtered.map((p) => (
        <div key={p.id} className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 flex gap-3.5 items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={p.imagem}
              alt={p.nome}
              className="w-12 h-12 rounded-lg object-cover bg-slate-950 shrink-0 border border-slate-800"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs text-slate-100 truncate">{p.nome}</h4>
                <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300 font-bold uppercase">{p.categoria}</span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.descricao || 'Sem descrição cadastrada'}</p>
              <span className="block text-xs font-black mt-1" style={{ color: lojaCor }}>
                R$ {p.preco.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(p)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
              title="Editar Produto"
            >
              <Settings size={13} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(p.id)}
              className="p-1.5 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 transition cursor-pointer"
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
