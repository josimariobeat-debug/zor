// @ts-nocheck - Cloud habilitado mas tabelas ainda não criadas; remova após gerar tipos.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { statusColors, statusLabels } from '@/lib/constants';
import { Pin, Plus, Trash2, Loader2, Image, Video, X, Upload } from 'lucide-react';
import { useProductionOrders } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface CalendarNote {
  id: string;
  date: string;
  text: string | null;
  attachment_url: string | null;
  attachment_type: 'image' | 'video' | null;
}

export default function ProductionCalendar() {
  const { user } = useAuth();
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState(today.toISOString().slice(0, 10));
  const { data: orders } = useProductionOrders();
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const fmt = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const opsOn = (d: number) => orders.filter((o) => o.start_date === fmt(d) || o.deadline === fmt(d));
  const notesOn = (d: number) => notes.filter((n) => n.date === fmt(d));
  const selectedOps = selected ? orders.filter((o) => o.start_date === selected || o.deadline === selected) : [];
  const selectedNotes = selected ? notes.filter((n) => n.date === selected) : [];

  // Carregar notas do banco de dados
  useEffect(() => {
    const loadNotes = async () => {
      if (!supabase || !user) return;
      setLoadingNotes(true);

      const startOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const endOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-${daysInMonth}`;

      const { data } = await supabase.
      from('calendar_notes').
      select('*').
      gte('date', startOfMonth).
      lte('date', endOfMonth).
      order('created_at', { ascending: false });

      setNotes((data as CalendarNote[]) || []);
      setLoadingNotes(false);
    };

    loadNotes();
  }, [user, month, year, daysInMonth]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      toast({ title: 'Arquivo inválido', description: 'Selecione uma imagem ou vídeo.', variant: 'destructive' });
      return;
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'O tamanho máximo é 10MB.', variant: 'destructive' });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addNote = async () => {
    if (!newNote.trim() && !selectedFile || !selected || !supabase || !user) return;

    setUploading(true);
    try {
      let attachmentUrl: string | null = null;
      let attachmentType: 'image' | 'video' | null = null;

      // Fazer upload do arquivo se houver
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        // Para simplificar, vamos converter para base64 e salvar como data URL
        // Em produção, você usaria Supabase Storage
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onloadend = () => {
            attachmentUrl = reader.result as string;
            resolve();
          };
          reader.readAsDataURL(selectedFile);
        });

        attachmentType = selectedFile.type.startsWith('image/') ? 'image' : 'video';
      }

      const { data, error } = await supabase.
      from('calendar_notes').
      insert({
        user_id: user.id,
        date: selected,
        text: newNote.trim() || null,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType
      }).
      select().
      single();

      if (error) throw error;

      setNotes((prev) => [data as CalendarNote, ...prev]);
      setNewNote('');
      clearFile();
      toast({ title: 'Anotação adicionada' });
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const removeNote = async (id: string) => {
    if (!supabase) return;
    await supabase.from('calendar_notes').delete().eq('id', id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast({ title: 'Anotação removida' });
  };

  return (
    <div data-ev-id="ev_0db1ab3ec0" className="flex flex-col gap-6">
      <header data-ev-id="ev_41007170b0">
        <h1 data-ev-id="ev_d10749e5d2" className="text-[26px] font-semibold text-stone-900 tracking-tight">Calendário de Produção</h1>
        <p data-ev-id="ev_85feab9c43" className="text-sm text-stone-500 mt-1">Visualize OPs, crie anotações e anexe arquivos</p>
      </header>

      <div data-ev-id="ev_f008945399" className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-6 bg-white border-stone-200/80 shadow-none">
          <div data-ev-id="ev_1865ee2506" className="flex items-center justify-between mb-5">
            <h3 data-ev-id="ev_c98e7e27c6" className="text-base font-semibold text-stone-900">{monthNames[month]} {year}</h3>
            <div data-ev-id="ev_defef0a651" className="flex gap-1">
              <button data-ev-id="ev_323ab86846" onClick={() => {if (month === 0) {setMonth(11);setYear(year - 1);} else setMonth(month - 1);}} className="px-3 h-8 rounded-lg border border-stone-200 text-sm hover:bg-stone-50">←</button>
              <button data-ev-id="ev_04a76124de" onClick={() => {setMonth(today.getMonth());setYear(today.getFullYear());}} className="px-3 h-8 rounded-lg border border-stone-200 text-xs font-medium hover:bg-stone-50">Hoje</button>
              <button data-ev-id="ev_7adf372b28" onClick={() => {if (month === 11) {setMonth(0);setYear(year + 1);} else setMonth(month + 1);}} className="px-3 h-8 rounded-lg border border-stone-200 text-sm hover:bg-stone-50">→</button>
            </div>
          </div>
          <div data-ev-id="ev_f771f998d1" className="grid grid-cols-7 gap-1">
            {dayNames.map((d) => <div data-ev-id="ev_addc3041cf" key={d} className="text-center text-[11px] font-semibold uppercase tracking-wider text-stone-500 py-2">{d}</div>)}
            {cells.map((d, i) => {
              const ops = d ? opsOn(d) : [];
              const dnotes = d ? notesOn(d) : [];
              const isSel = d && selected === fmt(d);
              const hasAttachment = dnotes.some((n) => n.attachment_url);
              return (
                <button data-ev-id="ev_5a499f405e" key={i} disabled={!d} onClick={() => d && setSelected(fmt(d))}
                className={`aspect-square rounded-lg border p-1.5 text-xs text-left transition-all ${!d ? 'border-transparent' : isSel ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white hover:border-stone-400'}`}>
                  {d &&
                  <>
                      <div data-ev-id="ev_cf74ca2b68" className={`font-medium ${isSel ? 'text-white' : 'text-stone-700'}`}>{d}</div>
                      <div data-ev-id="ev_a83796096b" className="mt-0.5 flex flex-col gap-0.5">
                        {ops.slice(0, 2).map((op) =>
                      <div data-ev-id="ev_5fbfba1146" key={op.id} className={`text-[9px] truncate px-1 py-0.5 rounded ${isSel ? 'bg-white/20 text-white' : statusColors[op.status] || ''} border-0`}>▶ {op.items?.[0]?.product_name || op.number}</div>
                      )}
                        {dnotes.length > 0 &&
                      <div data-ev-id="ev_44188b2510" className={`text-[9px] flex items-center gap-0.5 ${isSel ? 'text-white' : 'text-amber-700'}`}>
                            {hasAttachment ? <Image className="w-2.5 h-2.5" /> : <Pin className="w-2.5 h-2.5" />}
                            {dnotes.length}
                          </div>
                      }
                      </div>
                    </>
                  }
                </button>);

            })}
          </div>
        </Card>

        <Card className="p-6 bg-white border-stone-200/80 shadow-none">
          <h3 data-ev-id="ev_b206e5edd8" className="text-base font-semibold text-stone-900 mb-1">
            {selected ? new Date(selected + 'T00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Selecione um dia'}
          </h3>
          <p data-ev-id="ev_a75da6031f" className="text-xs text-stone-500 mb-5">{selectedOps.length} OPs · {selectedNotes.length} anotações</p>
          
          <div data-ev-id="ev_778eb6d7e5" className="flex flex-col gap-4">
            {/* OPs */}
            <div data-ev-id="ev_59e703ca8d">
              <div data-ev-id="ev_b91e82db7f" className="text-[11px] uppercase tracking-widest text-stone-400 font-medium mb-2">OPs</div>
              {selectedOps.length === 0 ?
              <p data-ev-id="ev_5d2ef3f566" className="text-sm text-stone-400">Sem OPs neste dia</p> :

              selectedOps.map((op) =>
              <div data-ev-id="ev_2ed666ab9d" key={op.id} className="py-2 px-3 rounded-lg bg-stone-50 border border-stone-200 mb-1.5">
                    <div data-ev-id="ev_cd7ddbe691" className="flex items-center justify-between">
                      <span data-ev-id="ev_e5962ca19b" className="text-sm font-medium text-stone-900">{op.items?.[0]?.product_name || op.number}</span>
                      <Badge className={`${statusColors[op.status] || ''} text-[10px] border`}>{statusLabels[op.status] || op.status}</Badge>
                    </div>
                    <div data-ev-id="ev_2db5f1e1ac" className="text-[11px] text-stone-500 mt-0.5">{op.number} · {op.quantity} peças</div>
                  </div>
              )
              }
            </div>

            {/* Anotações */}
            <div data-ev-id="ev_6d6d2a6893">
              <div data-ev-id="ev_eac09a0dec" className="text-[11px] uppercase tracking-widest text-stone-400 font-medium mb-2">Anotações</div>
              {loadingNotes ?
              <div data-ev-id="ev_c329f17080" className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
                </div> :

              <>
                  {selectedNotes.map((n) =>
                <div data-ev-id="ev_99fb2f7798" key={n.id} className="rounded-lg border border-amber-200 bg-amber-50 mb-2 overflow-hidden">
                      {n.attachment_url &&
                  <div data-ev-id="ev_193784dc37" className="bg-stone-900 p-2">
                          {n.attachment_type === 'image' ?
                    <img data-ev-id="ev_f4603676d2"
                    src={n.attachment_url}
                    alt="Anexo"
                    className="w-full h-32 object-cover rounded" /> :


                    <video data-ev-id="ev_4509dfb0b3"
                    src={n.attachment_url}
                    controls
                    className="w-full h-32 object-cover rounded" />

                    }
                        </div>
                  }
                      <div data-ev-id="ev_973523ed59" className="flex items-start gap-2 p-3">
                        <span data-ev-id="ev_ff09eb3cf9" className="flex-1 text-xs text-stone-700">
                          {n.text || (n.attachment_type === 'image' ? 'Imagem anexada' : 'Vídeo anexado')}
                        </span>
                        <button data-ev-id="ev_dc4bbf2c6a" onClick={() => removeNote(n.id)} className="text-stone-400 hover:text-rose-700">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                )}

                  {/* Adicionar nova anotação */}
                  <div data-ev-id="ev_b984a7f169" className="flex flex-col gap-2 mt-3">
                    {/* Preview do arquivo selecionado */}
                    {previewUrl &&
                  <div data-ev-id="ev_039ac18572" className="relative rounded-lg border border-stone-200 overflow-hidden">
                        {selectedFile?.type.startsWith('image/') ?
                    <img data-ev-id="ev_8200042ca7" src={previewUrl} alt="Preview" className="w-full h-24 object-cover" /> :

                    <video data-ev-id="ev_171a17fa27" src={previewUrl} className="w-full h-24 object-cover" />
                    }
                        <button data-ev-id="ev_7250513f40"
                    onClick={clearFile}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-stone-900/70 text-white flex items-center justify-center hover:bg-stone-900">

                          <X className="w-4 h-4" />
                        </button>
                      </div>
                  }

                    <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Nova anotação..."
                    className="text-xs min-h-[60px] resize-none" />


                    <div data-ev-id="ev_f94054be57" className="flex gap-2">
                      <input data-ev-id="ev_21057c04b6"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden" />

                      <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-9 px-3 gap-1.5">

                        <Upload className="w-3.5 h-3.5" />
                        Anexar
                      </Button>
                      <Button
                      onClick={addNote}
                      disabled={uploading || !newNote.trim() && !selectedFile}
                      size="sm"
                      className="flex-1 bg-stone-900 hover:bg-stone-800 text-white h-9">

                        {uploading ?
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> :

                      <><Plus className="w-3.5 h-3.5 mr-1" /> Adicionar</>
                      }
                      </Button>
                    </div>
                  </div>
                </>
              }
            </div>
          </div>
        </Card>
      </div>
    </div>);

}