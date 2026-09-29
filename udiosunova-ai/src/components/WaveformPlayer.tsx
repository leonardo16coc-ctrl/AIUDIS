/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react';

interface WaveformPlayerProps {
  audioUrl: string;
  waveformPeaks?: number[];
  duration: number; // in seconds
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export default function WaveformPlayer({
  audioUrl,
  waveformPeaks,
  duration,
  onPlayStateChange,
}: WaveformPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [peaks, setPeaks] = useState<number[]>([]);

  // Generate or load peaks
  useEffect(() => {
    if (waveformPeaks && waveformPeaks.length > 0) {
      setPeaks(waveformPeaks);
    } else {
      // Fallback synthetic peaks
      const fallbackPeaks: number[] = [];
      for (let i = 0; i < 120; i++) {
        fallbackPeaks.push(0.15 + 0.65 * Math.sin((i / 120) * Math.PI) * (0.6 + 0.4 * Math.random()));
      }
      setPeaks(fallbackPeaks);
    }
  }, [waveformPeaks]);

  // Sync audio play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Audio playback failed", e));
    }
  };

  // Reset audio
  const handleReset = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      drawWaveform();
    }
  };

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsPlaying(true);
      onPlayStateChange?.(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
      setCurrentTime(0);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, onPlayStateChange]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Draw Waveform on Canvas
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas || peaks.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const barWidth = width / peaks.length;
    const gap = 1.5; // pixel gap between bars
    const progressPercent = currentTime / (duration || 1);

    peaks.forEach((peak, i) => {
      const x = i * barWidth;
      const barHeight = peak * height * 0.85;
      const y = (height - barHeight) / 2;

      const isPlayed = (i / peaks.length) <= progressPercent;

      // Color selection (Futuristic Neon Blue Gradient)
      if (isPlayed) {
        // Active played color (neon turquoise)
        ctx.fillStyle = '#06b6d4'; // Cyan
        // Add subtle shadow for active peaks
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(6, 182, 212, 0.6)';
      } else {
        // Unplayed background color (mute slate blue)
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.shadowBlur = 0;
      }

      // Draw rounded bar
      ctx.beginPath();
      ctx.roundRect(x + gap, y, Math.max(1, barWidth - gap * 2), barHeight, 2);
      ctx.fill();
    });
  };

  // Redraw when playhead/peaks change
  useEffect(() => {
    drawWaveform();
  }, [peaks, currentTime, duration]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      drawWaveform();
    };

    window.addEventListener('resize', handleResize);
    // Initial size trigger
    setTimeout(handleResize, 100);

    return () => window.removeEventListener('resize', handleResize);
  }, [peaks]);

  // Click Waveform to Seek
  const handleWaveformClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !audioRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    const targetTime = percent * duration;

    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  // Time Formatter (mm:ss)
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div id="waveform-container" className="bg-[#0f172a]/80 border border-sky-500/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background neon ambient lights */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Embedded Audio Element */}
      <audio ref={audioRef} src={audioUrl} preload="auto" />

      {/* Waveform Canvas */}
      <div className="relative w-full h-24 cursor-pointer select-none mb-6">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          onClick={handleWaveformClick}
          style={{ contentVisibility: 'auto' }}
        />
        
        {/* Neon vertical playhead indicator */}
        <div 
          className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 shadow-[0_0_10px_#06b6d4] pointer-events-none transition-all duration-75"
          style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
        />
      </div>

      {/* Player controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Playback Buttons */}
        <div className="flex items-center gap-3">
          <button
            id="play-pause-btn"
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white flex items-center justify-center shadow-lg hover:shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white text-white" />
            ) : (
              <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
            )}
          </button>

          <button
            id="reset-audio-btn"
            onClick={handleReset}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center border border-slate-700/50 hover:text-white transition-all duration-150 cursor-pointer"
            title="Reset to beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Time indicator */}
          <div className="text-sm font-mono text-slate-400">
            <span className="text-cyan-400">{formatTime(currentTime)}</span>
            <span className="mx-1 text-slate-600">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto min-w-[150px]">
          <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none"
            title="Adjust volume"
          />
          <span className="text-xs font-mono text-slate-400 w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>

      </div>
    </div>
  );
}
