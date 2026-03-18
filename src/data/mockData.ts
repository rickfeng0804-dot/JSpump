import { InventoryItem, Transaction } from '../types';

export const initialInventory: InventoryItem[] = [
  { id: 'PX-100-2024', name: '沉水泵浦 1HP / 304不鏽鋼', category: '成品', quantity: 50, safetyStock: 10, location: 'A-05-02', unit: '台' },
  { id: 'PX-200-2024', name: '沉水泵浦 2HP / 304不鏽鋼', category: '成品', quantity: 8, safetyStock: 15, location: 'A-05-03', unit: '台' },
  { id: 'PT-001', name: '防水墊圈 50mm', category: '零件', quantity: 500, safetyStock: 100, location: 'B-01-01', unit: '個' },
  { id: 'PT-002', name: '軸承 6204ZZ', category: '零件', quantity: 120, safetyStock: 50, location: 'B-02-05', unit: '個' },
  { id: 'CM-001', name: '潤滑油 5L', category: '耗材', quantity: 5, safetyStock: 10, location: 'C-01-01', unit: '桶' },
];

export const initialTransactions: Transaction[] = [
  { id: 'TXN-001', timestamp: '2024-03-17T14:00:00', type: '出庫', itemId: 'PX-100-2024', quantityChange: -5, handler: '生產部-王小明', documentNumber: 'PO-88992' },
  { id: 'TXN-002', timestamp: '2024-03-16T09:30:00', type: '入庫', itemId: 'PT-001', quantityChange: 200, handler: '採購部-李四', documentNumber: 'IN-20240316-01' },
  { id: 'TXN-003', timestamp: '2024-03-15T16:45:00', type: '盤點', itemId: 'CM-001', quantityChange: -2, handler: '倉管-張三', documentNumber: 'INV-20240315' },
];
