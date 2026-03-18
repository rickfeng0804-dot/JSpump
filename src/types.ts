export interface ItemBatch {
  id: string; // 批號
  itemId: string;
  quantity: number;
  receivedDate: string; // 入庫日期，用於 FIFO
  expirationDate?: string; // 有效期限，用於 FEFO 或過期標示
}

export interface InventoryItem {
  id: string; // 零件/產品編號
  name: string; // 品名規格
  category: string; // 類別
  quantity: number; // 當前庫存量
  safetyStock: number; // 安全庫存位
  location: string; // 存放儲位
  unit: string; // 單位
  batches?: ItemBatch[]; // 批號庫存明細
}

export type TransactionType = '入庫' | '出庫' | '盤點' | '退貨' | '儲位移動';

export interface TransactionBatchDetail {
  batchId: string;
  quantity: number;
}

export interface Transaction {
  id: string; // Unique ID for the transaction
  timestamp: string; // 交易時間
  type: TransactionType; // 類型
  itemId: string; // 編號
  quantityChange: number; // 數量
  handler: string; // 經手人/單位
  documentNumber: string; // 單據號碼
  batchDetails?: TransactionBatchDetail[]; // 批號異動明細
}
