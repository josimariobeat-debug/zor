export interface DeletionRecord {
  id: string;
  type: 'product' | 'fabric' | 'trim' | 'workshop' | 'supplier' | 'collection' | 'production_order' | 'stock_movement' | 'technical_sheet';
  name: string;
  data: Record<string, unknown>;
  deletedAt: Date;
  context?: { label: string; value: string | number }[];
}

const STORAGE_KEY = 'zor_deletion_history';
const MAX_RECORDS = 50;

export function addDeletionRecord(record: Omit<DeletionRecord, 'id' | 'deletedAt'>): DeletionRecord {
  const history = getDeletionHistory();
  const newRecord: DeletionRecord = {
    ...record,
    id: crypto.randomUUID(),
    deletedAt: new Date(),
  };
  
  const updated = [newRecord, ...history].slice(0, MAX_RECORDS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  
  return newRecord;
}

export function getDeletionHistory(): DeletionRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((r: DeletionRecord) => ({
      ...r,
      deletedAt: new Date(r.deletedAt),
    }));
  } catch {
    return [];
  }
}

export function clearDeletionHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function removeDeletionRecord(id: string): void {
  const history = getDeletionHistory();
  const updated = history.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getTypeLabel(type: DeletionRecord['type']): string {
  const labels: Record<DeletionRecord['type'], string> = {
    product: 'Produto',
    fabric: 'Tecido',
    trim: 'Aviamento',
    workshop: 'Oficina',
    supplier: 'Fornecedor',
    collection: 'Coleção',
    production_order: 'Ordem de Produção',
    stock_movement: 'Movimentação',
    technical_sheet: 'Ficha Técnica',
  };
  return labels[type] || type;
}
