import React from 'react';
import { InventoryItem, Transaction } from '../types';
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { format } from 'date-fns';

interface DashboardProps {
  inventory: InventoryItem[];
  transactions: Transaction[];
}

export function Dashboard({ inventory, transactions }: DashboardProps) {
  const totalItems = inventory.reduce((acc, item) => acc + item.quantity, 0);
  const lowStockItems = inventory.filter(item => item.quantity <= item.safetyStock);
  
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const stats = [
    { label: '總庫存數量', value: totalItems, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: '低於安全庫存', value: lowStockItems.length, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: '本月入庫次數', value: transactions.filter(t => t.type === '入庫').length, icon: ArrowDownToLine, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: '本月出庫次數', value: transactions.filter(t => t.type === '出庫').length, icon: ArrowUpFromLine, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">儀表板</h2>
        <p className="text-slate-500 mt-2">歡迎使用久欣電機倉儲管理系統，以下是目前的庫存概況。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              庫存警示 (低於安全水位)
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {lowStockItems.length > 0 ? (
              lowStockItems.map(item => (
                <div key={item.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.id} | 儲位: {item.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-600 font-bold text-lg">{item.quantity} <span className="text-sm font-normal text-slate-500">{item.unit}</span></p>
                    <p className="text-xs text-slate-400">安全水位: {item.safetyStock}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                目前沒有低於安全水位的商品
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">最近異動紀錄</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {recentTransactions.length > 0 ? (
              recentTransactions.map(txn => {
                const item = inventory.find(i => i.id === txn.itemId);
                return (
                  <div key={txn.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        txn.type === '入庫' ? 'bg-emerald-100 text-emerald-700' :
                        txn.type === '出庫' ? 'bg-orange-100 text-orange-700' :
                        txn.type === '退貨' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {txn.type}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{item?.name || txn.itemId}</p>
                        <p className="text-sm text-slate-500">{format(new Date(txn.timestamp), 'yyyy/MM/dd HH:mm')} | {txn.handler}</p>
                      </div>
                    </div>
                    <div className="text-right font-medium">
                      <span className={txn.quantityChange > 0 ? 'text-emerald-600' : 'text-orange-600'}>
                        {txn.quantityChange > 0 ? '+' : ''}{txn.quantityChange}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500">
                尚無異動紀錄
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
