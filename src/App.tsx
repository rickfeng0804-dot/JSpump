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
import { Login } from './components/Login';
import { initialInventory, initialTransactions } from './data/mockData';
import { InventoryItem, Transaction } from './types';

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

  const handleAddTransaction = (txnData: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...txnData,
      id: `TXN-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    setTransactions(prev => [newTransaction, ...prev]);

    // Update inventory quantity
    setInventory(prev => prev.map(item => {
      if (item.id === txnData.itemId) {
        return {
          ...item,
          quantity: item.quantity + txnData.quantityChange
        };
      }
      return item;
    }));
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
      </main>
    </div>
  );
}
