import { createClient } from '@supabase/supabase-js';
import { Loja, Produto, Pedido, Gerente } from './types';
import { DEMO_LOJAS, DEMO_PRODUTOS } from './data';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ============================================================================
// SERVIÇOS DO BANCO DE DADOS (COM EMULAÇÃO LOCAL SE NÃO CONFIGURADO)
// ============================================================================

export function getCustomLojas(): Loja[] {
  try {
    const raw = localStorage.getItem('delivery_whitelabel_custom_lojas');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomLoja(loja: Loja) {
  try {
    const custom = getCustomLojas();
    const index = custom.findIndex((l) => l.id === loja.id);
    if (index > -1) {
      custom[index] = loja;
    } else {
      custom.push(loja);
    }
    localStorage.setItem('delivery_whitelabel_custom_lojas', JSON.stringify(custom));
  } catch (err) {
    console.error('Erro ao salvar loja customizada:', err);
  }
}

const DEFAULT_GERENTES: Gerente[] = [
  { id: 'ger-1', nome: 'Carlos Adega', email: 'carlos@adega.com', senha: '123', loja_id: 'loja-1' },
  { id: 'ger-2', nome: 'Juliana Express', email: 'juliana@adega.com', senha: '123', loja_id: 'loja-2' },
  { id: 'ger-3', nome: 'Sushiman Sato', email: 'sato@sushi.com', senha: '123', loja_id: 'loja-3' },
  { id: 'ger-4', nome: 'Marcos Geladão', email: 'marcos@geladao.com', senha: '123', loja_id: 'loja-4' },
  { id: 'ger-5', nome: 'Reginaldo Gás', email: 'reginaldo@gas.com', senha: '123', loja_id: 'loja-5' },
  { id: 'ger-6', nome: 'Seu Manuel', email: 'manuel@mercado.com', senha: '123', loja_id: 'loja-6' },
];

export function getCustomGerentes(): Gerente[] {
  try {
    const raw = localStorage.getItem('delivery_whitelabel_custom_gerentes');
    if (!raw) {
      // Seed default managers if not customized yet
      localStorage.setItem('delivery_whitelabel_custom_gerentes', JSON.stringify(DEFAULT_GERENTES));
      return DEFAULT_GERENTES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_GERENTES;
  }
}

export function saveCustomGerente(gerente: Gerente) {
  try {
    const custom = getCustomGerentes();
    const index = custom.findIndex((g) => g.id === gerente.id || (g.email === gerente.email && g.loja_id === gerente.loja_id));
    if (index > -1) {
      custom[index] = gerente;
    } else {
      custom.push(gerente);
    }
    localStorage.setItem('delivery_whitelabel_custom_gerentes', JSON.stringify(custom));
  } catch (err) {
    console.error('Erro ao salvar gerente customizado:', err);
  }
}


export function getCustomProdutos(): Produto[] {
  try {
    const raw = localStorage.getItem('delivery_whitelabel_custom_produtos');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomProduto(produto: Produto) {
  try {
    const custom = getCustomProdutos();
    const index = custom.findIndex((p) => p.id === produto.id);
    if (index > -1) {
      custom[index] = produto;
    } else {
      custom.push(produto);
    }
    localStorage.setItem('delivery_whitelabel_custom_produtos', JSON.stringify(custom));
  } catch (err) {
    console.error('Erro ao salvar produto customizado:', err);
  }
}

export function deleteCustomProduto(id: string) {
  try {
    const custom = getCustomProdutos().filter((p) => p.id !== id);
    localStorage.setItem('delivery_whitelabel_custom_produtos', JSON.stringify(custom));
  } catch (err) {
    console.error('Erro ao deletar produto customizado:', err);
  }
}

export async function fetchAllLojas(): Promise<Loja[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('lojas')
        .select('*')
        .eq('ativo', true);
      if (error) throw error;
      if (data && data.length > 0) return data as Loja[];
    } catch (err) {
      console.warn('Erro ao buscar lojas do Supabase. Usando locais:', err);
    }
  }
  // Retorna os DEMO + Customizados do localStorage
  return [...DEMO_LOJAS, ...getCustomLojas()];
}

export async function fetchLojaBySlug(slug: string): Promise<Loja | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('lojas')
        .select('*')
        .eq('slug_url', slug)
        .eq('ativo', true)
        .maybeSingle();

      if (error) throw error;
      if (data) return data as Loja;
    } catch (err) {
      console.warn('Erro ao buscar loja do Supabase. Usando dados locais como fallback:', err);
    }
  }

  // Fallback local
  const lojas = await fetchAllLojas();
  const lojaLocal = lojas.find((l) => l.slug_url === slug && l.ativo);
  return lojaLocal || null;
}

export async function fetchProdutosByLoja(lojaId: string): Promise<Produto[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('loja_id', lojaId)
        .eq('disponivel', true);

      if (error) throw error;
      if (data) return data as Produto[];
    } catch (err) {
      console.warn('Erro ao buscar produtos do Supabase. Usando dados locais como fallback:', err);
    }
  }

  // Fallback local (Demo + Customizados daquela loja)
  const todos = [...DEMO_PRODUTOS, ...getCustomProdutos()];
  return todos.filter((p) => p.loja_id === lojaId && p.disponivel);
}

export async function savePedido(pedido: Pedido): Promise<{ success: boolean; data?: Pedido; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .insert({
          loja_id: pedido.loja_id,
          dados_cliente: pedido.dados_cliente,
          itens_pedido: pedido.itens_pedido,
          subtotal: pedido.subtotal,
          taxa_entrega: pedido.taxa_entrega,
          total: pedido.total,
          status: pedido.status,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: data as Pedido };
    } catch (err: any) {
      console.error('Erro ao salvar pedido no Supabase:', err);
      // Don't fail the order flow! Fallback to local storage so the customer still gets their WhatsApp message!
    }
  }

  // Fallback Local Storage
  try {
    const localPedidosRaw = localStorage.getItem('delivery_whitelabel_pedidos');
    const localPedidos: Pedido[] = localPedidosRaw ? JSON.parse(localPedidosRaw) : [];
    
    const novoPedido: Pedido = {
      ...pedido,
      id: `ped-local-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      criado_em: new Date().toISOString(),
    };
    
    localPedidos.unshift(novoPedido);
    localStorage.setItem('delivery_whitelabel_pedidos', JSON.stringify(localPedidos));
    
    return { success: true, data: novoPedido };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro ao salvar pedido localmente' };
  }
}

export async function fetchPedidosLocais(): Promise<Pedido[]> {
  try {
    const localPedidosRaw = localStorage.getItem('delivery_whitelabel_pedidos');
    return localPedidosRaw ? JSON.parse(localPedidosRaw) : [];
  } catch {
    return [];
  }
}

export function updatePedidoStatusLocal(
  pedidoId: string,
  novoStatus: Pedido['status']
): Pedido | null {
  try {
    const raw = localStorage.getItem('delivery_whitelabel_pedidos');
    const pedidos: Pedido[] = raw ? JSON.parse(raw) : [];
    const idx = pedidos.findIndex((p) => p.id === pedidoId);
    if (idx === -1) return null;
    pedidos[idx] = { ...pedidos[idx], status: novoStatus };
    localStorage.setItem('delivery_whitelabel_pedidos', JSON.stringify(pedidos));
    return pedidos[idx];
  } catch {
    return null;
  }
}
