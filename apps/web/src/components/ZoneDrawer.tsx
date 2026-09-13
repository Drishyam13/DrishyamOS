'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Point, PolygonZone, AlertType } from '@drishyam/shared';
import { Pentagon, Save, Trash2, Check, AlertCircle } from 'lucide-react';

interface ZoneDrawerProps {
  existingZones?: PolygonZone[];
  onSaveZones?: (zones: PolygonZone[]) => void;
}

export function ZoneDrawer({ existingZones = [], onSaveZones }: ZoneDrawerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zones, setZones] = useState<PolygonZone[]>(existingZones);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [zoneName, setZoneName] = useState('Restricted Zone');
  const [zoneType, setZoneType] = useState<AlertType.INTRUSION | AlertType.LOITERING>(AlertType.INTRUSION);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    drawCanvas();
  }, [zones, currentPoints]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing saved zones
    zones.forEach((z) => {
      if (!z.points || z.points.length < 3) return;

      ctx.beginPath();
      ctx.moveTo(z.points[0].x * canvas.width, z.points[0].y * canvas.height);
      for (let i = 1; i < z.points.length; i++) {
        ctx.lineTo(z.points[i].x * canvas.width, z.points[i].y * canvas.height);
      }
      ctx.closePath();

      ctx.fillStyle = z.type === AlertType.INTRUSION ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)';
      ctx.fill();
      ctx.strokeStyle = z.type === AlertType.INTRUSION ? '#EF4444' : '#F59E0B';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Zone Label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(z.name, z.points[0].x * canvas.width + 5, z.points[0].y * canvas.height + 15);
    });

    // Draw currently drawing points
    if (currentPoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x * canvas.width, currentPoints[0].y * canvas.height);
      for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i].x * canvas.width, currentPoints[i].y * canvas.height);
      }
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw point dots
      currentPoints.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x * canvas.width, p.y * canvas.height, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#60A5FA';
        ctx.fill();
      });
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setCurrentPoints([...currentPoints, { x, y }]);
  };

  const handleCompletePolygon = () => {
    if (currentPoints.length < 3) return;

    const newZone: PolygonZone = {
      id: `zone-${Date.now()}`,
      name: zoneName,
      type: zoneType,
      points: currentPoints,
      enabled: true,
      minDurationSeconds: zoneType === AlertType.LOITERING ? 60 : undefined,
    };

    setZones([...zones, newZone]);
    setCurrentPoints([]);
    setZoneName('Restricted Zone ' + (zones.length + 2));
  };

  const handleClearCurrent = () => {
    setCurrentPoints([]);
  };

  const handleDeleteZone = (id: string) => {
    setZones(zones.filter((z) => z.id !== id));
  };

  const handleSaveAll = () => {
    onSaveZones?.(zones);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Canvas Interactive Area */}
      <div className="relative w-full aspect-video bg-dark-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          onClick={handleCanvasClick}
          className="w-full h-full object-cover"
        />

        <div className="absolute top-3 left-3 bg-dark-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs font-medium text-slate-200">
          Click canvas to place polygon points ({currentPoints.length} points)
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              placeholder="Zone Name"
              className="bg-dark-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium text-white focus:outline-none focus:border-brand-500"
            />
            <select
              value={zoneType}
              onChange={(e) => setZoneType(e.target.value as any)}
              className="bg-dark-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium text-white focus:outline-none focus:border-brand-500"
            >
              <option value={AlertType.INTRUSION}>Intrusion Zone (Restricted)</option>
              <option value={AlertType.LOITERING}>Loitering Zone (Timer)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCompletePolygon}
              disabled={currentPoints.length < 3}
              className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            >
              <Pentagon className="w-3.5 h-3.5" />
              Complete Polygon
            </button>
            <button
              onClick={handleClearCurrent}
              disabled={currentPoints.length === 0}
              className="flex items-center gap-1.5 bg-dark-800 hover:bg-dark-700 disabled:opacity-40 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border border-slate-700"
            >
              Clear Current
            </button>
          </div>
        </div>

        {/* Existing Zones List */}
        {zones.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-400">Configured Detection Zones:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {zones.map((z) => (
                <div
                  key={z.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-dark-850 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        z.type === AlertType.INTRUSION ? 'bg-red-500' : 'bg-amber-500'
                      }`}
                    />
                    <span className="font-semibold text-slate-200">{z.name}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-dark-800 px-2 py-0.5 rounded">
                      {z.type}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteZone(z.id)}
                    className="text-slate-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleSaveAll}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-glow"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Zone Configuration Saved!' : 'Save Detection Zones to Camera'}</span>
        </button>
      </div>
    </div>
  );
}
