/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Download, 
  Sparkles, 
  Check, 
  ExternalLink, 
  Music, 
  ArrowRight, 
  Clock, 
  Sliders, 
  Disc, 
  Cpu, 
  Waves, 
  ChevronDown, 
  Loader2, 
  HelpCircle, 
  Info, 
  ShieldAlert,
  Play,
  Pause,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Plan, AudioStatus, AudioAsset, User } from '../types';

interface UdioDownloaderViewProps {
  user: User | null;
  library: AudioAsset[];
  isImporting: boolean;
  importError: string | null;
  importJobStatus: {
    audio_id?: string;
    progress: number;
    message: string;
    status: AudioStatus;
  } | null;
  onImportLink: (url: string) => void;
  onSelectTrack: (trackId: string) => void;
  onDeleteTrack: (trackId: string) => void;
  onDownloadTrack?: (trackId: string, format: 'mp3' | 'wav' | 'flac') => void;
  setShowPricingModal: (show: boolean) => void;
  onBack: () => void;
}

export default function UdioDownloaderView({
  user,
  library,
  isImporting,
  importError,
  importJobStatus,
  onImportLink,
  onSelectTrack,
  onDeleteTrack,
  onDownloadTrack,
  setShowPricingModal,
  onBack
}: UdioDownloaderViewProps) {
  const [localUrl, setLocalUrl] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter Udio tracks from the library
  const udioTracks = library.filter(t => t.sourcePlatform === 'Udio AI' || t.title.toLowerCase().includes('udio') || t.sourceUrl?.includes('udio.com'));

  // Some high-quality mockup tracks to show under "More than 20,000+ users rescued..."
  const rescuedMockups = [
    { id: 'm1', title: 'Ethereal Dreams remix', artist: 'Hyperion', coverUrl: 'https://imagedelivery.net/C9yUr1FL21Q6JwfYYh2ozQ/dcafef67-7056-4572-a97d-cc7c6228e400/public', downloads: '2,945', duration: '2:45' },
    { id: 'm2', title: 'Happy Birthday to You', artist: 'Acoustic_Gen', coverUrl: 'https://imagedelivery.net/C9yUr1FL21Q6JwfYYh2ozQ/b527940a-f5b7-43bb-1385-f2062fa6d000/public', downloads: '1,891', duration: '1:50' },
    { id: 'm3', title: 'Jesus Reigns ext v2', artist: 'Hymn_Maker', coverUrl: 'https://imagedelivery.net/C9yUr1FL21Q6JwfYYh2ozQ/c1e6e05b-7318-47b6-b90c-bf6842900100/public', downloads: '4,102', duration: '4:15' },
    { id: 'm4', title: 'Cyberpunk Skyline', artist: 'NeoSynth', coverUrl: 'https://imagedelivery.net/C9yUr1FL21Q6JwfYYh2ozQ/67d77e7f-b50f-421a-5215-d365fbdb2a00/public', downloads: '3,320', duration: '3:12' }
  ];

  // Submit link
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localUrl || !localUrl.trim()) return;
    onImportLink(localUrl.trim());
    setLocalUrl('');
  };

  const handleFocusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // FAQ Data matching Images 5 & 6
  const faqs = [
    {
      q: "How to download Udio music? How to download from Udio?",
      a: "Paste your Udio song URL into the Udio Downloader input field above. UDIOSUNOVA AI imports the public Udio track into Studio, extracts available metadata such as title and high-resolution cover art, and lets you download the audio directly or process it further."
    },
    {
      q: "How to download a Udio playlist?",
      a: "Paste a public Udio playlist link in our downloader. UDIOSUNOVA AI will parse the playlist and import the tracks. You can download playlist songs one by one, or use a Pro account to batch-export them all in a single click."
    },
    {
      q: "How to download a Udio creator page or Udio library?",
      a: "Paste a public Udio creator profile link into the downloader box. Our system will scan and import visible public tracks from that page (up to 100 tracks at a time) directly into your local library dashboard."
    },
    {
      q: "Does UDIOSUNOVA AI work with other AI audio platforms?",
      a: "Yes! You can import public audio links from Udio, Suno, Mureka, Musicful, FlowMusic, TopMediaAI, Treblo, and Tad AI. Access their tailored scrapers in the AI Tools menu or paste any supported URL right in the search bar."
    },
    {
      q: "Can I get better quality than the standard Udio download?",
      a: "Yes! When you download normally, you get a compressed MP3. With UDIOSUNOVA, you can download the original track mapped to an ultra-high-fidelity 24-bit PCM WAV at 48,000Hz (Studio Quality). Our backend processes the native file through a state-of-the-art SoX Resampler to preserve high frequencies and phase linearity, meeting professional standards for DAW mastering."
    },
    {
      q: "How to download stems from Udio?",
      a: "Simply import your track with the Udio Downloader, click the track in your local library, and click 'Split Stems'. Our high-resolution separation engine will separate vocals, drums, bass, and instrumental melodies into independent high-quality WAV stems."
    },
    {
      q: "What metadata is included in Udio MP3 downloads?",
      a: "UDIOSUNOVA AI keeps the song title, artist name, lyrics, and original high-res cover art. Downloads embed ID3 tags seamlessly so that tracks show up beautifully inside iTunes, rekordbox, or on your mobile device."
    },
    {
      q: "Are my tracks private?",
      a: "Free accounts feature public community uploads. If you need complete privacy for your downloads and projects, choose one of our Premium/Pro tiers, which include advanced privacy toggles, unlimited metadata tagging, and high-fidelity WAV rendering."
    }
  ];

  return (
    <div id="udio-downloader-view" className="space-y-12 animate-fade-in text-left max-w-7xl mx-auto pb-16">
      
      {/* 1. Header Back Button */}
      <div className="flex items-center justify-between border-b border-slate-800/40 pb-5">
        <button
          onClick={onBack}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowRight className="w-3.5 h-3.5 rotate-180 text-cyan-400" />
          <span>Back to Tools Suite</span>
        </button>

        <div className="flex items-center gap-1.5 bg-cyan-950/30 border border-cyan-500/15 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-cyan-400 animate-pulse">
          <Cpu className="w-3.5 h-3.5" />
          <span>Udio API Scraper Active</span>
        </div>
      </div>

      {/* 2. Hero Downloader Box (Matches Image 2 & 4 styling) */}
      <div className="bg-gradient-to-b from-[#0b1b36] to-[#040d1a] border border-cyan-500/20 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] tracking-widest font-black uppercase bg-[#2563EB]/10 border border-[#2563EB]/25 text-[#38BDF8] px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Premium Scraper</span>
            </span>
            <span className="text-[10px] tracking-widest font-bold uppercase bg-slate-800/60 text-slate-400 border border-slate-700/50 px-2.5 py-1 rounded-full">
              Metadata Tagging
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Udio Downloader: Download Udio songs to MP3 with metadata
          </h1>
          
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            Download public Udio creations, tracks, playlist tracks, and full creator profile tracks as high-fidelity, metadata-tagged audio files. Ready for you to edit, restore, or split stems in Studio.
          </p>
        </div>

        {/* Input box form */}
        <form onSubmit={handleSubmit} className="mt-8 relative max-w-2xl z-10 space-y-3">
          <div className="flex flex-col sm:block relative">
            <input
              ref={inputRef}
              type="text"
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              placeholder="Paste your public Udio track URL, playlist, or creator link..."
              className="w-full bg-[#030712]/90 border border-slate-700 focus:border-cyan-500/60 text-sm text-white placeholder-slate-500 pl-4 pr-4 sm:pr-36 py-4 rounded-xl outline-none transition-all focus:ring-1 focus:ring-cyan-500/30 font-medium min-w-0"
              disabled={isImporting}
            />
            <button
              type="submit"
              disabled={isImporting || !localUrl.trim()}
              className="mt-2.5 sm:mt-0 w-full sm:w-auto sm:absolute sm:right-2 sm:top-1/2 sm:-translate-y-1/2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-xs px-5 py-3 sm:py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(37,99,235,0.2)] cursor-pointer"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Import Track</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 pl-1">
            <Info className="w-3 h-3 text-cyan-500" />
            <span>Supports track links (e.g. <code>udio.com/songs/...</code>), playlists, and artist profiles.</span>
          </p>
        </form>

        {/* Import Status Loader */}
        {isImporting && importJobStatus && (
          <div className="mt-6 bg-[#030712]/60 border border-cyan-500/10 p-4 rounded-2xl max-w-2xl text-left space-y-2.5 animate-pulse">
            <div className="flex justify-between items-center text-xs">
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                {importJobStatus.progress < 25 ? 'Fetching Udio API' :
                 importJobStatus.progress < 60 ? 'Downloading media chunks' :
                 importJobStatus.progress < 90 ? 'Injecting metadata' : 'Rendering high-res audio'}
              </span>
              <span className="font-mono text-slate-400 font-bold">{importJobStatus.progress}%</span>
            </div>
            <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${importJobStatus.progress}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 leading-none">
              Status: <span className="text-slate-300 font-medium">{importJobStatus.message}</span>
            </p>
          </div>
        )}

        {importError && (
          <div className="mt-4 bg-red-950/20 border border-red-500/15 p-3.5 rounded-xl max-w-2xl text-xs text-red-400 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <p>{importError}</p>
          </div>
        )}
      </div>

      {/* 3. Main Grid Layout (Your Library & Community Testimonials) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Your local Udio library (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">Your local Udio library</h2>
              <p className="text-xs text-slate-400">Tracks imported and processed from Udio.</p>
            </div>
            <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-md">
              {udioTracks.length} tracks
            </span>
          </div>

          {udioTracks.length === 0 ? (
            <div className="bg-[#051121]/30 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-900/60 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Music className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">No tracks imported yet</p>
                <p className="text-[10px] text-slate-400 leading-normal max-w-xs mx-auto">
                  Paste an Udio song URL at the top of the page to download, tag, and restore its frequencies.
                </p>
              </div>
              <button 
                onClick={handleFocusInput}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Paste a link
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {udioTracks.map((track) => (
                <div 
                  key={track.id}
                  className="bg-[#051121]/40 border border-slate-800 hover:border-slate-700/60 rounded-xl p-3.5 flex items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img 
                      src={track.coverUrl || 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=120&q=80'} 
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover bg-slate-950 border border-slate-800 shrink-0 shadow-md"
                    />
                    <div className="min-w-0 text-left">
                      <h4 className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-xs">{track.title}</h4>
                      <p className="text-[10px] text-slate-400 truncate max-w-[180px] sm:max-w-xs mt-0.5">by {track.artist || 'Udio Producer'}</p>
                      
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[8px] font-mono font-bold uppercase bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                          MP3
                        </span>
                        <span className="text-[8px] font-mono font-bold text-cyan-400">
                          {track.sourcePlatform || 'Udio AI'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onDownloadTrack && (
                      <>
                        <button
                          onClick={() => onDownloadTrack(track.id, 'mp3')}
                          disabled={track.status !== AudioStatus.COMPLETE}
                          className="bg-[#2563EB]/10 hover:bg-[#2563EB] text-[#38BDF8] hover:text-white disabled:opacity-30 p-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center cursor-pointer gap-1"
                          title="Download MP3 (320kbps)"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-[9px]">MP3</span>
                        </button>
                        <button
                          onClick={() => onDownloadTrack(track.id, 'wav')}
                          disabled={track.status !== AudioStatus.COMPLETE}
                          className="bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 disabled:opacity-30 p-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center cursor-pointer gap-1"
                          title="Download Upscaled 24-bit WAV Studio Master"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-[9px]">WAV 24b</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onSelectTrack(track.id)}
                      className="bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 p-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                      title="Open in Studio Workspace"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteTrack(track.id)}
                      className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white p-2 rounded-lg text-xs transition-all flex items-center justify-center cursor-pointer"
                      title="Delete Track"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Social Proof / Description card below */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Full Metadata Recovery</span>
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Recover Udio tracks with cover art, artist name, song title, and track metadata. Keep a local library, then restore, split, or master the tracks you own from the same browser studio.
            </p>
          </div>
        </div>

        {/* Right: Community testimonials & proof (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
            <div>
              <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest">UDIOSUNOVA AI Rescues</h3>
              <h2 className="text-base font-extrabold text-white tracking-tight mt-1">
                More than 20,000+ users rescued their music from Udio
              </h2>
              <p className="text-[10px] text-slate-400 leading-normal mt-1">
                Check some of the recently processed audio backups, exported as metadata-tagged studio configurations.
              </p>
            </div>

            {/* List of Mockup files downloaded */}
            <div className="space-y-3">
              {rescuedMockups.map((mock) => (
                <div 
                  key={mock.id}
                  className="bg-slate-900/40 border border-slate-800/60 p-2.5 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={mock.coverUrl} 
                      alt={mock.title} 
                      className="w-10 h-10 rounded-lg object-cover bg-slate-950 shrink-0" 
                    />
                    <div className="min-w-0 text-left">
                      <p className="text-[10px] font-bold text-slate-200 truncate">{mock.title}</p>
                      <p className="text-[9px] text-slate-500 truncate">by {mock.artist}</p>
                    </div>
                  </div>
                  
                  <div className="text-right font-mono shrink-0">
                    <p className="text-[9px] text-[#38BDF8] font-bold flex items-center gap-0.5 justify-end">
                      <Download className="w-2.5 h-2.5" />
                      <span>{mock.downloads}</span>
                    </p>
                    <p className="text-[8px] text-slate-500 mt-0.5">{mock.duration}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800/60 pt-4 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Total Rescued Catalog</span>
              <span className="text-cyan-400 font-bold">142,501 WAV files</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. How to Download From Udio & Recover (Matches Image 3) */}
      <div className="bg-gradient-to-r from-blue-950/20 via-slate-900/40 to-cyan-950/25 border border-slate-800 rounded-3xl p-6 sm:p-10 text-center space-y-10">
        <div className="space-y-2">
          <span className="text-[10px] tracking-widest font-bold uppercase text-[#38BDF8] bg-[#2563EB]/10 border border-[#2563EB]/25 px-2.5 py-1 rounded-full">
            3-Step Library Rescue
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            How to Download From Udio and Recover Your Library
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            Our platform connects securely to public metadata indices. Recover your library in three easy steps.
          </p>
        </div>

        {/* 3 Step columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-[#030712]/50 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-cyan-500/20 transition-all">
            <span className="absolute top-3 right-4 font-black font-mono text-slate-800 text-3xl group-hover:text-cyan-500/10 transition-colors">01</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
              1
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Copy Link</h3>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Grab the public URL of any Udio song, creator profile, or playlist. Wait for the generation to finish. Make sure tracks are public.
            </p>
          </div>

          <div className="bg-[#030712]/50 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-cyan-500/20 transition-all">
            <span className="absolute top-3 right-4 font-black font-mono text-slate-800 text-3xl group-hover:text-cyan-500/10 transition-colors">02</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
              2
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Paste Above</h3>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Paste the link in the UDIOSUNOVA AI downloader box at the top of this page and click import.
            </p>
          </div>

          <div className="bg-[#030712]/50 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-cyan-500/20 transition-all">
            <span className="absolute top-3 right-4 font-black font-mono text-slate-800 text-3xl group-hover:text-cyan-500/10 transition-colors">03</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">
              3
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Download File</h3>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Import the track, then download a tagged MP3 with cover art from Studio. Want more? Upgrade for batch download, WAV upscaling and mastering.
            </p>
          </div>
        </div>

        {/* Save All Tracks Callout (Matches Image 3 bottom banner) */}
        <div className="bg-slate-950/80 border border-cyan-500/15 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-2 max-w-xl">
            <span className="text-[8px] font-black uppercase bg-[#2563EB]/10 border border-[#2563EB]/25 text-[#38BDF8] px-2 py-0.5 rounded">
              Batch Save Active
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Save All Your Tracks Before It's Too Late
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Batch import up to 100 tracks from any Udio playlist or creator page. Download them one by one, or use paid-plan batch export to get selected tracks at once.
            </p>
          </div>

          <div className="shrink-0 flex flex-wrap gap-3">
            <button
              onClick={handleFocusInput}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.15)]"
            >
              Start Import
            </button>
            <button
              onClick={() => setShowPricingModal(true)}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer"
            >
              Upgrade &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* 5. FAQs Section (Matches Image 5 & 6) */}
      <div className="space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400">Everything you need to know about the UDIOSUNOVA AI Udio Downloader.</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3.5">
          {faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div 
                key={idx}
                className="bg-[#051121]/30 border border-slate-800/80 rounded-xl overflow-hidden transition-colors hover:border-slate-800"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left text-xs font-bold text-white gap-4 hover:bg-slate-900/40 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-cyan-400 transition-transform shrink-0 duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-800/40"
                    >
                      <div className="px-5 py-4 text-xs text-slate-400 leading-relaxed font-normal bg-[#030812]/40">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Bottom CTA Block (Matches Image 6 Footer) */}
      <div className="bg-gradient-to-b from-[#0b1b36]/60 to-slate-950/40 border border-slate-800 rounded-3xl p-6 sm:p-10 text-center space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
            Ready to recover your Udio library?
          </h2>
          <p className="text-xs text-slate-400">
            Ditch the feed and start building your local high-fidelity library today.
          </p>
        </div>
        <button
          onClick={handleFocusInput}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.2)] inline-flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Try Udio Downloader</span>
        </button>
      </div>

    </div>
  );
}
