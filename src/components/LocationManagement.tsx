import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { MapPin, ScanBarcode, Box, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface LocationManagementProps {
  inventory: InventoryItem[];
  onMoveItem: (itemId: string, newLocation: string) => void;
}

const ZONES = [
  { id: 'A', name: 'A區 (成品)' },
  { id: 'B', name: 'B區 (零件)' },
  { id: 'C', name: 'C區 (耗材)' },
];
const RACKS = ['01', '02', '03', '04', '05'];
const SHELVES = ['01', '02', '03', '04'];

export function LocationManagement({ inventory, onMoveItem }: LocationManagementProps) {
  const [selectedZone, setSelectedZone] = useState('A');
  const [selectedLoc, setSelectedLoc] = useState<string | null>(null);

  // Scanner State
  const [scanItemId, setScanItemId] = useState('');
  const [scanLocId, setScanLocId] = useState('');
  const [scanSuccess, setScanSuccess] = useState(false);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scanItemId && scanLocId) {
      onMoveItem(scanItemId, scanLocId);
      setScanSuccess(true);
      setTimeout(() => {
        setScanSuccess(false);
        setScanItemId('');
        setScanLocId('');
      }, 2000);
    }
  };

  const selectedLocItems = selectedLoc ? inventory.filter(i => i.location === selectedLoc) : [];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">儲位管理</h2>
        <p className="text-slate-500 mt-2">透過視覺化地圖管理倉庫儲位，並支援條碼/RFID掃描進行快速調撥。</p>
      </div>

      {/* Scanner Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <ScanBarcode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">條碼 / RFID 掃描作業</h3>
            <p className="text-sm text-slate-500">請依序掃描商品條碼與目標儲位條碼</p>
          </div>
        </div>

        <form onSubmit={handleScanSubmit} className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Box className="w-4 h-4 text-slate-400" />
              商品條碼 (Item ID)
            </label>
            <input
              required
              type="text"
              value={scanItemId}
              onChange={e => setScanItemId(e.target.value)}
              placeholder="例如: PX-100-2024"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
            />
          </div>
          <div className="hidden md:flex pb-3 text-slate-300">
            <ArrowRight className="w-6 h-6" />
          </div>
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              目標儲位條碼 (Location ID)
            </label>
            <input
              required
              type="text"
              value={scanLocId}
              onChange={e => setScanLocId(e.target.value)}
              placeholder="例如: A-01-01"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={!scanItemId || !scanLocId}
            className="w-full md:w-auto px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            {scanSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                調撥成功
              </>
            ) : (
              '確認調撥'
            )}
          </button>
        </form>
      </div>

      {/* Visual Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-2 overflow-x-auto">
            {ZONES.map(zone => (
              <button
                key={zone.id}
                onClick={() => { setSelectedZone(zone.id); setSelectedLoc(null); }}
                className={cn(
                  "px-6 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors",
                  selectedZone === zone.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                )}
              >
                {zone.name}
              </button>
            ))}
          </div>
          <div className="p-6 overflow-x-auto">
            <div className="min-w-[600px] grid grid-cols-5 gap-6">
              {RACKS.map(rack => (
                <div key={rack} className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-center">
                    <h4 className="font-bold text-slate-700">貨架 {rack}</h4>
                    <p className="text-xs text-slate-400">Rack {rack}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {SHELVES.map(shelf => {
                      const locId = `${selectedZone}-${rack}-${shelf}`;
                      const itemsHere = inventory.filter(i => i.location === locId);
                      const isOccupied = itemsHere.length > 0;
                      const isSelected = selectedLoc === locId;

                      return (
                        <button
                          key={shelf}
                          onClick={() => setSelectedLoc(locId)}
                          className={cn(
                            "p-3 rounded-xl border-2 text-left transition-all relative overflow-hidden",
                            isOccupied
                              ? "bg-indigo-50 border-indigo-200 hover:border-indigo-300"
                              : "bg-white border-slate-200 hover:border-slate-300",
                            isSelected && "ring-2 ring-indigo-500 border-indigo-500 shadow-md"
                          )}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={cn(
                              "text-xs font-mono font-semibold",
                              isOccupied ? "text-indigo-700" : "text-slate-500"
                            )}>
                              {locId}
                            </span>
                            {isOccupied && (
                              <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
                            )}
                          </div>
                          <div className={cn(
                            "text-sm font-medium",
                            isOccupied ? "text-indigo-900" : "text-slate-400"
                          )}>
                            {isOccupied ? `${itemsHere.length} 項商品` : '空儲位'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Location Details Sidebar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-500" />
              儲位詳細資訊
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {selectedLoc ? `目前選擇: ${selectedLoc}` : '請點擊左側地圖選擇儲位'}
            </p>
          </div>
          <div className="p-0 flex-1 overflow-y-auto">
            {!selectedLoc ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <MapPin className="w-12 h-12 mb-4 opacity-20" />
                <p>點擊地圖上的儲位<br/>以查看存放的商品</p>
              </div>
            ) : selectedLocItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <Box className="w-12 h-12 mb-4 opacity-20" />
                <p>此儲位目前為空</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {selectedLocItems.map(item => (
                  <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {item.id}
                      </span>
                      <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    </div>
                    <h4 className="font-medium text-slate-900 mt-2">{item.name}</h4>
                    <div className="flex justify-between items-end mt-3">
                      <span className="text-sm text-slate-500">數量</span>
                      <span className="font-bold text-lg text-slate-900">
                        {item.quantity} <span className="text-sm font-normal text-slate-500">{item.unit}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
