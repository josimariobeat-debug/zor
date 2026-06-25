// @ts-nocheck - Cloud habilitado mas tabelas ainda não criadas; remova após gerar tipos.
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Check, CheckCircle2, Loader2, Package } from 'lucide-react';

interface DispatchItem {
  id: string;
  product_name: string;
  size: string | null;
  color: string | null;
  qty: number;
  completed_qty: number;
  is_completed: boolean;
}

interface Dispatch {
  id: string;
  op_number: string;
  workshop_name: string | null;
  status: string;
  total_pieces: number;
  completed_pieces: number;
  sent_at: string;
  production_order_id: string;
}

// Agrupa itens por produto
function groupByProduct(items: DispatchItem[]) {
  const groups: Record<string, DispatchItem[]> = {};
  items.forEach((item) => {
    if (!groups[item.product_name]) {
      groups[item.product_name] = [];
    }
    groups[item.product_name].push(item);
  });
  return groups;
}

export default function PublicOpView() {
  const { token } = useParams();
  const [dispatch, setDispatch] = useState<Dispatch | null>(null);
  const [items, setItems] = useState<DispatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadDispatch();
  }, [token]);

  const loadDispatch = async () => {
    if (!supabase || !token) return;

    try {
      const { data, error: rpcError } = await supabase.rpc('public_get_dispatch', { _token: token });

      if (rpcError || !data || !(data as any).dispatch) {
        setError('Link inválido ou expirado');
        setLoading(false);
        return;
      }

      setDispatch((data as any).dispatch);
      setItems(((data as any).items as DispatchItem[]) || []);
    } catch (err) {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (item: DispatchItem) => {
    if (!supabase || !dispatch || !token) return;

    setUpdating(item.id);
    try {
      const newCompleted = !item.is_completed;

      await supabase.rpc('public_toggle_dispatch_item', {
        _token: token,
        _item_id: item.id,
        _completed: newCompleted,
      });

      const updatedItems = items.map((i) =>
      i.id === item.id ? { ...i, is_completed: newCompleted, completed_qty: newCompleted ? i.qty : 0 } : i
      );
      setItems(updatedItems);

      const completedPieces = updatedItems.
      filter((i) => i.is_completed).
      reduce((sum, i) => sum + i.qty, 0);

      setDispatch({ ...dispatch, completed_pieces: completedPieces });
    } finally {
      setUpdating(null);
    }
  };

  const finishAll = async () => {
    if (!supabase || !dispatch || !token) return;
    if (!confirm('Marcar toda a OP como finalizada?')) return;

    setUpdating('all');
    try {
      await supabase.rpc('public_finish_dispatch', { _token: token });

      setDispatch({ ...dispatch, status: 'finalizado', completed_pieces: dispatch.total_pieces });
      setItems(items.map((i) => ({ ...i, is_completed: true, completed_qty: i.qty })));
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div data-ev-id="ev_d49a686e64" className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>);

  }

  if (error || !dispatch) {
    return (
      <div data-ev-id="ev_2a74378ed3" className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-sm">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h1 data-ev-id="ev_1b8fd43503" className="text-lg font-semibold text-stone-900">{error || 'OP não encontrada'}</h1>
          <p data-ev-id="ev_6c7c1be20d" className="text-sm text-stone-500 mt-2">Verifique se o link está correto</p>
        </Card>
      </div>);

  }

  const progress = dispatch.total_pieces > 0 ?
  Math.round(dispatch.completed_pieces / dispatch.total_pieces * 100) :
  0;
  const isFinished = dispatch.status === 'finalizado';
  const groupedItems = groupByProduct(items);
  const productNames = Object.keys(groupedItems);

  return (
    <div data-ev-id="ev_5cb297665a" className="min-h-screen bg-stone-50">
      <div data-ev-id="ev_a60c72a49b" className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div data-ev-id="ev_e2e6b3f4d0" className="text-center mb-6">
          <h1 data-ev-id="ev_cf2d80d919" className="text-2xl font-bold text-stone-900">{dispatch.op_number}</h1>
          {dispatch.workshop_name &&
          <p data-ev-id="ev_402cd394d9" className="text-sm text-stone-500 mt-1">{dispatch.workshop_name}</p>
          }
          <p data-ev-id="ev_6a3bf21f17" className="text-xs text-stone-400 mt-1">
            Enviada em {new Date(dispatch.sent_at).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Progress */}
        <Card className="p-4 mb-4">
          <div data-ev-id="ev_05b8825275" className="flex items-center justify-between text-sm mb-2">
            <span data-ev-id="ev_d411c64662" className="text-stone-600">Progresso</span>
            <span data-ev-id="ev_8d654298ed" className="font-semibold text-stone-900">{dispatch.completed_pieces} / {dispatch.total_pieces} peças</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p data-ev-id="ev_b96b45952e" className="text-xs text-stone-500 mt-2 text-center">{progress}% concluído</p>
        </Card>

        {isFinished ?
        <Card className="p-6 text-center bg-emerald-50 border-emerald-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h2 data-ev-id="ev_c2c6e785a2" className="text-lg font-semibold text-emerald-900">OP Finalizada!</h2>
            <p data-ev-id="ev_6db4d89414" className="text-sm text-emerald-700 mt-1">Todas as peças foram concluídas</p>
          </Card> :

        <>
            {/* Items agrupados por produto */}
            <div data-ev-id="ev_a86272eb3d" className="flex flex-col gap-4 mb-4">
              {productNames.map((productName) => {
              const productItems = groupedItems[productName];
              const completedCount = productItems.filter((i) => i.is_completed).length;
              const totalCount = productItems.length;
              const allCompleted = completedCount === totalCount;

              return (
                <Card key={productName} className={`overflow-hidden ${allCompleted ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}>
                    {/* Header do produto */}
                    <div data-ev-id="ev_f5946b37d0" className={`px-4 py-3 border-b ${allCompleted ? 'border-emerald-200 bg-emerald-100/50' : 'border-stone-100 bg-stone-50'}`}>
                      <div data-ev-id="ev_f2988d4eb6" className="flex items-center justify-between">
                        <h3 data-ev-id="ev_bcb0764691" className={`font-semibold ${allCompleted ? 'text-emerald-900' : 'text-stone-900'}`}>
                          {productName}
                        </h3>
                        <span data-ev-id="ev_4e43e7209c" className={`text-xs font-medium px-2 py-1 rounded-full ${allCompleted ? 'bg-emerald-200 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                          {completedCount}/{totalCount}
                        </span>
                      </div>
                    </div>

                    {/* Variações (tamanho/cor) */}
                    <div data-ev-id="ev_347a363ad0" className="divide-y divide-stone-100">
                      {productItems.map((item) =>
                    <div data-ev-id="ev_dfe008f3bc"
                    key={item.id}
                    onClick={() => !updating && toggleItem(item)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${item.is_completed ? 'bg-emerald-50/50' : 'hover:bg-stone-50'}`}>

                          {/* Checkbox */}
                          <div data-ev-id="ev_6997ee26c0" className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      item.is_completed ?
                      'bg-emerald-500 border-emerald-500' :
                      'border-stone-300 bg-white'}`
                      }>
                            {item.is_completed && <Check className="w-3 h-3 text-white" />}
                            {updating === item.id && <Loader2 className="w-3 h-3 animate-spin text-stone-400" />}
                          </div>

                          {/* Info da variação */}
                          <div data-ev-id="ev_817227dc5c" className="flex-1 min-w-0">
                            <div data-ev-id="ev_a221196358" className="flex items-center gap-2">
                              <span data-ev-id="ev_f7e594d8e6" className={`text-sm font-medium ${item.is_completed ? 'text-emerald-800 line-through' : 'text-stone-800'}`}>
                                Tam: {item.size || '-'}
                              </span>
                              <span data-ev-id="ev_a1407ca72e" className="text-stone-300">|</span>
                              <span data-ev-id="ev_5ec71591df" className={`text-sm ${item.is_completed ? 'text-emerald-700 line-through' : 'text-stone-600'}`}>
                                Cor: {item.color || '-'}
                              </span>
                            </div>
                          </div>

                          {/* Quantidade */}
                          <div data-ev-id="ev_f209d0e44b" className={`text-sm font-semibold px-2 py-0.5 rounded ${item.is_completed ? 'bg-emerald-200 text-emerald-800' : 'bg-stone-100 text-stone-700'}`}>
                            {item.qty} pç
                          </div>
                        </div>
                    )}
                    </div>
                  </Card>);

            })}
            </div>

            {/* Finish Button */}
            <Button
            onClick={finishAll}
            disabled={updating === 'all'}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white text-base gap-2">

              {updating === 'all' ?
            <Loader2 className="w-5 h-5 animate-spin" /> :

            <CheckCircle2 className="w-5 h-5" />
            }
              Finalizar OP
            </Button>
          </>
        }
      </div>
    </div>);

}