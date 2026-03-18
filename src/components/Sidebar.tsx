import React from 'react';
import { LayoutDashboard, Package, ArrowLeftRight, Settings, LogOut, Map } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: '儀表板', icon: LayoutDashboard },
    { id: 'inventory', label: '庫存總表', icon: Package },
    { id: 'transactions', label: '出入庫紀錄', icon: ArrowLeftRight },
    { id: 'locations', label: '儲位管理', icon: Map },
    { id: 'settings', label: '系統設定', icon: Settings },
  ];

  return (
    <div className="flex flex-col w-64 bg-slate-900 text-slate-300 h-screen border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Package className="w-6 h-6 text-indigo-500" />
          久欣電機倉儲
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium",
                isActive 
                  ? "bg-indigo-600/10 text-indigo-400" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-indigo-400" : "text-slate-400")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="w-5 h-5 text-slate-400" />
          登出系統
        </button>
      </div>
    </div>
  );
}
