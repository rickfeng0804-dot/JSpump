import React, { useState } from 'react';
import { Transaction, InventoryItem, TransactionType } from '../types';
import { Search, Plus, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionsProps {
  transactions: Transaction[];
  inventory: InventoryItem[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
}

export function Transactions({ transactions, inventory, onAddTransaction }: TransactionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | '全部'>('全部');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = 
      txn.itemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.handler.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.documentNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === '全部' || txn.type === filterType;
    
    return matchesSearch && matchesType;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as TransactionType;
    const quantity = Number(formData.get('quantity'));
    
    // Ensure quantity sign matches type
    let quantityChange = Math.abs(quantity);
    if (type === '出庫' || type === '退貨') {
      quantityChange = -quantityChange;
    }

    onAddTransaction({
      type,
      itemId: formData.get('itemId') as string,
      quantityChange,
      handler: formData.get('handler') as string,
      documentNumber: formData.get('documentNumber') as string,
    });
    
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">出入庫紀錄</h2>
          <p className="text-slate-500 mt-2">追蹤所有庫存變動，包含入庫、出庫、盤點與退貨。</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          新增紀錄
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="搜尋編號、經手人或單據號碼..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-5 h-5 text-slate-400" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white w-full sm:w-auto"
            >
              <option value="全部">全部類型</option>
              <option value="入庫">入庫</option>
              <option value="出庫">出庫</option>
              <option value="盤點">盤點</option>
              <option value="退貨">退貨</option>
              <option value="儲位移動">儲位移動</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm font-medium">
                <th className="p-4">交易時間</th>
                <th className="p-4">類型</th>
                <th className="p-4">零件/產品編號</th>
                <th className="p-4 text-right">數量</th>
                <th className="p-4">經手人/單位</th>
                <th className="p-4">單據號碼 / 批號明細</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((txn) => {
                const item = inventory.find(i => i.id === txn.itemId);
                return (
                  <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm text-slate-600">
                      {format(new Date(txn.timestamp), 'yyyy/MM/dd HH:mm')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        txn.type === '入庫' ? 'bg-emerald-100 text-emerald-700' :
                        txn.type === '出庫' ? 'bg-orange-100 text-orange-700' :
                        txn.type === '退貨' ? 'bg-red-100 text-red-700' :
                        txn.type === '儲位移動' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-sm text-slate-700">{txn.itemId}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item?.name || '未知品項'}</div>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`font-bold text-lg ${txn.quantityChange > 0 ? 'text-emerald-600' : txn.quantityChange < 0 ? 'text-orange-600' : 'text-slate-600'}`}>
                        {txn.quantityChange > 0 ? '+' : ''}{txn.quantityChange}
                      </span>
                      <span className="text-slate-500 text-sm ml-1">{item?.unit || ''}</span>
                    </td>
                    <td className="p-4 text-slate-700">{txn.handler}</td>
                    <td className="p-4">
                      <div className="font-mono text-sm text-slate-500">{txn.documentNumber}</div>
                      {txn.batchDetails && txn.batchDetails.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {txn.batchDetails.map((b, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              {b.batchId} ({b.quantity})
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    找不到符合條件的紀錄
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">新增出入庫紀錄</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">類型</label>
                  <select required name="type" className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="入庫">入庫</option>
                    <option value="出庫">出庫</option>
                    <option value="盤點">盤點</option>
                    <option value="退貨">退貨</option>
                    <option value="儲位移動">儲位移動</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">數量 (絕對值)</label>
                  <input required type="number" name="quantity" min="1" className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="例如: 5" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">零件/產品</label>
                <select required name="itemId" className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="">請選擇品項...</option>
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.id} - {item.name} (庫存: {item.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">經手人/單位</label>
                  <input required name="handler" className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="例如: 生產部-王小明" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">單據號碼</label>
                  <input required name="documentNumber" className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="例如: PO-88992" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                  取消
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm">
                  儲存紀錄
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
