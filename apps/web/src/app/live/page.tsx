'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '../../components/Navigation';
import { Header } from '../../components/Header';
import { VideoPlayer } from '../../components/VideoPlayer';
import { fetchApi } from '../../lib/api';
import { CameraDTO } from '@drishyam/shared';
import { Grid2X2, Grid3X3, Square, RefreshCw } from 'lucide-react';

export default function LivePage() {
  const [cameras, setCameras] = useState<CameraDTO[]>([]);
  const [gridMode, setGridMode] = useState<'1x1' | '2x2' | '3x3'>('2x2');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/cameras');
      setCameras(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const gridClass =
    gridMode === '1x1'
      ? 'grid-cols-1'
      : gridMode === '2x2'
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-3';

  return (
    <div className="flex min-h-screen bg-dark-950">
      <Navigation />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-6 space-y-6 flex-1">
          {/* Header & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">Live Camera Grid</h1>
              <p className="text-xs text-slate-400">Multi-stream RTSP CCTV Video Wall</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-dark-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
                <button
                  onClick={() => setGridMode('1x1')}
                  className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                    gridMode === '1x1' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Single Focus View"
                >
                  <Square className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridMode('2x2')}
                  className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                    gridMode === '2x2' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="2x2 Quad Grid"
                >
                  <Grid2X2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridMode('3x3')}
                  className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                    gridMode === '3x3' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="3x3 Multi Grid"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={loadCameras}
                className="p-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700 text-slate-300"
                title="Refresh Streams"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className={`grid ${gridClass} gap-4`}>
            {cameras.map((cam) => (
              <div key={cam.id} className="h-72">
                <VideoPlayer cameraName={cam.name} status={cam.status} />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
