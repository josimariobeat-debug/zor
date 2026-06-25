import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const [brand, setBrand] = useState({ name: 'ZOR', slogan: 'Controle de Produção', logo_url: '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    // Simulated save
    setTimeout(() => {
      toast({ title: 'Identidade salva', description: 'Atualizado com sucesso.' });
      setSaving(false);
    }, 500);
  };

  return (
    <div data-ev-id="ev_02b0aca92b" className="flex flex-col gap-6">
      <header data-ev-id="ev_adba452af9">
        <h1 data-ev-id="ev_ff4f2cc54c" className="text-[26px] font-semibold text-stone-900 tracking-tight">Configurações</h1>
        <p data-ev-id="ev_d343772b8b" className="text-sm text-stone-500 mt-1">Personalize seu sistema</p>
      </header>
      <Tabs defaultValue="identidade">
        <TabsList className="bg-white border border-stone-200 p-1 rounded-lg">
          <TabsTrigger value="identidade" className="data-[state=active]:bg-stone-900 data-[state=active]:text-white text-xs rounded-md">Identidade Visual</TabsTrigger>
          <TabsTrigger value="perfil" className="data-[state=active]:bg-stone-900 data-[state=active]:text-white text-xs rounded-md">Perfil</TabsTrigger>
          <TabsTrigger value="wbuy" className="data-[state=active]:bg-stone-900 data-[state=active]:text-white text-xs rounded-md">Integração WBuy</TabsTrigger>
          <TabsTrigger value="sistema" className="data-[state=active]:bg-stone-900 data-[state=active]:text-white text-xs rounded-md">Sistema</TabsTrigger>
        </TabsList>
        <TabsContent value="identidade" className="mt-5">
          <Card className="p-6 bg-white border-stone-200/80 shadow-none max-w-2xl">
            <h3 data-ev-id="ev_2f2d3c2290" className="text-base font-semibold text-stone-900">Identidade Visual do App</h3>
            <p data-ev-id="ev_5f3fa31e7b" className="text-xs text-stone-500 mt-1 mb-5">Personalize o nome e logo que aparecem na barra lateral.</p>
            <div data-ev-id="ev_8dd7202c97" className="flex flex-col gap-4">
              <div data-ev-id="ev_b1cf98e948"><Label className="text-sm">Nome do App</Label><Input value={brand.name || ''} onChange={(e) => setBrand({ ...brand, name: e.target.value })} className="mt-1.5" /></div>
              <div data-ev-id="ev_928753d796"><Label className="text-sm">Slogan / Subtítulo</Label><Input value={brand.slogan || ''} onChange={(e) => setBrand({ ...brand, slogan: e.target.value })} className="mt-1.5" /></div>
              <div data-ev-id="ev_bd2564276e"><Label className="text-sm">URL do Logo</Label><Input value={brand.logo_url || ''} onChange={(e) => setBrand({ ...brand, logo_url: e.target.value })} className="mt-1.5" placeholder="https://..." /></div>
              <Button onClick={save} disabled={saving} className="bg-stone-900 hover:bg-stone-800 text-white w-fit">{saving ? 'Salvando...' : 'Salvar Identidade Visual'}</Button>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="perfil" className="mt-5"><Card className="p-6 bg-white border-stone-200/80 shadow-none max-w-2xl"><p data-ev-id="ev_0c419352c8" className="text-sm text-stone-500">Configurações de perfil em breve.</p></Card></TabsContent>
        <TabsContent value="wbuy" className="mt-5">
          <Card className="p-6 bg-white border-stone-200/80 shadow-none max-w-2xl">
            <h3 data-ev-id="ev_4bc379620a" className="text-base font-semibold text-stone-900 mb-4">Integração WBuy</h3>
            <div data-ev-id="ev_567f214408" className="flex flex-col gap-3"><div data-ev-id="ev_09a7a78742"><Label className="text-sm">API KEY</Label><Input placeholder="********" className="mt-1.5" /></div><div data-ev-id="ev_97c753dbf1"><Label className="text-sm">Secret</Label><Input placeholder="********" className="mt-1.5" /></div><div data-ev-id="ev_5498f101ee"><Label className="text-sm">URL da Loja</Label><Input placeholder="https://..." className="mt-1.5" /></div><Button className="bg-stone-900 hover:bg-stone-800 text-white w-fit">Sincronizar Produtos</Button></div>
          </Card>
        </TabsContent>
        <TabsContent value="sistema" className="mt-5"><Card className="p-6 bg-white border-stone-200/80 shadow-none max-w-2xl"><p data-ev-id="ev_5c67613c02" className="text-sm text-stone-500">Versão 1.0.0 · Backup automático ativado</p></Card></TabsContent>
      </Tabs>
    </div>);

}