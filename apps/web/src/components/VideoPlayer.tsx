'use client';

import React, { useRef, useEffect } from 'react';
import { CameraStatus, BoundingBox } from '@drishyam/shared';
import { Camera, AlertTriangle } from 'lucide-react';

interface VideoPlayerProps {
  src?: string;
  poster?: string;
  cameraName?: string;
  status?: CameraStatus;
  bboxes?: BoundingBox[];
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  showOverlay?: boolean;
}

export function VideoPlayer({
  src,
  poster,
  cameraName = 'Live Camera Feed',
  status = CameraStatus.ONLINE,
  bboxes = [],
  autoPlay = true,
  loop = true,
  muted = true,
  showOverlay = true,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || !bboxes || bboxes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bboxes.forEach((box) => {
      ctx.strokeStyle = '#EF4444'; // Red bounding box for threat
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.w, box.h);

      // Label Box
      ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.fillRect(box.x, Math.max(0, box.y - 24), box.w, 24);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(
        `${box.label} (${Math.round(box.confidence * 100)}%)`,
        box.x + 6,
        Math.max(16, box.y - 7)
      );
    });
  }, [bboxes]);

  return (
    <div className="relative w-full h-full min-h-[220px] bg-dark-950 rounded-2xl overflow-hidden border border-slate-800/80 group flex items-center justify-center">
      {/* Video Content */}
      {src ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 p-6 text-center text-slate-500">
          <Camera className="w-10 h-10 stroke-[1.5]" />
          <p className="text-xs font-medium">RTSP Feed Standby: {cameraName}</p>
        </div>
      )}

      {/* Bounding Box Canvas Overlay */}
      {showOverlay && bboxes.length > 0 && (
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      )}

      {/* Camera Top Status Header */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-dark-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/60 text-xs font-medium text-slate-200">
          <span
            className={`w-2 h-2 rounded-full ${
              status === CameraStatus.ONLINE
                ? 'bg-emerald-400 animate-pulse'
                : status === CameraStatus.DEGRADED
                ? 'bg-amber-400'
                : 'bg-red-500'
            }`}
          />
          <span>{cameraName}</span>
        </div>

        {bboxes.length > 0 && (
          <div className="flex items-center gap-1.5 bg-red-500/90 text-white px-2.5 py-1 rounded-full text-[11px] font-bold shadow-alert">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>THREAT DETECTED</span>
          </div>
        )}
      </div>
    </div>
  );
}
