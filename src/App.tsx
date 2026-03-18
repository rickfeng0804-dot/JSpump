/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Transactions } from './components/Transactions';
import { LocationManagement } from './components/LocationManagement';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { initialInventory, initialTransactions } from './data/mockData';
import { InventoryItem, Transaction, TransactionBatchDetail } from './types';
import { format } from 'date-fns';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const handleAddInventoryItem = (item: InventoryItem) => {
    setInventory(prev => [...prev, item]);
  };

  const handleUpdateInventoryItem = (updatedItem: InventoryItem) => {
    setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleDeleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const handleMoveItem = (itemId: string, newLocation: string) => {
    setInventory(prev => prev.map(item =>
      item.id === itemId ? { ...item, location: newLocation } : item
    ));

    const newTransaction: Transaction = {
      id: `TXN-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: '儲位移動',
      itemId: itemId,
      quantityChange: 0,
      handler: '系統-條碼掃描',
      documentNumber: `MOVE-${newLocation}`,
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleAddTransaction = (txnData: Omit<Transaction, 'id' | 'timestamp'> & { newBatchId?: string, expirationDate?: string }) => {
    let batchDetails: TransactionBatchDetail[] = [];
    const timestamp = new Date().toISOString();

    setInventory(prev => prev.map(item => {
      if (item.id === txnData.itemId) {
        let updatedBatches = [...(item.batches || [])];
        let remainingQty = Math.abs(txnData.quantityChange);
        const isOutbound = txnData.quantityChange < 0;

        if (isOutbound) {
          // FEFO / FIFO: Sort by expirationDate asc, then receivedDate asc
          updatedBatches.sort((a, b) => {
            if (a.expirationDate && b.expirationDate) {
              return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
            }
            if (a.expirationDate) return -1;
            if (b.expirationDate) return 1;
            return new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime();
          });
          
          for (let i = 0; i < updatedBatches.length && remainingQty > 0; i++) {
            const batch = updatedBatches[i];
            if (batch.quantity > 0) {
              const deduct = Math.min(batch.quantity, remainingQty);
              batch.quantity -= deduct;
              remainingQty -= deduct;
              batchDetails.push({ batchId: batch.id, quantity: deduct });
            }
          }
          // Filter out empty batches
          updatedBatches = updatedBatches.filter(b => b.quantity > 0);
        } else if (txnData.quantityChange > 0) {
          // Inbound
          const newBatchId = txnData.newBatchId || `B-${format(new Date(), 'yyyyMMddHHmm')}`;
          updatedBatches.push({
            id: newBatchId,
            itemId: item.id,
            quantity: remainingQty,
            receivedDate: timestamp,
            expirationDate: txnData.expirationDate ? new Date(txnData.expirationDate).toISOString() : undefined
          });
          batchDetails.push({ batchId: newBatchId, quantity: remainingQty });
        }

        return {
          ...item,
          quantity: item.quantity + txnData.quantityChange,
          batches: updatedBatches
        };
      }
      return item;
    }));

    const newTransaction: Transaction = {
      ...txnData,
      id: `TXN-${Date.now()}`,
      timestamp,
      batchDetails: batchDetails.length > 0 ? batchDetails : undefined
    };

    setTransactions(prev => [newTransaction, ...prev]);
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => setIsAuthenticated(false)}
      />
      
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <Dashboard inventory={inventory} transactions={transactions} />
        )}
        {activeTab === 'inventory' && (
          <Inventory 
            inventory={inventory} 
            onAdd={handleAddInventoryItem}
            onUpdate={handleUpdateInventoryItem}
            onDelete={handleDeleteInventoryItem}
            onTransaction={handleAddTransaction}
          />
        )}
        {activeTab === 'transactions' && (
          <Transactions 
            transactions={transactions} 
            inventory={inventory}
            onAddTransaction={handleAddTransaction}
          />
        )}
        {activeTab === 'locations' && (
          <LocationManagement
            inventory={inventory}
            onMoveItem={handleMoveItem}
          />
        )}
        {activeTab === 'settings' && (
          <Settings 
            inventory={inventory}
            transactions={transactions}
          />
        )}
      </main>
    </div>
  );
}
