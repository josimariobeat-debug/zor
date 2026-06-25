import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/loose';
import type { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// Database types are auto-generated and may be empty until tables exist.
// Use permissive aliases so the hook can be called with any table name.
type TableName = string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row<T extends TableName = string> = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InsertRow<T extends TableName = string> = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UpdateRow<T extends TableName = string> = any;

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const m = (err as { message: unknown }).message;
    if (typeof m === 'string') return m;
  }
  return 'Erro desconhecido';
}

export function useSupabaseData<T extends { id: string } = Row<TableName>>(tableName: TableName) {
  type R = T;
  const { user } = useAuth();
  const [data, setData] = useState<R[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!supabase || !user) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(((result ?? []) as unknown) as R[]);
      setError(null);
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message);
      toast({ title: 'Erro ao carregar dados', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [tableName, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const create = async (
    item: Omit<R, 'id' | 'created_at' | 'updated_at' | 'user_id'>,
  ): Promise<R | null> => {
    if (!supabase || !user) return null;

    try {
      const payload = { ...item, user_id: user.id } as unknown as InsertRow<TableName>;
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(payload as never)
        .select()
        .single();

      if (error) throw error;
      if (!result) return null;
      const row = result as unknown as R;
      setData((prev) => [row, ...prev]);
      return row;
    } catch (err: unknown) {
      toast({ title: 'Erro ao criar', description: getErrorMessage(err), variant: 'destructive' });
      return null;
    }
  };

  const update = async (id: string, updates: Partial<R>): Promise<R | null> => {
    if (!supabase || !user) return null;

    try {
      const payload = { ...updates, updated_at: new Date().toISOString() } as unknown as UpdateRow<TableName>;
      const { data: result, error } = await supabase
        .from(tableName)
        .update(payload as never)
        .eq('id' as never, id)
        .select()
        .single();

      if (error) throw error;
      if (!result) return null;
      const row = result as unknown as R;
      setData((prev) => prev.map((item) => ((item as { id: string }).id === id ? row : item)));
      return row;
    } catch (err: unknown) {
      toast({ title: 'Erro ao atualizar', description: getErrorMessage(err), variant: 'destructive' });
      return null;
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    if (!supabase || !user) return false;

    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id' as never, id);

      if (error) throw error;
      setData((prev) => prev.filter((item) => (item as { id: string }).id !== id));
      return true;
    } catch (err: unknown) {
      toast({ title: 'Erro ao excluir', description: getErrorMessage(err), variant: 'destructive' });
      return false;
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    create,
    update,
    remove,
  };
}


// Hook específico para Ordens de Produção (com relacionamentos)
export function useProductionOrders() {
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!sb || !user) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Buscar OPs
      const { data: orders, error: ordersError } = await sb
        .from('production_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Buscar itens e variações para cada OP
      const ordersWithItems = await Promise.all(
        (orders || []).map(async (order) => {
          const { data: items } = await sb
            .from('production_order_items')
            .select('*')
            .eq('production_order_id', order.id);

          const itemsWithVariations = await Promise.all(
            (items || []).map(async (item) => {
              const { data: variations } = await sb
                .from('production_order_variations')
                .select('*')
                .eq('item_id', item.id);

              return { ...item, variations: variations || [] };
            })
          );

          const { data: trims } = await sb
            .from('production_order_trims')
            .select('*')
            .eq('production_order_id', order.id);

          return {
            ...order,
            items: itemsWithVariations,
            trims_used: trims || [],
          };
        })
      );

      setData(ordersWithItems);
    } catch (err: any) {
      toast({ title: 'Erro ao carregar OPs', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getNextOPNumber = async () => {
    if (!sb || !user) return 'OP-001';
    
    const { count } = await sb
      .from('production_orders')
      .select('*', { count: 'exact', head: true });
    
    return `OP-${String((count || 0) + 1).padStart(3, '0')}`;
  };

  const create = async (orderData: any) => {
    if (!sb || !user) return null;

    try {
      const number = await getNextOPNumber();

      // 1. Criar OP
      const { data: order, error: orderError } = await sb
        .from('production_orders')
        .insert({
          user_id: user.id,
          number,
          fabric_id: orderData.fabric_id || null,
          fabric_name: orderData.fabric_name || '',
          fabric_meters_consumed: orderData.fabric_meters_consumed || 0,
          workshop_id: orderData.workshop_id || null,
          workshop_name: orderData.workshop_name || '',
          quantity: orderData.quantity || 0,
          status: orderData.status || 'modelagem',
          priority: orderData.priority || 'normal',
          start_date: orderData.start_date || null,
          deadline: orderData.deadline || null,
          observations: orderData.observations || '',
          total_cost: orderData.total_cost || 0,
          total_revenue: orderData.total_revenue || 0,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Criar itens em batch
      const itemsToInsert = (orderData.items || []).map((item: any) => ({
        production_order_id: order.id,
        product_id: item.product_id || null,
        product_name: item.product_name,
      }));

      let createdItems: any[] = [];
      if (itemsToInsert.length > 0) {
        const { data: items, error: itemsError } = await sb
          .from('production_order_items')
          .insert(itemsToInsert)
          .select();
        if (itemsError) throw itemsError;
        createdItems = items || [];
      }

      // 3. Criar variações em batch (todas de uma vez)
      const variationsToInsert: any[] = [];
      (orderData.items || []).forEach((item: any, idx: number) => {
        const createdItem = createdItems[idx];
        if (createdItem) {
          (item.variations || []).forEach((v: any) => {
            variationsToInsert.push({
              item_id: createdItem.id,
              size: v.size,
              color: v.color,
              qty: v.qty,
              meters_per_piece: v.meters_per_piece,
            });
          });
        }
      });

      // 4. Preparar aviamentos em batch
      const trimsToInsert = (orderData.trims_used || []).map((trim: any) => ({
        production_order_id: order.id,
        trim_id: trim.trim_id || null,
        trim_name: trim.trim_name,
        qty_per_piece: trim.qty_per_piece,
        total_qty: trim.total_qty,
      }));

      // 5. Executar inserções em paralelo
      const parallelOps: Promise<unknown>[] = [];
      
      if (variationsToInsert.length > 0) {
        parallelOps.push(
          (async () => { await sb.from('production_order_variations').insert(variationsToInsert); })()
        );
      }
      
      if (trimsToInsert.length > 0) {
        parallelOps.push(
          (async () => { await sb.from('production_order_trims').insert(trimsToInsert); })()
        );
      }

      // 6. Atualizar estoque de tecido (em paralelo)
      if (orderData.fabric_id && orderData.fabric_meters_consumed > 0) {
        parallelOps.push(
          (async () => {
            const { data: fabric } = await sb
              .from('fabrics')
              .select('stock')
              .eq('id', orderData.fabric_id)
              .single();
            if (fabric) {
              await sb
                .from('fabrics')
                .update({ stock: Math.max(0, (fabric.stock ?? 0) - orderData.fabric_meters_consumed) })
                .eq('id', orderData.fabric_id);
            }
          })()
        );
      }

      // 7. Atualizar estoque de aviamentos (em paralelo)
      for (const trim of orderData.trims_used || []) {
        if (trim.trim_id && trim.total_qty > 0) {
          parallelOps.push(
            (async () => {
              const { data: trimData } = await sb
                .from('trims')
                .select('stock')
                .eq('id', trim.trim_id)
                .single();
              if (trimData) {
                await sb
                  .from('trims')
                  .update({ stock: Math.max(0, (trimData.stock ?? 0) - trim.total_qty) })
                  .eq('id', trim.trim_id);
              }
            })()
          );
        }
      }

      // Executar todas operações em paralelo
      await Promise.all(parallelOps);

      // Atualizar estado local (sem refetch)
      // Atualizar estado local (sem refetch)
      setData((prev) => [{ ...order, number, items: orderData.items } as unknown as typeof prev[0], ...prev]);
      
      return { ...order, number };
    } catch (err: any) {
      toast({ title: 'Erro ao criar OP', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  const cancel = async (id: string) => {
    if (!sb || !user) return false;

    try {
      const order = data.find((o) => o.id === id);
      if (!order) return false;

      const parallelOps: Promise<unknown>[] = [];

      // Devolver estoque de tecido (em paralelo)
      if (order.fabric_id && order.fabric_meters_consumed > 0) {
        parallelOps.push(
          (async () => {
            const { data: fabric } = await sb
              .from('fabrics')
              .select('stock')
              .eq('id', order.fabric_id)
              .single();
            if (fabric) {
              await sb
                .from('fabrics')
                .update({ stock: (fabric.stock ?? 0) + order.fabric_meters_consumed })
                .eq('id', order.fabric_id);
            }
          })()
        );
      }

      // Devolver estoque de aviamentos (em paralelo)
      for (const trim of order.trims_used || []) {
        if (trim.trim_id && trim.total_qty > 0) {
          parallelOps.push(
            (async () => {
              const { data: trimData } = await sb
                .from('trims')
                .select('stock')
                .eq('id', trim.trim_id)
                .single();
              if (trimData) {
                await sb
                  .from('trims')
                  .update({ stock: (trimData.stock ?? 0) + trim.total_qty })
                  .eq('id', trim.trim_id);
              }
            })()
          );
        }
      }

      // Atualizar status (em paralelo com devolução de estoque)
      parallelOps.push(
        (async () => {
          await sb
            .from('production_orders')
            .update({ status: 'cancelado' })
            .eq('id' as never, id);
        })()
      );

      await Promise.all(parallelOps);

      // Atualizar estado local
      setData((prev) => prev.map((o) => o.id === id ? { ...o, status: 'cancelado' } : o));
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao cancelar OP', description: message, variant: 'destructive' });
      return false;
    }
  };

  const remove = async (id: string) => {
    if (!sb || !user) return false;

    try {
      const order = data.find((o) => o.id === id);
      if (!order) return false;

      const parallelOps: Promise<unknown>[] = [];

      // Se não estiver cancelada, devolver estoque em paralelo
      if (order.status !== 'cancelado') {
        if (order.fabric_id && order.fabric_meters_consumed > 0) {
          parallelOps.push(
            (async () => {
              const { data: fabric } = await sb
                .from('fabrics')
                .select('stock')
                .eq('id', order.fabric_id)
                .single();
              if (fabric) {
                await sb
                  .from('fabrics')
                  .update({ stock: (fabric.stock ?? 0) + order.fabric_meters_consumed })
                  .eq('id', order.fabric_id);
              }
            })()
          );
        }

        for (const trim of order.trims_used || []) {
          if (trim.trim_id && trim.total_qty > 0) {
            parallelOps.push(
              (async () => {
                const { data: trimData } = await sb
                  .from('trims')
                  .select('stock')
                  .eq('id', trim.trim_id)
                  .single();
                if (trimData) {
                  await sb
                    .from('trims')
                    .update({ stock: (trimData.stock ?? 0) + trim.total_qty })
                    .eq('id', trim.trim_id);
                }
              })()
            );
          }
        }
      }

      // Aguardar devolução de estoque antes de deletar
      await Promise.all(parallelOps);

      // Deletar OP (cascata deleta itens, variações e aviamentos)
      await sb
        .from('production_orders')
        .delete()
        .eq('id' as never, id);

      // Atualizar estado local
      setData((prev) => prev.filter((o) => o.id !== id));
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast({ title: 'Erro ao excluir OP', description: message, variant: 'destructive' });
      return false;
    }
  };

  const update = async (orderId: string, orderData: any) => {
    if (!sb || !user) return null;

    try {
      const previousOrder = data.find((o) => o.id === orderId);
      const wasCancelled = previousOrder?.status === 'cancelado';
      const willBeCancelled = (orderData.status || 'modelagem') === 'cancelado';

      // 1. Devolver estoque da versão antiga (se ainda não estava cancelada)
      const revertOps: Promise<unknown>[] = [];
      if (previousOrder && !wasCancelled) {
        if (previousOrder.fabric_id && previousOrder.fabric_meters_consumed > 0) {
          revertOps.push((async () => {
            const { data: fabric } = await sb
              .from('fabrics')
              .select('stock')
              .eq('id', previousOrder.fabric_id)
              .maybeSingle();
            if (fabric) {
              await sb
                .from('fabrics')
                .update({ stock: (fabric.stock ?? 0) + previousOrder.fabric_meters_consumed })
                .eq('id', previousOrder.fabric_id);
            }
          })());
        }
        for (const trim of previousOrder.trims_used || []) {
          if (trim.trim_id && trim.total_qty > 0) {
            revertOps.push((async () => {
              const { data: trimData } = await sb
                .from('trims')
                .select('stock')
                .eq('id', trim.trim_id)
                .maybeSingle();
              if (trimData) {
                await sb
                  .from('trims')
                  .update({ stock: (trimData.stock ?? 0) + trim.total_qty })
                  .eq('id', trim.trim_id);
              }
            })());
          }
        }
      }
      await Promise.all(revertOps);

      // 2. Atualizar OP
      const { data: order, error: orderError } = await sb
        .from('production_orders')
        .update({
          fabric_id: orderData.fabric_id || null,
          fabric_name: orderData.fabric_name || '',
          fabric_meters_consumed: orderData.fabric_meters_consumed || 0,
          workshop_id: orderData.workshop_id || null,
          workshop_name: orderData.workshop_name || '',
          quantity: orderData.quantity || 0,
          status: orderData.status || 'modelagem',
          priority: orderData.priority || 'normal',
          start_date: orderData.start_date || null,
          deadline: orderData.deadline || null,
          observations: orderData.observations || '',
          total_cost: orderData.total_cost || 0,
          total_revenue: orderData.total_revenue || 0,
        })
        .eq('id', orderId)
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Deletar itens e aviamentos antigos
      await Promise.all([
        sb.from('production_order_items').delete().eq('production_order_id', orderId),
        sb.from('production_order_trims').delete().eq('production_order_id', orderId),
      ]);

      // 4. Criar novos itens + variações
      for (const item of orderData.items || []) {
        const { data: orderItem, error: itemError } = await sb
          .from('production_order_items')
          .insert({
            production_order_id: order.id,
            product_id: item.product_id || null,
            product_name: item.product_name,
          })
          .select()
          .single();

        if (itemError) throw itemError;

        const variationsToInsert = (item.variations || []).map((v: any) => ({
          item_id: orderItem.id,
          size: v.size,
          color: v.color,
          qty: v.qty,
          meters_per_piece: v.meters_per_piece,
        }));
        if (variationsToInsert.length > 0) {
          await sb.from('production_order_variations').insert(variationsToInsert);
        }
      }

      // 5. Inserir novos aviamentos
      const trimsToInsert = (orderData.trims_used || []).map((trim: any) => ({
        production_order_id: order.id,
        trim_id: trim.trim_id || null,
        trim_name: trim.trim_name,
        qty_per_piece: trim.qty_per_piece,
        total_qty: trim.total_qty,
      }));
      if (trimsToInsert.length > 0) {
        await sb.from('production_order_trims').insert(trimsToInsert);
      }

      // 6. Debitar estoque da nova versão (se não cancelada)
      const debitOps: Promise<unknown>[] = [];
      if (!willBeCancelled) {
        if (orderData.fabric_id && orderData.fabric_meters_consumed > 0) {
          debitOps.push((async () => {
            const { data: fabric } = await sb
              .from('fabrics')
              .select('stock')
              .eq('id', orderData.fabric_id)
              .maybeSingle();
            if (fabric) {
              await sb
                .from('fabrics')
                .update({ stock: Math.max(0, (fabric.stock ?? 0) - orderData.fabric_meters_consumed) })
                .eq('id', orderData.fabric_id);
            }
          })());
        }
        for (const trim of orderData.trims_used || []) {
          if (trim.trim_id && trim.total_qty > 0) {
            debitOps.push((async () => {
              const { data: trimData } = await sb
                .from('trims')
                .select('stock')
                .eq('id', trim.trim_id)
                .maybeSingle();
              if (trimData) {
                await sb
                  .from('trims')
                  .update({ stock: Math.max(0, (trimData.stock ?? 0) - trim.total_qty) })
                  .eq('id', trim.trim_id);
              }
            })());
          }
        }
      }
      await Promise.all(debitOps);

      await fetchData();
      return order;
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar OP', description: err.message, variant: 'destructive' });
      return null;
    }
  };

  return {
    data,
    loading,
    refetch: fetchData,
    create,
    update,
    cancel,
    remove,
    getNextOPNumber,
  };
}
