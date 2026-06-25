export interface Product {
  id: string;
  name: string;
  sku: string;
  internal_code?: string;
  category: string;
  collection_id?: string;
  sizes: string[];
  colors: string[];
  stock: number;
  cost_price: number;
  sale_price: number;
  margin: number;
  description?: string;
  status: string;
  image?: string;
  fabric_ids?: string[];
  trim_ids?: string[];
  workshop_id?: string;
  labor_cost?: number;
  operational_cost?: number;
  meters_per_unit?: number;
}

export interface Fabric {
  id: string;
  name: string;
  type: string;
  color: string;
  supplier_id?: string;
  width: number;
  gramatura: number;
  stock: number;
  price_per_meter: number;
  location?: string;
  min_stock?: number;
}

export interface Trim {
  id: string;
  name: string;
  type: string;
  supplier_id?: string;
  stock: number;
  unit: string;
  price_per_unit: number;
  min_stock: number;
}

export interface Workshop {
  id: string;
  name: string;
  specialty: string;
  phone?: string;
  email?: string;
  price_per_piece: number;
  rating: number;
  status: string;
  in_progress: number;
}

export interface Supplier {
  id: string;
  name: string;
  type: string;
  contact?: string;
  phone?: string;
  email?: string;
  city?: string;
  lead_time: number;
  rating: number;
  status: string;
}

export interface Collection {
  id: string;
  name: string;
  season?: string;
  launch_date?: string;
  goal: number;
  status: string;
  products?: number;
  image?: string;
  description?: string;
}

export interface ProductionOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  variations: { id: string; size: string; color: string; qty: number; meters_per_piece: number }[];
  unit_cost: number;
  fabric_cost: number;
  trim_cost: number;
  labor_cost: number;
  total_cost: number;
  total_revenue: number;
}

export interface ProductionOrder {
  id: string;
  number: string;
  fabric_id?: string;
  fabric_name?: string;
  fabric_meters_available?: number;
  fabric_meters_consumed?: number;
  items: ProductionOrderItem[];
  workshop_id?: string;
  workshop_name?: string;
  quantity: number;
  status: string;
  priority: string;
  start_date?: string;
  deadline?: string;
  observations?: string;
  total_cost?: number;
  total_revenue?: number;
  // Legacy single product support
  product_id?: string;
  product_name?: string;
  variations?: { size: string; color: string; qty: number }[];
}

export interface TechnicalSheet {
  id: string;
  product_id: string;
  product_name: string;
  fabric_cost: number;
  trims_cost: number;
  labor_cost: number;
  total_cost: number;
  suggested_price: number;
}

export interface StockMovement {
  id: string;
  type: 'Entrada' | 'Saida';
  category: 'Tecido' | 'Aviamento';
  item: string;
  qty: number;
  unit: string;
  reason?: string;
  date: string;
}

export interface Note {
  id: string;
  date: string;
  text: string;
  type: string;
}

export interface Dispatch {
  id: string;
  op_number: string;
  workshop_name: string;
  sent_at: string;
  total: number;
  completed: number;
  status: string;
}

export interface Brand {
  name: string;
  slogan: string;
  logo_url?: string;
}
