// @ts-nocheck
import { create } from 'zustand';
import { mockProductionOrders, mockFabrics, mockProducts, mockWorkshops, mockTrims } from './mock-data';
import type { Fabric, Product, Workshop, Trim } from './types';

export interface ProductionOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  variations: { id: string; size: string; color: string; qty: number; meters_per_piece: number }[];
}

export interface TrimUsage {
  trim_id: string;
  trim_name: string;
  qty_per_piece: number;
  total_qty: number;
}

export interface FullProductionOrder {
  id: string;
  number: string;
  fabric_id?: string;
  fabric_name?: string;
  fabric_meters_consumed: number;
  trims_used: TrimUsage[];
  items: ProductionOrderItem[];
  workshop_id?: string;
  workshop_name?: string;
  quantity: number;
  status: string;
  priority: string;
  start_date: string;
  deadline: string;
  observations: string;
  total_cost: number;
  total_revenue: number;
  created_at: string;
}

interface AppState {
  // Data
  fabrics: Fabric[];
  products: Product[];
  workshops: Workshop[];
  trims: Trim[];
  productionOrders: FullProductionOrder[];

  // Actions
  createProductionOrder: (order: Omit<FullProductionOrder, 'id' | 'number' | 'created_at'>) => FullProductionOrder;
  updateProductionOrder: (id: string, updates: Partial<FullProductionOrder>) => void;
  cancelProductionOrder: (id: string) => void;
  deleteProductionOrder: (id: string) => void;
  updateFabricStock: (fabricId: string, delta: number) => void;
  updateTrimStock: (trimId: string, delta: number) => void;
  getNextOPNumber: () => string;
}

// Convert legacy orders to full orders
const convertLegacyOrders = (): FullProductionOrder[] => {
  return mockProductionOrders.map((order, idx) => ({
    id: order.id,
    number: order.number || `OP-${String(idx + 1).padStart(3, '0')}`,
    fabric_id: order.fabric_id,
    fabric_name: '',
    fabric_meters_consumed: 0,
    trims_used: [],
    items: [
      {
        id: `item-${order.id}`,
        product_id: order.product_id,
        product_name: order.product_name,
        variations:
          order.variations?.map((v, i) => ({
            id: `var-${i}`,
            size: v.size,
            color: v.color,
            qty: v.qty,
            meters_per_piece: 0.8,
          })) || [{ id: 'var-0', size: 'M', color: 'Preto', qty: order.quantity, meters_per_piece: 0.8 }],
      },
    ],
    workshop_id: order.workshop_id,
    workshop_name: order.workshop_name || '',
    quantity: order.quantity,
    status: order.status,
    priority: 'normal',
    start_date: order.start_date || '',
    deadline: order.deadline || '',
    observations: '',
    total_cost: order.total_cost || 0,
    total_revenue: order.total_revenue || 0,
    created_at: order.start_date || new Date().toISOString(),
  }));
};

export const useAppStore = create<AppState>((set, get) => ({
  fabrics: [],
  products: [],
  workshops: [],
  trims: [],
  productionOrders: [],

  getNextOPNumber: () => {
    const orders = get().productionOrders;
    const nextNum = orders.length + 1;
    return `OP-${String(nextNum).padStart(3, '0')}`;
  },

  createProductionOrder: (orderData) => {
    const state = get();
    const id = `op-${Date.now()}`;
    const number = state.getNextOPNumber();

    const newOrder: FullProductionOrder = {
      ...orderData,
      id,
      number,
      created_at: new Date().toISOString(),
    };

    // Deduct fabric stock
    if (orderData.fabric_id && orderData.fabric_meters_consumed > 0) {
      state.updateFabricStock(orderData.fabric_id, -orderData.fabric_meters_consumed);
    }

    // Deduct trims stock
    orderData.trims_used.forEach((trimUsage) => {
      state.updateTrimStock(trimUsage.trim_id, -trimUsage.total_qty);
    });

    set((s) => ({
      productionOrders: [...s.productionOrders, newOrder],
    }));

    return newOrder;
  },

  updateProductionOrder: (id, updates) => {
    set((state) => {
      const orderIndex = state.productionOrders.findIndex((o) => o.id === id);
      if (orderIndex === -1) return state;

      const oldOrder = state.productionOrders[orderIndex];
      const newOrders = [...state.productionOrders];
      newOrders[orderIndex] = { ...oldOrder, ...updates };

      // Handle fabric stock changes
      let newFabrics = state.fabrics;
      if (updates.fabric_id !== undefined || updates.fabric_meters_consumed !== undefined) {
        const oldFabricId = oldOrder.fabric_id;
        const oldMeters = oldOrder.fabric_meters_consumed;
        const newFabricId = updates.fabric_id ?? oldOrder.fabric_id;
        const newMeters = updates.fabric_meters_consumed ?? oldOrder.fabric_meters_consumed;

        newFabrics = state.fabrics.map((f) => {
          if (f.id === oldFabricId) {
            return { ...f, stock: f.stock + oldMeters };
          }
          if (f.id === newFabricId) {
            return { ...f, stock: f.stock - newMeters };
          }
          return f;
        });
      }

      // Handle trims stock changes
      let newTrims = state.trims;
      if (updates.trims_used !== undefined) {
        // Return old trims
        oldOrder.trims_used.forEach((oldTrim) => {
          newTrims = newTrims.map((t) =>
            t.id === oldTrim.trim_id ? { ...t, stock: t.stock + oldTrim.total_qty } : t
          );
        });
        // Deduct new trims
        updates.trims_used.forEach((newTrim) => {
          newTrims = newTrims.map((t) =>
            t.id === newTrim.trim_id ? { ...t, stock: Math.max(0, t.stock - newTrim.total_qty) } : t
          );
        });
      }

      return { productionOrders: newOrders, fabrics: newFabrics, trims: newTrims };
    });
  },

  cancelProductionOrder: (id) => {
    set((state) => {
      const order = state.productionOrders.find((o) => o.id === id);
      if (!order) return state;

      // Return fabric to stock
      let newFabrics = state.fabrics;
      if (order.fabric_id && order.fabric_meters_consumed > 0) {
        newFabrics = state.fabrics.map((f) =>
          f.id === order.fabric_id ? { ...f, stock: f.stock + order.fabric_meters_consumed } : f
        );
      }

      // Return trims to stock
      let newTrims = state.trims;
      order.trims_used.forEach((trimUsage) => {
        newTrims = newTrims.map((t) =>
          t.id === trimUsage.trim_id ? { ...t, stock: t.stock + trimUsage.total_qty } : t
        );
      });

      // Update order status to cancelled
      const newOrders = state.productionOrders.map((o) =>
        o.id === id ? { ...o, status: 'cancelado' } : o
      );

      return { productionOrders: newOrders, fabrics: newFabrics, trims: newTrims };
    });
  },

  deleteProductionOrder: (id) => {
    set((state) => {
      const order = state.productionOrders.find((o) => o.id === id);
      if (!order) return state;

      // Return fabric to stock if not already cancelled
      let newFabrics = state.fabrics;
      if (order.status !== 'cancelado' && order.fabric_id && order.fabric_meters_consumed > 0) {
        newFabrics = state.fabrics.map((f) =>
          f.id === order.fabric_id ? { ...f, stock: f.stock + order.fabric_meters_consumed } : f
        );
      }

      // Return trims to stock if not already cancelled
      let newTrims = state.trims;
      if (order.status !== 'cancelado') {
        order.trims_used.forEach((trimUsage) => {
          newTrims = newTrims.map((t) =>
            t.id === trimUsage.trim_id ? { ...t, stock: t.stock + trimUsage.total_qty } : t
          );
        });
      }

      // Remove order
      const newOrders = state.productionOrders.filter((o) => o.id !== id);

      return { productionOrders: newOrders, fabrics: newFabrics, trims: newTrims };
    });
  },

  updateFabricStock: (fabricId, delta) => {
    set((state) => ({
      fabrics: state.fabrics.map((f) =>
        f.id === fabricId ? { ...f, stock: Math.max(0, f.stock + delta) } : f
      ),
    }));
  },

  updateTrimStock: (trimId, delta) => {
    set((state) => ({
      trims: state.trims.map((t) =>
        t.id === trimId ? { ...t, stock: Math.max(0, t.stock + delta) } : t
      ),
    }));
  },
}));
