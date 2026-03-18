import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { MapPin, ScanBarcode, Box, ArrowRight, CheckCircle2, QrCode, Download, Settings, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { QRCodeCanvas } from 'qrcode.react';

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

interface ZoneTheme {
  primary: string;
  bg: string;
  text: string;
}

const DEFAULT_THEMES: Record<string, ZoneTheme> = {
  'A': { primary: '#4f46e5', bg: '#e0e7ff', text: '#312e81' },
  'B': { primary: '#059669', bg: '#d1fae5', text: '#064e3b' },
  'C': { primary: '#f59e0b', bg: '#fef3c7', text: '#78350f' },
};

export function LocationManagement({ inventory, onMoveItem }: LocationManagementProps) {
  const [selectedZone, setSelectedZone] = useState('A');
  const [selectedLoc, setSelectedLoc] = useState<string | null>(null);
  const [themes, setThemes] = useState<Record<string, ZoneTheme>>(DEFAULT_THEMES);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleThemeChange = (zoneId: string, key: keyof ZoneTheme, value: string) => {
    setThemes(prev => ({
      ...prev,
      [zoneId]: {
        ...prev[zoneId],
        [key]: value
      }
    }));
  };

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

  const handleDownloadQR = () => {
    if (!selectedLoc) return;
    const canvas = document.getElementById('qr-gen') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `location-${selectedLoc}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
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
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center overflow-x-auto">
            <div className="flex gap-2">
              {ZONES.map(zone => {
                const theme = themes[zone.id];
                return (
                  <button
                    key={zone.id}
                    onClick={() => { setSelectedZone(zone.id); setSelectedLoc(null); }}
                    style={selectedZone === zone.id ? { backgroundColor: theme.primary, color: 'white' } : {}}
                    className={cn(
                      "px-6 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors",
                      selectedZone === zone.id
                        ? "shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    )}
                  >
                    {zone.name}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <Settings className="w-4 h-4" />
              自訂顏色
            </button>
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
                      const theme = themes[selectedZone];

                      return (
                        <button
                          key={shelf}
                          onClick={() => setSelectedLoc(locId)}
                          style={{
                            backgroundColor: isOccupied ? theme.bg : undefined,
                            borderColor: isOccupied || isSelected ? theme.primary : undefined,
                            boxShadow: isSelected ? `0 0 0 2px ${theme.primary}40` : undefined,
                          }}
                          className={cn(
                            "p-3 rounded-xl border-2 text-left transition-all relative overflow-hidden",
                            !isOccupied && "bg-white border-slate-200 hover:border-slate-300"
                          )}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span
                              style={isOccupied ? { color: theme.primary } : {}}
                              className={cn(
                                "text-xs font-mono font-semibold",
                                !isOccupied && "text-slate-500"
                              )}
                            >
                              {locId}
                            </span>
                            {isOccupied && (
                              <span style={{ backgroundColor: theme.primary }} className="flex h-2 w-2 rounded-full"></span>
                            )}
                          </div>
                          <div
                            style={isOccupied ? { color: theme.text } : {}}
                            className={cn(
                              "text-sm font-medium",
                              !isOccupied && "text-slate-400"
                            )}
                          >
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
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <MapPin 
                  style={selectedLoc ? { color: themes[selectedLoc.split('-')[0]].primary } : {}} 
                  className={cn("w-5 h-5", !selectedLoc && "text-indigo-500")} 
                />
                儲位詳細資訊
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {selectedLoc ? `目前選擇: ${selectedLoc}` : '請點擊左側地圖選擇儲位'}
              </p>
            </div>
            
            {selectedLoc && (
              <div className="flex flex-col items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                <QRCodeCanvas
                  id="qr-gen"
                  value={selectedLoc}
                  size={80}
                  level={"H"}
                  includeMargin={true}
                  className="rounded-lg"
                />
                <button
                  onClick={handleDownloadQR}
                  className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium transition-colors px-2 py-1 rounded hover:bg-indigo-50"
                  title="下載 QR Code"
                >
                  <Download className="w-3 h-3" />
                  下載標籤
                </button>
              </div>
            )}
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

      {/* Theme Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-500" />
                自訂區域顏色主題
              </h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {ZONES.map(zone => (
                <div key={zone.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-32 font-medium text-slate-700">{zone.name}</div>
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">主色調 (Primary)</label>
                      <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
                        <input 
                          type="color" 
                          value={themes[zone.id].primary} 
                          onChange={e => handleThemeChange(zone.id, 'primary', e.target.value)} 
                          className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent" 
                        />
                        <span className="text-xs font-mono text-slate-500 uppercase">{themes[zone.id].primary}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">背景色 (Background)</label>
                      <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
                        <input 
                          type="color" 
                          value={themes[zone.id].bg} 
                          onChange={e => handleThemeChange(zone.id, 'bg', e.target.value)} 
                          className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent" 
                        />
                        <span className="text-xs font-mono text-slate-500 uppercase">{themes[zone.id].bg}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">文字色 (Text)</label>
                      <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
                        <input 
                          type="color" 
                          value={themes[zone.id].text} 
                          onChange={e => handleThemeChange(zone.id, 'text', e.target.value)} 
                          className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent" 
                        />
                        <span className="text-xs font-mono text-slate-500 uppercase">{themes[zone.id].text}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setIsSettingsOpen(false)} 
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                完成設定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
