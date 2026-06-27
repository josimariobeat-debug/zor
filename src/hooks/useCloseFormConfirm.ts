import { useNavigate } from 'react-router';
import { useConfirm } from '@/components/ui/confirm-dialog';

/**
 * Retorna um handler para fechar uma página de cadastro pedindo confirmação.
 * Use no botão X / Voltar / Cancelar dos formulários.
 */
export function useCloseFormConfirm(backTo: string) {
  const confirm = useConfirm();
  const navigate = useNavigate();

  return async () => {
    const ok = await confirm({
      title: 'Fechar formulário?',
      description: 'As alterações não salvas serão perdidas.',
      confirmText: 'Fechar sem salvar',
      cancelText: 'Continuar editando',
      level: 'medium',
    });
    if (ok) navigate(backTo);
  };
}
