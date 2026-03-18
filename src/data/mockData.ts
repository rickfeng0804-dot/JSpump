import { InventoryItem, Transaction } from '../types';

export const initialInventory: InventoryItem[] = [
  { 
    id: 'PX-100-2024', name: '沉水泵浦 1HP / 304不鏽鋼', category: '成品', quantity: 50, safetyStock: 10, location: 'A-05-02', unit: '台',
    batches: [
      { id: 'B-20240110', itemId: 'PX-100-2024', quantity: 20, receivedDate: '2024-01-10T08:00:00Z' },
      { id: 'B-20240215', itemId: 'PX-100-2024', quantity: 30, receivedDate: '2024-02-15T09:00:00Z' }
    ]
  },
  { 
    id: 'PX-200-2024', name: '沉水泵浦 2HP / 304不鏽鋼', category: '成品', quantity: 8, safetyStock: 15, location: 'A-05-03', unit: '台',
    batches: [
      { id: 'B-20240201', itemId: 'PX-200-2024', quantity: 8, receivedDate: '2024-02-01T10:00:00Z' }
    ]
  },
  { 
    id: 'PT-001', name: '防水墊圈 50mm', category: '零件', quantity: 500, safetyStock: 100, location: 'B-01-01', unit: '個',
    batches: [
      { id: 'B-20231201', itemId: 'PT-001', quantity: 200, receivedDate: '2023-12-01T08:00:00Z' },
      { id: 'B-20240316', itemId: 'PT-001', quantity: 300, receivedDate: '2024-03-16T09:30:00Z' }
    ]
  },
  { 
    id: 'PT-002', name: '軸承 6204ZZ', category: '零件', quantity: 120, safetyStock: 50, location: 'B-02-05', unit: '個',
    batches: [
      { id: 'B-20240120', itemId: 'PT-002', quantity: 120, receivedDate: '2024-01-20T14:00:00Z' }
    ]
  },
  { 
    id: 'CM-001', name: '潤滑油 5L', category: '耗材', quantity: 5, safetyStock: 10, location: 'C-01-01', unit: '桶',
    batches: [
      { id: 'B-20231115', itemId: 'CM-001', quantity: 5, receivedDate: '2023-11-15T11:00:00Z' }
    ]
  },
];

export const initialTransactions: Transaction[] = [
  { id: 'TXN-001', timestamp: '2024-03-17T14:00:00', type: '出庫', itemId: 'PX-100-2024', quantityChange: -5, handler: '生產部-王小明', documentNumber: 'PO-88992' },
  { id: 'TXN-002', timestamp: '2024-03-16T09:30:00', type: '入庫', itemId: 'PT-001', quantityChange: 200, handler: '採購部-李四', documentNumber: 'IN-20240316-01' },
  { id: 'TXN-003', timestamp: '2024-03-15T16:45:00', type: '盤點', itemId: 'CM-001', quantityChange: -2, handler: '倉管-張三', documentNumber: 'INV-20240315' },
];
