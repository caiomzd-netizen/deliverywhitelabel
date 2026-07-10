import { Loja, Produto } from './types';

export const DEMO_LOJAS: Loja[] = [
  {
    id: 'loja-1',
    nome: 'Burguer Mania',
    slug_url: 'burguer-mania',
    logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&h=150&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
    cor_tema: '#e11d48', // rose-600
    cor_secundaria: '#fda4af',
    telefone_whatsapp: '5511999998888',
    endereco_fisico: 'Av. Paulista, 1000 - São Paulo, SP',
    taxa_entrega: 7.00,
    tempo_entrega: '35-45 min',
    ativo: true,
  },
  {
    id: 'loja-2',
    nome: 'Pizzaria Bela Itália',
    slug_url: 'pizzaria-bela',
    logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&h=150&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800&auto=format&fit=crop&q=80',
    cor_tema: '#16a34a', // green-600
    cor_secundaria: '#86efac',
    telefone_whatsapp: '5511988887777',
    endereco_fisico: 'Rua Augusta, 450 - São Paulo, SP',
    taxa_entrega: 9.00,
    tempo_entrega: '45-60 min',
    ativo: true,
  },
  {
    id: 'loja-3',
    nome: 'Sushi Lounge',
    slug_url: 'sushi-lounge',
    logo: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=150&h=150&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&auto=format&fit=crop&q=80',
    cor_tema: '#ea580c', // orange-600
    cor_secundaria: '#ffedd5',
    telefone_whatsapp: '5511977776666',
    endereco_fisico: 'Alameda Lorena, 1200 - São Paulo, SP',
    taxa_entrega: 12.00,
    tempo_entrega: '40-55 min',
    ativo: true,
  },
  {
    id: 'loja-4',
    nome: 'Distribuidora Geladão',
    slug_url: 'distribuidora-geladao',
    logo: 'https://images.unsplash.com/photo-1597262975002-c5c3b14bb34e?w=150&h=150&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1471421298428-1513ab720a8e?w=800&auto=format&fit=crop&q=80',
    cor_tema: '#f97316', // orange-500
    cor_secundaria: '#ffedd5',
    telefone_whatsapp: '5511999994444',
    endereco_fisico: 'Av. das Nações, 400 - São Paulo, SP',
    taxa_entrega: 4.50,
    tempo_entrega: '15-30 min',
    ativo: true,
  },
  {
    id: 'loja-5',
    nome: 'Disk Gás & Água Express',
    slug_url: 'gas-agua-express',
    logo: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=150&h=150&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
    cor_tema: '#0284c7', // sky-600
    cor_secundaria: '#e0f2fe',
    telefone_whatsapp: '5511988883333',
    endereco_fisico: 'Rua das Flores, 88 - São Paulo, SP',
    taxa_entrega: 0.00,
    tempo_entrega: '20-40 min',
    ativo: true,
  },
  {
    id: 'loja-6',
    nome: 'Mini Mercado do Bairro',
    slug_url: 'minimercado-bairro',
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&h=150&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
    cor_tema: '#4f46e5', // indigo-600
    cor_secundaria: '#e0e7ff',
    telefone_whatsapp: '5511977772222',
    endereco_fisico: 'Av. Primavera, 310 - São Paulo, SP',
    taxa_entrega: 6.00,
    tempo_entrega: '25-40 min',
    ativo: true,
  }
];

export const DEMO_PRODUTOS: Produto[] = [
  // Burguer Mania Products
  {
    id: 'prod-101',
    loja_id: 'loja-1',
    nome: 'Smash Duplo Cheddar',
    descricao: 'Dois blends smash de 80g, muito cheddar fatiado derretido, maionese artesanal da casa no pão brioche tostado na manteiga.',
    preco: 28.90,
    imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=80',
    categoria: 'Hambúrgueres',
    disponivel: true,
  },
  {
    id: 'prod-102',
    loja_id: 'loja-1',
    nome: 'Master Bacon Crispy',
    descricao: 'Blend artesanal de 150g, queijo prato, muito bacon crocante fatiado, cebola crispy dourada e molho barbecue artesanal.',
    preco: 34.90,
    imagem: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop&q=80',
    categoria: 'Hambúrgueres',
    disponivel: true,
  },
  {
    id: 'prod-103',
    loja_id: 'loja-1',
    nome: 'Chicken Supreme',
    descricao: 'Peito de frango super crocante empanado na farinha panko, alface americana fresca, tomate selecionado e maionese verde.',
    preco: 26.90,
    imagem: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=400&h=300&fit=crop&q=80',
    categoria: 'Hambúrgueres',
    disponivel: true,
  },
  {
    id: 'prod-104',
    loja_id: 'loja-1',
    nome: 'Batata Frita rústica Grande',
    descricao: 'Batatas fritas sequinhas e crocantes temperadas com sal e páprica defumada. Acompanha maionese artesanal de alho.',
    preco: 18.00,
    imagem: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop&q=80',
    categoria: 'Acompanhamentos',
    disponivel: true,
  },
  {
    id: 'prod-105',
    loja_id: 'loja-1',
    nome: 'Anéis de Cebola Crocantes',
    descricao: 'Anéis de cebola gigantes empanados em farinha especial bem crocantes e fritos na hora. Acompanha molho biquinho.',
    preco: 16.00,
    imagem: 'https://images.unsplash.com/photo-1639024471283-2bc7b3c6a267?w=400&h=300&fit=crop&q=80',
    categoria: 'Acompanhamentos',
    disponivel: true,
  },
  {
    id: 'prod-106',
    loja_id: 'loja-1',
    nome: 'Coca-Cola Lata 350ml',
    descricao: 'Refrigerante Coca-Cola lata trincando de gelada.',
    preco: 6.50,
    imagem: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop&q=80',
    categoria: 'Bebidas',
    disponivel: true,
  },
  {
    id: 'prod-107',
    loja_id: 'loja-1',
    nome: 'Suco Natural de Laranja 400ml',
    descricao: 'Suco natural de laranja espremido na hora, sem conservantes ou açúcar adicionado.',
    preco: 9.00,
    imagem: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=300&fit=crop&q=80',
    categoria: 'Bebidas',
    disponivel: true,
  },

  // Pizzaria Bela Itália Products
  {
    id: 'prod-201',
    loja_id: 'loja-2',
    nome: 'Pizza Margherita Especial',
    descricao: 'Molho de tomate pelati italiano artesanal, muçarela de búfala fresca, rodelas de tomate cereja, manjericão fresco e azeite extra virgem.',
    preco: 48.00,
    imagem: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop&q=80',
    categoria: 'Pizzas Tradicionais',
    disponivel: true,
  },
  {
    id: 'prod-202',
    loja_id: 'loja-2',
    nome: 'Pizza Calabresa com Cebola',
    descricao: 'Molho de tomate pelati, calabresa defumada artesanal fatiada fina, cebola roxa fresca, muçarela especial e azeitonas pretas chilenas.',
    preco: 45.00,
    imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop&q=80',
    categoria: 'Pizzas Tradicionais',
    disponivel: true,
  },
  {
    id: 'prod-203',
    loja_id: 'loja-2',
    nome: 'Pizza Quatro Queijos Premium',
    descricao: 'Combinação perfeita de muçarela, gorgonzola Dolce, catupiry original cremoso e parmesão ralado na hora sobre molho italiano.',
    preco: 52.00,
    imagem: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&h=300&fit=crop&q=80',
    categoria: 'Pizzas Especiais',
    disponivel: true,
  },
  {
    id: 'prod-204',
    loja_id: 'loja-2',
    nome: 'Pizza Nutella com Morango',
    descricao: 'Base de pizza assada coberta com muita Nutella cremosa, morangos frescos fatiados e raspas de chocolate branco belga.',
    preco: 42.00,
    imagem: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=400&h=300&fit=crop&q=80',
    categoria: 'Pizzas Doces',
    disponivel: true,
  },
  {
    id: 'prod-205',
    loja_id: 'loja-2',
    nome: 'Guaraná Antarctica 2L',
    descricao: 'Refrigerante Guaraná Antarctica garrafa pet 2 litros gelado para acompanhar seu rodízio em casa.',
    preco: 12.00,
    imagem: 'https://images.unsplash.com/photo-1527960659574-75073147ef3c?w=400&h=300&fit=crop&q=80',
    categoria: 'Bebidas',
    disponivel: true,
  },

  // Sushi Lounge Products
  {
    id: 'prod-301',
    loja_id: 'loja-3',
    nome: 'Combo Executivo 16 Peças',
    descricao: 'Seleção premium do sushiman: 4 sashimis de salmão, 4 niguiris de salmão, 4 hossomakis de salmão e 4 uramakis filadélfia.',
    preco: 59.90,
    imagem: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop&q=80',
    categoria: 'Combos',
    disponivel: true,
  },
  {
    id: 'prod-302',
    loja_id: 'loja-3',
    nome: 'Temaki Salmão Completo G',
    descricao: 'Cone de alga nori crocante recheado com arroz japonês, cubos de salmão fresco premium, cream cheese original e cebolinha fresca.',
    preco: 32.90,
    imagem: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400&h=300&fit=crop&q=80',
    categoria: 'Temakis',
    disponivel: true,
  },
  {
    id: 'prod-303',
    loja_id: 'loja-3',
    nome: 'Hot Roll de Salmão (10 unid)',
    descricao: 'Sushi frito super crocante recheado com salmão e cream cheese, finalizado com tarê artesanal doce e gergelim torrado.',
    preco: 28.00,
    imagem: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&h=300&fit=crop&q=80',
    categoria: 'Hot Rolls',
    disponivel: true,
  },
  // Distribuidora Geladão Products (loja-4)
  {
    id: 'prod-401',
    loja_id: 'loja-4',
    nome: 'Cerveja Heineken Latão 473ml (Unidade)',
    descricao: 'Cerveja puro malte Heineken latão de 473ml. Entregue trincando de gelada!',
    preco: 5.99,
    imagem: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop&q=80',
    categoria: 'Cervejas Trincando',
    disponivel: true,
  },
  {
    id: 'prod-402',
    loja_id: 'loja-4',
    nome: 'Fardo Heineken Lata 350ml (12 un)',
    descricao: 'Pack econômico com 12 latas de 350ml. Perfeito para o churrasco.',
    preco: 54.90,
    imagem: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop&q=80',
    categoria: 'Cervejas Trincando',
    disponivel: true,
  },
  {
    id: 'prod-403',
    loja_id: 'loja-4',
    nome: 'Combo Vodka Absolut 1L + 5 Red Bull',
    descricao: 'O combo ideal: 1 garrafa de Vodka Absolut Original 1L e 5 latas de energético Red Bull Energy Drink 250ml.',
    preco: 139.90,
    imagem: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=300&fit=crop&q=80',
    categoria: 'Combos de Destilados',
    disponivel: true,
  },
  {
    id: 'prod-404',
    loja_id: 'loja-4',
    nome: 'Whisky Johnnie Walker Red Label 1L',
    descricao: 'Garrafa original de Red Label 1 Litro, aroma de especiarias e notas vibrantes de canela e pimenta.',
    preco: 94.90,
    imagem: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=300&fit=crop&q=80',
    categoria: 'Destilados',
    disponivel: true,
  },
  {
    id: 'prod-405',
    loja_id: 'loja-4',
    nome: 'Coca-Cola Original 2 Litros',
    descricao: 'Refrigerante Coca-Cola sabor original pet 2L. Super gelada!',
    preco: 9.90,
    imagem: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop&q=80',
    categoria: 'Bebidas Sem Álcool',
    disponivel: true,
  },
  {
    id: 'prod-406',
    loja_id: 'loja-4',
    nome: 'Saco de Gelo de Filtro Cubos 5kg',
    descricao: 'Gelo em cubos cristalinos de água purificada e filtrada, ideal para colocar na sua caixa térmica.',
    preco: 12.00,
    imagem: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=400&h=300&fit=crop&q=80',
    categoria: 'Carvão & Gelo',
    disponivel: true,
  },
  {
    id: 'prod-407',
    loja_id: 'loja-4',
    nome: 'Saco de Carvão Vegetal 3kg',
    descricao: 'Carvão vegetal selecionado de alta qualidade e queima duradoura para o seu churrasco perfeito.',
    preco: 16.90,
    imagem: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=300&fit=crop&q=80',
    categoria: 'Carvão & Gelo',
    disponivel: true,
  },

  // Disk Gás & Água Express Products (loja-5)
  {
    id: 'prod-501',
    loja_id: 'loja-5',
    nome: 'Recarga de Gás de Cozinha P13',
    descricao: 'Recarga rápida de botijão de 13kg. Entrega super rápida e instalação grátis inclusa para sua total segurança!',
    preco: 115.00,
    imagem: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=300&fit=crop&q=80',
    categoria: 'Gás de Cozinha',
    disponivel: true,
  },
  {
    id: 'prod-502',
    loja_id: 'loja-5',
    nome: 'Galão de Água Mineral 20 Litros (Retornável)',
    descricao: 'Água mineral natural leve de fonte purificada. Necessário ter galão vazio de marca compatível no local.',
    preco: 15.00,
    imagem: 'https://images.unsplash.com/photo-1548839140-29a849356628?w=400&h=300&fit=crop&q=80',
    categoria: 'Águas Minerais',
    disponivel: true,
  },
  {
    id: 'prod-503',
    loja_id: 'loja-5',
    nome: 'Fardo Água Mineral Sem Gás 500ml (12 un)',
    descricao: 'Fardo prático com 12 garrafas de 500ml de água mineral pura e leve.',
    preco: 19.90,
    imagem: 'https://images.unsplash.com/photo-1608885898957-a599fb15ec36?w=400&h=300&fit=crop&q=80',
    categoria: 'Águas Minerais',
    disponivel: true,
  },
  {
    id: 'prod-504',
    loja_id: 'loja-5',
    nome: 'Suporte de Galão de Mesa de Cerâmica',
    descricao: 'Suporte de mesa tradicional com torneira click, mantém sua água limpa e fresca por muito mais tempo.',
    preco: 34.90,
    imagem: 'https://images.unsplash.com/photo-1548839140-29a849356628?w=400&h=300&fit=crop&q=80',
    categoria: 'Acessórios',
    disponivel: true,
  },
  {
    id: 'prod-505',
    loja_id: 'loja-5',
    nome: 'Registro e Mangueira de Gás Certificada',
    descricao: 'Kit completo com mangueira de 1.25m aprovada pelo INMETRO, registro regulador de pressão e 2 abraçadeiras de metal.',
    preco: 45.00,
    imagem: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&q=80',
    categoria: 'Acessórios',
    disponivel: true,
  },

  // Mini Mercado do Bairro Products (loja-6)
  {
    id: 'prod-601',
    loja_id: 'loja-6',
    nome: 'Pão de Forma Pullman Clássico 450g',
    descricao: 'Pão de forma tradicional Pullman, super macio e fofinho, ideal para torradas e sanduíches diários.',
    preco: 7.90,
    imagem: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&q=80',
    categoria: 'Padaria & Matinais',
    disponivel: true,
  },
  {
    id: 'prod-602',
    loja_id: 'loja-6',
    nome: 'Leite Integral Longa Vida Piracanjuba 1L',
    descricao: 'Leite UHT integral de alta qualidade fortificado com vitaminas A e D.',
    preco: 5.49,
    imagem: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop&q=80',
    categoria: 'Padaria & Matinais',
    disponivel: true,
  },
  {
    id: 'prod-603',
    loja_id: 'loja-6',
    nome: 'Café Tradicional Melitta Vácuo 500g',
    descricao: 'Café com ponto de torra clássico e moagem média, sabor forte e aroma intenso.',
    preco: 18.90,
    imagem: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop&q=80',
    categoria: 'Padaria & Matinais',
    disponivel: true,
  },
  {
    id: 'prod-604',
    loja_id: 'loja-6',
    nome: 'Arroz Agulhinha Tipo 1 Prato Fino 5kg',
    descricao: 'Arroz branco Tipo 1, grãos selecionados e polidos, fica super soltinho e saboroso depois de cozido.',
    preco: 29.90,
    imagem: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&q=80',
    categoria: 'Mercearia Fina',
    disponivel: true,
  },
  {
    id: 'prod-605',
    loja_id: 'loja-6',
    nome: 'Feijão Carioca Tipo 1 Kicaldo 1kg',
    descricao: 'Feijão carioca de grãos novos e selecionados de cozimento rápido, produzindo caldo encorpado.',
    preco: 8.90,
    imagem: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&h=300&fit=crop&q=80',
    categoria: 'Mercearia Fina',
    disponivel: true,
  },
  {
    id: 'prod-606',
    loja_id: 'loja-6',
    nome: 'Detergente Líquido de Coco Ypê 500ml',
    descricao: 'Detergente líquido de alto rendimento com toque de coco, testado dermatologicamente.',
    preco: 2.49,
    imagem: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop&q=80',
    categoria: 'Limpeza & Higiene',
    disponivel: true,
  },
  {
    id: 'prod-607',
    loja_id: 'loja-6',
    nome: 'Papel Higiênico Neve Folha Dupla (12 Rolos)',
    descricao: 'Papel higiênico folha dupla Neve, maciez insuperável com cuidado especial para sua pele.',
    preco: 17.50,
    imagem: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=400&h=300&fit=crop&q=80',
    categoria: 'Limpeza & Higiene',
    disponivel: true,
  }
];

export const SQL_SCHEMA_SCRIPT = `-- ==========================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS (SUPABASE / POSTGRESQL)
-- ARQUITETURA: admin_geral > admin_loja > funcionario > cliente
-- Multi-inquilino (várias lojas no mesmo banco)
-- Cole este script no SQL Editor do seu painel Supabase
-- ==========================================

-- 1. Criar extensão para uuid (geralmente ativa por padrão)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Lojas (cada loja é um inquilino/distribuidora/restaurante)
CREATE TABLE IF NOT EXISTS lojas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    slug_url VARCHAR(100) UNIQUE NOT NULL,
    logo TEXT,
    banner TEXT,
    cor_tema VARCHAR(30) DEFAULT '#f97316',
    telefone_whatsapp VARCHAR(20) NOT NULL,
    endereco_fisico TEXT,
    taxa_entrega DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tempo_entrega VARCHAR(30) DEFAULT '30-45 min',
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lojas_slug ON lojas(slug_url);

-- 3. Tabela de Usuários (centraliza todos os papéis)
-- roles: admin_geral (dono da plataforma), admin_loja (gerente da loja),
--        funcionario (auxiliar da loja), cliente (consumidor final)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('admin_geral', 'admin_loja', 'funcionario', 'cliente')),
    loja_id UUID REFERENCES lojas(id) ON DELETE SET NULL,
    telefone VARCHAR(20),
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);
CREATE INDEX IF NOT EXISTS idx_usuarios_loja ON usuarios(loja_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- 4. Tabela de Produtos (cardápio de cada loja)
CREATE TABLE IF NOT EXISTS produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loja_id UUID NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    imagem TEXT,
    categoria VARCHAR(100) NOT NULL,
    disponivel BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_produtos_loja ON produtos(loja_id);
CREATE INDEX IF NOT EXISTS idx_produtos_disponivel ON produtos(disponivel);

-- 5. Tabela de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loja_id UUID NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    dados_cliente JSONB NOT NULL,
    itens_pedido JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    taxa_entrega DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pendente',
    observacao_interna TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pedidos_loja ON pedidos(loja_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_criado_em ON pedidos(criado_em DESC);

-- 6. Tabela de Histórico de Status dos Pedidos (auditoria)
CREATE TABLE IF NOT EXISTS pedido_status_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    status_anterior VARCHAR(30),
    status_novo VARCHAR(30) NOT NULL,
    alterado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_status_log_pedido ON pedido_status_log(pedido_id);

-- === SEED: Admin Geral Padrão ===
INSERT INTO usuarios (id, nome, email, senha, role, loja_id, ativo)
VALUES (
    uuid_generate_v4(),
    'Administrador Master',
    'admin@admin',
    'Dalchau1988#@',
    'admin_geral',
    NULL,
    true
) ON CONFLICT (email) DO NOTHING;

-- === ROW LEVEL SECURITY ===
ALTER TABLE lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_status_log ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública para lojas e produtos (clientes veem sem login)
CREATE POLICY "Leitura pública de lojas ativas" ON lojas
    FOR SELECT USING (ativo = true);

CREATE POLICY "Leitura pública de produtos disponíveis" ON produtos
    FOR SELECT USING (disponivel = true);

-- Clientes podem inserir pedidos sem autenticação
CREATE POLICY "Inserção pública de pedidos" ON pedidos
    FOR INSERT WITH CHECK (true);

-- Admin geral vê tudo (role = admin_geral)
CREATE POLICY "Admin geral - tudo" ON lojas FOR ALL USING (
    (SELECT role FROM usuarios WHERE id = auth.uid()) = 'admin_geral'
);
CREATE POLICY "Admin geral - tudo usuarios" ON usuarios FOR ALL USING (
    (SELECT role FROM usuarios WHERE id = auth.uid()) = 'admin_geral'
);
CREATE POLICY "Admin geral - tudo pedidos" ON pedidos FOR ALL USING (
    (SELECT role FROM usuarios WHERE id = auth.uid()) = 'admin_geral'
);

-- Admin loja vê apenas dados da sua loja
CREATE POLICY "Admin loja - sua loja" ON lojas FOR SELECT USING (
    id IN (SELECT loja_id FROM usuarios WHERE id = auth.uid() AND role = 'admin_loja')
);
CREATE POLICY "Admin loja - produtos da loja" ON produtos FOR ALL USING (
    loja_id IN (SELECT loja_id FROM usuarios WHERE id = auth.uid() AND role = 'admin_loja')
);
CREATE POLICY "Admin loja - pedidos da loja" ON pedidos FOR ALL USING (
    loja_id IN (SELECT loja_id FROM usuarios WHERE id = auth.uid() AND role = 'admin_loja')
);

-- Funcionário vê apenas pedidos da loja (leitura e atualização de status)
CREATE POLICY "Funcionario - pedidos da loja" ON pedidos FOR SELECT USING (
    loja_id IN (SELECT loja_id FROM usuarios WHERE id = auth.uid() AND role = 'funcionario')
);
CREATE POLICY "Funcionario - atualizar status" ON pedidos FOR UPDATE USING (
    loja_id IN (SELECT loja_id FROM usuarios WHERE id = auth.uid() AND role = 'funcionario')
);

-- Política para log de status (inserção automática via trigger)
CREATE POLICY "Inserir log de status" ON pedido_status_log
    FOR INSERT WITH CHECK (true);
`;
