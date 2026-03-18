import React from 'react';
import { InventoryItem, Transaction } from '../types';
import { Download, Database, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';

interface SettingsProps {
  inventory: InventoryItem[];
  transactions: Transaction[];
}

export function Settings({ inventory, transactions }: SettingsProps) {
  const downloadCSV = (content: string, filename: string) => {
    // Add BOM for Excel UTF-8 compatibility
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const escapeCSV = (str: string | number) => {
    const stringValue = String(str);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const handleExportInventory = () => {
    const headers = ['零件/產品編號', '品名規格', '類別', '當前庫存量', '安全庫存位', '存放儲位', '單位', '批號明細'];
    const rows = inventory.map(item => {
      const batchInfo = item.batches ? item.batches.map(b => `${b.id}(${b.quantity})`).join('; ') : '';
      return [
        escapeCSV(item.id),
        escapeCSV(item.name),
        escapeCSV(item.category),
        escapeCSV(item.quantity),
        escapeCSV(item.safetyStock),
        escapeCSV(item.location),
        escapeCSV(item.unit),
        escapeCSV(batchInfo)
      ];
    });
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    downloadCSV(csvContent, `庫存總表_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
  };

  const handleExportTransactions = () => {
    const headers = ['交易時間', '類型', '零件/產品編號', '數量', '經手人/單位', '單據號碼', '批號異動明細'];
    const rows = transactions.map(txn => {
      const batchInfo = txn.batchDetails ? txn.batchDetails.map(b => `${b.batchId}(${b.quantity})`).join('; ') : '';
      return [
        escapeCSV(format(new Date(txn.timestamp), 'yyyy/MM/dd HH:mm:ss')),
        escapeCSV(txn.type),
        escapeCSV(txn.itemId),
        escapeCSV(txn.quantityChange),
        escapeCSV(txn.handler),
        escapeCSV(txn.documentNumber),
        escapeCSV(batchInfo)
      ];
    });
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    downloadCSV(csvContent, `出入庫紀錄_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">系統設定</h2>
        <p className="text-slate-500 mt-2">管理系統資料匯出與其他進階設定。</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Database className="w-5 h-5 text-indigo-500" />
          <h3 className="text-lg font-semibold text-slate-900">資料匯出</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
            <div>
              <h4 className="font-medium text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                庫存總表資料
              </h4>
              <p className="text-sm text-slate-500 mt-1">匯出目前所有庫存品項的詳細資料，包含儲位與安全庫存設定。</p>
            </div>
            <button 
              onClick={handleExportInventory}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium shadow-sm whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              匯出 CSV
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
            <div>
              <h4 className="font-medium text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-orange-500" />
                出入庫紀錄資料
              </h4>
              <p className="text-sm text-slate-500 mt-1">匯出所有歷史出入庫、盤點、退貨與儲位移動的交易紀錄。</p>
            </div>
            <button 
              onClick={handleExportTransactions}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium shadow-sm whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              匯出 CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
