import React, { useState } from 'react';
import { InventoryItem, Transaction, TransactionType } from '../types';
import { Search, Plus, Edit2, Trash2, ArrowDownToLine, ArrowUpFromLine, ChevronDown, ChevronRight, Layers, AlertTriangle, ShieldAlert } from 'lucide-react';
import { format, isBefore } from 'date-fns';

interface InventoryProps {
  inventory: InventoryItem[];
  onAdd: (item: InventoryItem) => void;
  onUpdate: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
}

export function Inventory({ inventory, onAdd, onUpdate, onDelete, onTransaction }: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  // Transaction Modal State
  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);
  const [txnType, setTxnType] = useState<'入庫' | '出庫'>('入庫');
  const [txnItem, setTxnItem] = useState<InventoryItem | null>(null);

  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleRemoveExpired = () => {
    if (!window.confirm('確定要清除所有已過期的庫存批號嗎？這將會自動產生對應的出庫紀錄。')) return;

    inventory.forEach(item => {
      if (!item.batches) return;
      
      const expiredBatches = item.batches.filter(b => b.expirationDate && isBefore(new Date(b.expirationDate), new Date()));
      if (expiredBatches.length === 0) return;

      const totalExpiredQty = expiredBatches.reduce((sum, b) => sum + b.quantity, 0);
      if (totalExpiredQty === 0) return;

      // Create a transaction to remove expired stock
      // Note: In a real app, we might want a specific '報廢' (Scrap) transaction type, 
      // but we'll use '出庫' with a specific document number for now.
      onTransaction({
        type: '出庫',
        itemId: item.id,
        quantityChange: -totalExpiredQty,
        handler: '系統-自動清除',
        documentNumber: `EXP-${format(new Date(), 'yyyyMMddHHmm')}`
      } as any);
    });
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (item?: InventoryItem) => {
    setEditingItem(item || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem: InventoryItem = {
      id: formData.get('id') as string,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      quantity: Number(formData.get('quantity')),
      safetyStock: Number(formData.get('safetyStock')),
      location: formData.get('location') as string,
      unit: formData.get('unit') as string,
    };

    if (editingItem) {
      onUpdate(newItem);
    } else {
      onAdd(newItem);
    }
    handleCloseModal();
  };

  const handleOpenTxnModal = (item: InventoryItem, type: '入庫' | '出庫') => {
    setTxnItem(item);
    setTxnType(type);
    setIsTxnModalOpen(true);
  };

  const handleTxnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!txnItem) return;

    const formData = new FormData(e.currentTarget);
    const quantity = Number(formData.get('quantity'));
    const handler = formData.get('handler') as string;
    const documentNumber = formData.get('documentNumber') as string;

    let quantityChange = Math.abs(quantity);
    if (txnType === '出庫') {
      quantityChange = -quantityChange;
    }

    const newBatchId = formData.get('newBatchId') as string;
    const expirationDate = formData.get('expirationDate') as string;

    onTransaction({
      type: txnType,
      itemId: txnItem.id,
      quantityChange,
      handler,
      documentNumber,
      ...(txnType === '入庫' && newBatchId ? { newBatchId } : {}),
      ...(txnType === '入庫' && expirationDate ? { expirationDate } : {})
    } as any);

    setIsTxnModalOpen(false);
    setTxnItem(null);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">庫存總表</h2>
          <p className="text-slate-500 mt-2">管理所有零件、產品與耗材的庫存狀態與儲位。</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleRemoveExpired}
            className="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors border border-red-200 shadow-sm"
          >
            <ShieldAlert className="w-5 h-5" />
            清除過期庫存
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            新增品項
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="搜尋編號、品名或儲位..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm font-medium">
                <th className="p-4 w-10"></th>
                <th className="p-4">零件/產品編號</th>
                <th className="p-4">品名規格</th>
                <th className="p-4">類別</th>
                <th className="p-4 text-right">當前庫存量</th>
                <th className="p-4 text-right">安全庫存位</th>
                <th className="p-4">存放儲位</th>
                <th className="p-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => {
                const hasExpired = item.batches?.some(b => b.expirationDate && isBefore(new Date(b.expirationDate), new Date()) && b.quantity > 0);
                
                return (
                <React.Fragment key={item.id}>
                  <tr className={`hover:bg-slate-50/50 transition-colors ${expandedRow === item.id ? 'bg-slate-50/50' : ''}`}>
                    <td className="p-4">
                      <button 
                        onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors relative"
                      >
                        {expandedRow === item.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        {hasExpired && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                      </button>
                    </td>
                    <td className="p-4 font-mono text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        {item.id}
                        {hasExpired && <AlertTriangle className="w-4 h-4 text-red-500" title="包含過期批號" />}
                      </div>
                    </td>
                  <td className="p-4 font-medium text-slate-900">{item.name}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`font-bold text-lg ${item.quantity <= item.safetyStock ? 'text-red-600' : 'text-slate-900'}`}>
                      {item.quantity}
                    </span>
                    <span className="text-slate-500 text-sm ml-1">{item.unit}</span>
                  </td>
                  <td className="p-4 text-right text-slate-500">{item.safetyStock}</td>
                  <td className="p-4 text-slate-600 font-mono text-sm">{item.location}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => handleOpenTxnModal(item, '入庫')}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                        title="入庫"
                      >
                        <ArrowDownToLine className="w-4 h-4" />
                        入庫
                      </button>
                      <button 
                        onClick={() => handleOpenTxnModal(item, '出庫')}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                        title="出庫"
                      >
                        <ArrowUpFromLine className="w-4 h-4" />
                        出庫
                      </button>
                      <div className="w-px h-4 bg-slate-200 mx-1"></div>
                      <button 
                        onClick={() => handleOpenModal(item)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="編輯"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('確定要刪除此品項嗎？')) {
                            onDelete(item.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="刪除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  </tr>
                  {expandedRow === item.id && (
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <td colSpan={8} className="p-0">
                        <div className="px-14 py-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Layers className="w-4 h-4 text-slate-400" />
                            <h4 className="text-sm font-medium text-slate-700">批號庫存明細 (FIFO)</h4>
                          </div>
                          {item.batches && item.batches.length > 0 ? (
                            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                              <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                  <tr>
                                    <th className="px-4 py-2 font-medium">批號 (Batch ID)</th>
                                    <th className="px-4 py-2 font-medium">入庫時間</th>
                                    <th className="px-4 py-2 font-medium">有效期限</th>
                                    <th className="px-4 py-2 font-medium text-right">數量</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {[...item.batches]
                                    .sort((a, b) => {
                                      if (a.expirationDate && b.expirationDate) return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
                                      if (a.expirationDate) return -1;
                                      if (b.expirationDate) return 1;
                                      return new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime();
                                    })
                                    .map(batch => {
                                      const isExpired = batch.expirationDate && isBefore(new Date(batch.expirationDate), new Date()) && batch.quantity > 0;
                                      return (
                                      <tr key={batch.id} className={isExpired ? 'bg-red-50/50' : ''}>
                                        <td className="px-4 py-2 font-mono text-slate-700">
                                          <div className="flex items-center gap-2">
                                            {batch.id}
                                            {isExpired && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-600 border border-red-200">已過期</span>}
                                          </div>
                                        </td>
                                        <td className="px-4 py-2 text-slate-500">{format(new Date(batch.receivedDate), 'yyyy/MM/dd HH:mm')}</td>
                                        <td className={`px-4 py-2 ${isExpired ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                                          {batch.expirationDate ? format(new Date(batch.expirationDate), 'yyyy/MM/dd') : '-'}
                                        </td>
                                        <td className={`px-4 py-2 text-right font-medium ${isExpired ? 'text-red-700' : 'text-slate-900'}`}>{batch.quantity} {item.unit}</td>
                                      </tr>
                                    )})}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 italic">目前無批號資料</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
                );
              })}
              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    找不到符合條件的品項
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
              <h3 className="text-xl font-bold text-slate-900">
                {editingItem ? '編輯品項' : '新增品項'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">零件/產品編號</label>
                  <input required name="id" defaultValue={editingItem?.id} readOnly={!!editingItem} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent read-only:bg-slate-50 read-only:text-slate-500" placeholder="例如: PX-100" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">類別</label>
                  <select required name="category" defaultValue={editingItem?.category || '成品'} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="成品">成品</option>
                    <option value="半成品">半成品</option>
                    <option value="零件">零件</option>
                    <option value="耗材">耗材</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">品名規格</label>
                <input required name="name" defaultValue={editingItem?.name} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="例如: 沉水泵浦 1HP" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">當前庫存量</label>
                  <input required type="number" name="quantity" defaultValue={editingItem?.quantity || 0} min="0" className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">安全庫存位</label>
                  <input required type="number" name="safetyStock" defaultValue={editingItem?.safetyStock || 10} min="0" className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">單位</label>
                  <input required name="unit" defaultValue={editingItem?.unit || '個'} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">存放儲位</label>
                <input required name="location" defaultValue={editingItem?.location} className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="例如: A-05-02" />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                  取消
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm">
                  儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isTxnModalOpen && txnItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className={`p-6 border-b border-slate-100 ${txnType === '入庫' ? 'bg-emerald-50/50' : 'bg-orange-50/50'}`}>
              <h3 className={`text-xl font-bold flex items-center gap-2 ${txnType === '入庫' ? 'text-emerald-900' : 'text-orange-900'}`}>
                {txnType === '入庫' ? <ArrowDownToLine className="w-5 h-5" /> : <ArrowUpFromLine className="w-5 h-5" />}
                快速{txnType}作業
              </h3>
              <p className="text-sm mt-1 text-slate-600">
                品項：<span className="font-mono font-medium text-slate-900">{txnItem.id}</span> - {txnItem.name}
              </p>
              <p className="text-sm text-slate-600">
                目前庫存：<span className="font-bold text-slate-900">{txnItem.quantity}</span> {txnItem.unit}
              </p>
            </div>
            <form onSubmit={handleTxnSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">{txnType}數量</label>
                <div className="relative">
                  <input required type="number" name="quantity" min="1" max={txnType === '出庫' ? txnItem.quantity : undefined} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-bold" placeholder="例如: 10" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{txnItem.unit}</span>
                </div>
                {txnType === '出庫' && (
                  <p className="text-xs text-slate-500 mt-1">出庫數量不可超過目前庫存 ({txnItem.quantity})。系統將自動依 FIFO (先進先出) 扣除最舊批號。</p>
                )}
              </div>

              {txnType === '入庫' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">批號 (Batch ID) <span className="text-slate-400 font-normal text-xs ml-1">選填，留空將自動產生</span></label>
                    <input name="newBatchId" className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm" placeholder="例如: B-20240317-01" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">有效期限 <span className="text-slate-400 font-normal text-xs ml-1">選填</span></label>
                    <input type="date" name="expirationDate" className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">經手人/單位</label>
                  <input required name="handler" className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="例如: 王小明" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">單據號碼</label>
                  <input required name="documentNumber" className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="例如: PO-12345" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsTxnModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                  取消
                </button>
                <button type="submit" className={`px-5 py-2.5 rounded-xl font-medium text-white transition-colors shadow-sm ${txnType === '入庫' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
                  確認{txnType}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
