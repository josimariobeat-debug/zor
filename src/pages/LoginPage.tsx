import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(form.email, form.password);
        if (error) {
          toast({ title: 'Erro ao entrar', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Bem-vindo!', description: 'Login realizado com sucesso' });
          navigate('/');
        }
      } else {
        const { error } = await signUp(form.email, form.password, form.name);
        if (error) {
          toast({ title: 'Erro ao criar conta', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Conta criada!', description: 'Verifique seu email para confirmar' });
          setIsLogin(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-ev-id="ev_233d900cd4" className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white">
        <div data-ev-id="ev_4fe3213fe2" className="text-center mb-8">
          <h1 data-ev-id="ev_32e79bf241" className="text-2xl font-bold text-stone-900">ModaFlow</h1>
          <p data-ev-id="ev_c8f0ae333a" className="text-stone-500 mt-1">
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
          </p>
        </div>

        <form data-ev-id="ev_a4455b6718" onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin &&
          <div data-ev-id="ev_5284c3c89f">
              <label data-ev-id="ev_c5d3ed3750" className="block text-sm font-medium text-stone-700 mb-1">Nome</label>
              <Input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Seu nome"
              required={!isLogin} />

            </div>
          }
          
          <div data-ev-id="ev_4b54caeda5">
            <label data-ev-id="ev_38d46243a5" className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="seu@email.com"
              required />

          </div>

          <div data-ev-id="ev_c290f33583">
            <label data-ev-id="ev_a4e9bf8ab9" className="block text-sm font-medium text-stone-700 mb-1">Senha</label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Sua senha"
              required
              minLength={6} />

          </div>

          <Button type="submit" disabled={loading} className="w-full mt-2 bg-stone-900 hover:bg-stone-800">
            {loading ?
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Aguarde...</> :

            isLogin ? 'Entrar' : 'Criar conta'
            }
          </Button>
        </form>

        <div data-ev-id="ev_815fe62d46" className="mt-6 text-center">
          <button data-ev-id="ev_d014da7d0a"
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-stone-600 hover:text-stone-900">

            {isLogin ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
          </button>
        </div>
      </Card>
    </div>);

}