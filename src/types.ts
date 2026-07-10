export interface Loja {
  id: string;
  nome: string;
  slug_url: string;
  logo: string;
  banner: string;
  cor_tema: string;
  cor_secundaria?: string;
  telefone_whatsapp: string;
  endereco_fisico?: string;
  taxa_entrega: number;
  tempo_entrega: string;
  ativo: boolean;
  niche?: string;
  pwa_icon_url?: string;
  horario_funcionamento?: HorarioFuncionamento;
}

export interface HorarioDia {
  aberto: boolean;
  inicio: string; // "HH:MM"
  fim: string;     // "HH:MM"
}

export interface HorarioFuncionamento {
  seg: HorarioDia;
  ter: HorarioDia;
  qua: HorarioDia;
  qui: HorarioDia;
  sex: HorarioDia;
  sab: HorarioDia;
  dom: HorarioDia;
}

export interface ClienteEndereco {
  rua: string;
  numero: string;
  bairro: string;
  complemento?: string;
  cidade: string;
  lat?: number;
  lng?: number;
  precisao?: number; // accuracy em metros
}

export interface Cliente {
  id: string;
  loja_id: string;
  nome: string;
  email: string;
  senha_hash: string;
  telefone: string;
  endereco?: ClienteEndereco;
  criado_em: string;
}

export interface Produto {
  id: string;
  loja_id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  categoria: string;
  disponivel: boolean;
  estoque?: number;
}

export interface CartItem {
  produto: Produto;
  quantidade: number;
  observacoes?: string;
}

export interface Pedido {
  id?: string;
  loja_id: string;
  dados_cliente: {
    nome: string;
    telefone: string;
    tipo_entrega: 'entrega' | 'retirada';
    endereco?: {
      rua: string;
      numero: string;
      bairro: string;
      complemento?: string;
      cidade: string;
    };
    forma_pagamento: 'pix' | 'dinheiro';
    troco_para?: string;
  };
  itens_pedido: {
    produto_id: string;
    nome: string;
    quantidade: number;
    preco_unitario: number;
    total_item: number;
    observacoes?: string;
  }[];
  subtotal: number;
  taxa_entrega: number;
  total: number;
  status: 'pendente' | 'preparando' | 'saiu_entrega' | 'entregue' | 'cancelado';
  criado_em?: string;
}

export interface Gerente {
  id: string;
  nome: string;
  email: string;
  senha: string;
  loja_id: string;
}

