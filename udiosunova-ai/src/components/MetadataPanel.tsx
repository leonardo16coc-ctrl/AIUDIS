/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Sparkles, 
  Scissors, 
  CheckCircle, 
  Info, 
  Lock, 
  HelpCircle,
  FileCode,
  Music,
  Activity
} from 'lucide-react';
import { AudioAsset } from '../types';

interface MetadataPanelProps {
  track: AudioAsset;
}

export default function MetadataPanel({ track }: MetadataPanelProps) {
  // Format Duration helper
  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  // Simulate file sizes
  const getFileSize = (duration: number, format: string) => {
    if (format === 'mp3') {
      return `${((duration * 320) / (8 * 1024)).toFixed(1)} MB`; // 320kbps
    } else if (format === 'wav') {
      return `${((duration * 1411.2) / (8 * 1024)).toFixed(1)} MB`; // 1411kbps
    } else {
      return `${((duration * 850) / (8 * 1024)).toFixed(1)} MB`; // FLAC compressed
    }
  };

  // Simulated system/job progression logs
  const getStatusLogs = () => {
    const logs = [
      { time: '0.0s', msg: 'Job received in SoundNova BullMQ queue cluster.', status: 'success' },
      { time: '1.2s', msg: 'Performing SSRF threat modeling and URL validation... Safe.', status: 'success' }
    ];

    if (track.sourcePlatform === 'Manual Upload') {
      logs.push({ time: '2.1s', msg: 'Inspecting raw file metadata and container headers.', status: 'success' });
      logs.push({ time: '3.5s', msg: 'Normalizing loudness levels and transcoding preview stems.', status: 'success' });
      logs.push({ time: '4.8s', msg: 'Successfully registered manual asset to cloud repository.', status: 'success' });
    } else {
      logs.push({ time: '2.5s', msg: `Querying public HTML headers for ${track.sourcePlatform} meta tags.`, status: 'success' });
      
      if (track.status === 'FAILED') {
        logs.push({ time: '3.8s', msg: 'Resolving download payload... Connection refused.', status: 'failed' });
        logs.push({ time: '4.0s', msg: 'ERROR: No public downloadable streams detected. Track bypassed or private.', status: 'failed' });
      } else {
        logs.push({ time: '3.8s', msg: 'Extracting public audio streams and downloading stream buffer.', status: 'success' });
        logs.push({ time: '5.5s', msg: 'Encoding audio into high-fidelity 320kbps MP3 structures.', status: 'success' });
        logs.push({ time: '7.2s', msg: 'Waveform peaks processed via FFmpeg filter complexes.', status: 'success' });
        logs.push({ time: '8.5s', msg: 'Appended ID3v2 metadata frames (Cover, Title, Artist). Pipeline completed.', status: 'success' });
      }
    }

    return logs;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. File Metadata details card */}
      <div id="metadata-details-card" className="lg:col-span-1 bg-[#071426]/75 border border-sky-500/15 rounded-2xl p-6 backdrop-blur-xl shadow-xl flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-sky-400" />
          Technical Metadata
        </h3>

        <div className="space-y-4 text-sm flex-1">
          <div className="flex justify-between pb-3 border-b border-slate-800">
            <span className="text-slate-400">Platform</span>
            <span className="text-sky-300 font-medium">{track.sourcePlatform}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-slate-800">
            <span className="text-slate-400">Duration</span>
            <span className="text-white font-mono">{formatDuration(track.duration)}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-slate-800">
            <span className="text-slate-400">Created Date</span>
            <span className="text-slate-300 text-right">{formatDate(track.createdAt)}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-slate-800">
            <span className="text-slate-400">Format Previews</span>
            <span className="text-cyan-400 uppercase text-xs font-mono">mp3, wav, flac</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-slate-800">
            <span className="text-slate-400">Simulated Size (MP3)</span>
            <span className="text-white font-mono">{getFileSize(track.duration, 'mp3')}</span>
          </div>
          <div className="flex justify-between pb-3">
            <span className="text-slate-400">Simulated Size (WAV)</span>
            <span className="text-white font-mono">{getFileSize(track.duration, 'wav')}</span>
          </div>

          {track.sourceUrl && track.sourceUrl !== 'Manual Upload' && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <span className="text-slate-400 block mb-1">Source URL</span>
              <a 
                href={track.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-sky-400 hover:underline break-all block"
              >
                {track.sourceUrl}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 2. Future AI Studio Tools card */}
      <div id="future-ai-tools-card" className="lg:col-span-1 bg-[#071426]/75 border border-sky-500/15 rounded-2xl p-6 backdrop-blur-xl shadow-xl flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-400" />
          AI Studio Tools (Next Gen)
        </h3>

        <div className="space-y-3 flex-1">
          {/* AI Restore */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between relative overflow-hidden group">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-slate-200">AI Audio Restore</h4>
                <p className="text-xs text-slate-500">De-noise, artifact reduction, compression healing</p>
              </div>
            </div>
            <span className="bg-slate-800 text-[10px] font-semibold text-purple-400 px-2 py-0.5 rounded flex items-center gap-1 shrink-0 uppercase">
              <Lock className="w-2.5 h-2.5" /> PRO
            </span>
          </div>

          {/* AI Master */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between relative overflow-hidden group">
            <div className="flex items-center gap-3">
              <Music className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-slate-200">AI Smart Mastering</h4>
                <p className="text-xs text-slate-500">Loudness correction (-14 LUFS), Streaming & Club optimization</p>
              </div>
            </div>
            <span className="bg-slate-800 text-[10px] font-semibold text-indigo-400 px-2 py-0.5 rounded flex items-center gap-1 shrink-0 uppercase">
              <Lock className="w-2.5 h-2.5" /> PRO
            </span>
          </div>

          {/* Stem Splitter */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between relative overflow-hidden group">
            <div className="flex items-center gap-3">
              <Scissors className="w-5 h-5 text-pink-400 shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-slate-200">AI Stem Splitter</h4>
                <p className="text-xs text-slate-500">Separate Vocals, Drums, Bass and Instruments (Demucs)</p>
              </div>
            </div>
            <span className="bg-slate-800 text-[10px] font-semibold text-pink-400 px-2 py-0.5 rounded flex items-center gap-1 shrink-0 uppercase">
              <Lock className="w-2.5 h-2.5" /> PRO
            </span>
          </div>

          {/* BPM/Key Analyzer */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between relative overflow-hidden group">
            <div className="flex items-center gap-3">
              <FileCode className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-slate-200">BPM & Key Detector</h4>
                <p className="text-xs text-slate-500">Track musical key, chord progression and energy levels</p>
              </div>
            </div>
            <span className="bg-slate-800 text-[10px] font-semibold text-cyan-400 px-2 py-0.5 rounded flex items-center gap-1 shrink-0 uppercase">
              <Lock className="w-2.5 h-2.5" /> PLUS
            </span>
          </div>
        </div>
      </div>

      {/* 3. Status Logs card */}
      <div id="status-logs-card" className="lg:col-span-1 bg-[#071426]/75 border border-sky-500/15 rounded-2xl p-6 backdrop-blur-xl shadow-xl flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-sky-400" />
          Job Pipeline Logs
        </h3>

        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex-1 font-mono text-xs text-slate-300 space-y-3 overflow-y-auto max-h-[220px]">
          {getStatusLogs().map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-cyan-500 shrink-0 select-none">[{log.time}]</span>
              <span className={log.status === 'failed' ? 'text-rose-400' : 'text-slate-300'}>
                {log.msg}
              </span>
            </div>
          ))}
          <div className="flex gap-2 animate-pulse">
            <span className="text-slate-600 shrink-0 select-none">[*]</span>
            <span className="text-slate-500">Listening to incoming socket events... Ready.</span>
          </div>
        </div>
      </div>

    </div>
  );
}
