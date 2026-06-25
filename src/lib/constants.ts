// Status colors for production orders
export const statusColors: Record<string, string> = {
  modelagem: 'bg-stone-100 text-stone-700 border-stone-200',
  corte: 'bg-amber-50 text-amber-800 border-amber-200',
  costura: 'bg-blue-50 text-blue-800 border-blue-200',
  revisao: 'bg-violet-50 text-violet-800 border-violet-200',
  finalizado: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  cancelado: 'bg-rose-50 text-rose-800 border-rose-200',
};

export const statusLabels: Record<string, string> = {
  modelagem: 'Modelagem',
  corte: 'Corte',
  costura: 'Costura',
  revisao: 'Revisão',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

export const fabricTypes = ['Malha', 'Alfaiataria', 'Crepe', 'Linho', 'Jeans', 'Moletom', 'Tricoline', 'Viscolycra', 'Seda', 'Couro', 'Outro'];
export const productCategories = ['Vestido', 'Saia', 'Cropped', 'Blusa', 'Calça', 'Blazer', 'Macacão', 'Outro'];
export const productStatuses = ['Rascunho', 'Ativo', 'Em Produção', 'Pausado', 'Arquivado'];
export const trimTypes = ['Linha', 'Ziper', 'Botao', 'Etiqueta', 'Elástico', 'Pedra', 'Bojo', 'Cordão', 'Tag', 'Embalagem', 'Outro'];
export const trimUnits = ['unidade', 'metro', 'rolo', 'pacote', 'kit'];
export const supplierTypes = ['Tecido', 'Aviamento', 'Serviço', 'Outro'];
export const collectionStatuses = ['Planejamento', 'Em produção', 'Lançada', 'Arquivada'];
export const workshopStatuses = ['Ativa', 'Pausada', 'Inativa'];
