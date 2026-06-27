/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Check, CheckCircle2, Loader2, Package, Shirt, X } from 'lucide-react';
import logoAsset from '@/assets/default-logo.png.asset.json';

interface DispatchItem {
  id: string;
  product_name: string;
  product_image: string | null;
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

function groupByProduct(items: DispatchItem[]) {
  const groups: Record<string, DispatchItem[]> = {};
  items.forEach((item) => {
    if (!groups[item.product_name]) groups[item.product_name] = [];
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
      const completedPieces = updatedItems.filter((i) => i.is_completed).reduce((sum, i) => sum + i.qty, 0);
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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (error || !dispatch) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-sm">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-stone-900">{error || 'OP não encontrada'}</h1>
          <p className="text-sm text-stone-500 mt-2">Verifique se o link está correto</p>
        </Card>
      </div>
    );
  }

  const progress = dispatch.total_pieces > 0
    ? Math.round((dispatch.completed_pieces / dispatch.total_pieces) * 100)
    : 0;
  const isFinished = dispatch.status === 'finalizado';
  const groupedItems = groupByProduct(items);
  const productNames = Object.keys(groupedItems);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={logoAsset.url} alt="Logo" className="h-20 w-auto object-contain" />
        </div>

        {/* Status badge */}
        <div className="flex justify-center mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
              isFinished ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isFinished ? 'OP Finalizada' : 'OP em andamento'}
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">{dispatch.op_number}</h1>
          {dispatch.workshop_name && (
            <p className="text-base text-stone-700 mt-1">{dispatch.workshop_name}</p>
          )}
          <p className="text-xs text-stone-400 mt-1">
            Enviada em {new Date(dispatch.sent_at).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Progress */}
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-stone-600">Progresso</span>
            <span className="font-semibold text-stone-900">
              {dispatch.completed_pieces} de {dispatch.total_pieces} peças
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-stone-500 mt-2 text-center">{progress}% concluído</p>
        </Card>

        {/* Items */}
        <div className="flex flex-col gap-4 mb-4">
          {productNames.map((productName) => {
            const productItems = groupedItems[productName];
            const completedCount = productItems.filter((i) => i.is_completed).length;
            const totalCount = productItems.length;
            const allCompleted = completedCount === totalCount;

            return (
              <Card
                key={productName}
                className={`overflow-hidden ${allCompleted ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}
              >
                <div
                  className={`px-4 py-3 border-b flex items-center justify-between ${
                    allCompleted ? 'border-emerald-200 bg-emerald-100/50' : 'border-stone-100 bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {productItems[0]?.product_image ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage(productItems[0].product_image!);
                        }}
                        className="w-10 h-10 rounded-md overflow-hidden border border-stone-200 bg-white flex-shrink-0 hover:ring-2 hover:ring-emerald-400 transition"
                      >
                        <img
                          src={productItems[0].product_image!}
                          alt={productName}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-md flex items-center justify-center ${
                          allCompleted ? 'bg-emerald-200 text-emerald-700' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        <Shirt className="w-4 h-4" strokeWidth={1.75} />
                      </div>
                    )}
                    <h3 className={`font-semibold ${allCompleted ? 'text-emerald-900' : 'text-stone-900'}`}>
                      {productName}
                    </h3>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      allCompleted ? 'bg-emerald-200 text-emerald-800' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {completedCount} / {totalCount}
                  </span>
                </div>

                <div className="divide-y divide-stone-100">
                  {productItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => !updating && !isFinished && toggleItem(item)}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        isFinished ? '' : 'cursor-pointer hover:bg-stone-50'
                      } ${item.is_completed ? 'bg-emerald-50/40' : ''}`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          item.is_completed
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-emerald-300 bg-white'
                        }`}
                      >
                        {item.is_completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        {updating === item.id && <Loader2 className="w-3 h-3 animate-spin text-stone-400" />}
                      </div>

                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            item.is_completed ? 'text-emerald-800 line-through' : 'text-stone-800'
                          }`}
                        >
                          Tam: {item.size || '-'}
                        </span>
                        <span className="text-stone-300">|</span>
                        <span
                          className={`text-sm ${
                            item.is_completed ? 'text-emerald-700 line-through' : 'text-stone-600'
                          }`}
                        >
                          Cor: {item.color || '-'}
                        </span>
                      </div>

                      <div
                        className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                          item.is_completed ? 'bg-emerald-200 text-emerald-800' : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {item.qty} peça{item.qty > 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {!isFinished && (
          <>
            <Button
              onClick={finishAll}
              disabled={updating === 'all'}
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold gap-2 rounded-xl shadow-sm"
            >
              {updating === 'all' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              Finalizar OP
            </Button>
            <p className="text-center text-xs text-emerald-700/80 mt-3 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Marque todas as peças conferidas para finalizar esta OP.
            </p>
          </>
        )}

        {isFinished && (
          <Card className="p-6 text-center bg-emerald-50 border-emerald-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-emerald-900">OP Finalizada!</h2>
            <p className="text-sm text-emerald-700 mt-1">Todas as peças foram concluídas</p>
          </Card>
        )}
      </div>

      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in"
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={previewImage}
            alt="Pré-visualização do produto"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
