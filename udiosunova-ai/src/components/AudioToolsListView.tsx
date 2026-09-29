/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Cpu, 
  Sliders, 
  Disc, 
  Waves, 
  RefreshCw, 
  ArrowRight, 
  Check, 
  FileText, 
  Info, 
  ArrowUpRight,
  ExternalLink,
  Code
} from 'lucide-react';

interface AudioToolsListViewProps {
  onSelectTool: (toolId: string) => void;
}

export default function AudioToolsListView({ onSelectTool }: AudioToolsListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Define categorized tools
  const toolCategories = [
    {
      id: 'import',
      title: 'Import',
      description: 'Fetch tracks directly from generative AI spaces & public links',
      icon: <Download className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/15 text-cyan-400 hover:border-cyan-500/40 bg-cyan-950/10',
      tools: [
        { id: 'udio-downloader', label: 'Udio downloader', badge: 'Popular', desc: 'Download Udio songs to MP3/WAV with full metadata', route: 'udio-downloader' },
        { id: 'suno-downloader', label: 'Suno downloader', badge: 'Active', desc: 'Extract high-res public files from Suno URLs', route: 'suno-downloader' },
        { id: 'mureka-downloader', label: 'Mureka downloader', desc: 'Download Mureka generation tracks easily', route: 'udio-downloader' },
        { id: 'musicful-downloader', label: 'Musicful downloader', desc: 'Import public audio URLs from Musicful', route: 'udio-downloader' },
        { id: 'flowmusic-downloader', label: 'FlowMusic downloader', desc: 'Convert and save FlowMusic compositions', route: 'udio-downloader' },
        { id: 'topmediaai-downloader', label: 'TopMediaAI downloader', desc: 'Extract clean stems from TopMediaAI link', route: 'udio-downloader' },
        { id: 'treblo-downloader', label: 'Treblo downloader', desc: 'Backup and download Treblo audio creations', route: 'udio-downloader' },
        { id: 'tad-ai-downloader', label: 'Tad AI downloader', desc: 'Save Tad AI generations in high quality', route: 'udio-downloader' },
      ]
    },
    {
      id: 'restoration',
      title: 'Restoration',
      description: 'Remove heavy compression, clicks, hiss, and rebuild high bands',
      icon: <Cpu className="w-5 h-5 text-blue-400" />,
      color: 'border-blue-500/15 text-blue-400 hover:border-blue-500/40 bg-blue-950/10',
      tools: [
        { id: 'restore-mp3', label: 'Restore MP3 to remove artifacts', badge: 'HD', desc: 'Filter compression squeaks and pre-echo artifacts', route: 'restorer' },
        { id: 'ai-upscaling', label: 'AI music upscaling', badge: '96kHz', desc: 'Reconstruct high-frequency detail above 15kHz', route: 'restorer' },
        { id: 'fix-suno-hiss', label: 'Fix Suno hiss & tin can sound', desc: 'Remove metallic resonance and digital sibilance', route: 'restorer' },
        { id: 'ai-upscaler-songs', label: 'AI audio upscaler for songs', desc: 'Upscale low bitrates to studio-level playback', route: 'restorer' },
        { id: 'upscale-wav', label: 'Upscale MP3 to WAV', desc: 'Bit-perfect container conversion with upsampled content', route: 'converter' },
        { id: 'audiosr-online', label: 'AudioSR online', desc: 'Super-resolution UdioSunova model', route: 'restorer' },
        { id: 'universr-online', label: 'UniverSR online', desc: 'Universal speech/music audio UdioSunova restorer', route: 'restorer' },
        { id: 'restore-whatsapp', label: 'Restore Whatsapp Voice notes', desc: 'Denoise and amplify muffled voice recordings', route: 'restorer' },
        { id: 'fix-podcast', label: 'Fix Audio for Podcast', desc: 'Level loudness, gate ambient room noise', route: 'restorer' },
      ]
    },
    {
      id: 'mastering',
      title: 'Mastering',
      description: 'Finalize tracks with loudness, tape saturation, and spatial wide stage',
      icon: <Disc className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/15 text-purple-400 hover:border-purple-500/40 bg-purple-950/10',
      tools: [
        { id: 'dolby-atmos', label: 'Convert to Dolby Atmos', badge: '3D Spatial', desc: 'Binaural panning, 3D reflection simulation', route: 'spatial' },
        { id: 'match-eq', label: 'Match EQ Matchering', desc: 'Analyze reference curve and stamp on your track', route: 'mastering' },
        { id: 'auto-mastering', label: 'Automatic mastering', badge: 'AI', desc: 'Compress, limit, and optimize LUFS targets', route: 'mastering' },
        { id: 'master-suno', label: 'Master Suno songs', desc: 'Custom EQ profiles tailored for Suno tracks', route: 'mastering' },
        { id: 'master-udio', label: 'Master Udio songs', desc: 'Enhance dynamic range of Udio compositions', route: 'mastering' },
        { id: 'louder-songs', label: 'Make Suno songs louder', desc: 'Increase digital ceiling without brickwall distortion', route: 'mastering' },
        { id: 'wider-songs', label: 'Make songs wider', desc: 'Stereo imager using mid-side signal splitting', route: 'mastering' },
      ]
    },
    {
      id: 'other',
      title: 'Other',
      description: 'Integrate UdioSunova Analog algorithms in your software pipeline',
      icon: <Code className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/15 text-emerald-400 hover:border-emerald-500/40 bg-emerald-950/10',
      tools: [
        { id: 'api-reference', label: 'Developers API reference', badge: 'GraphQL', desc: 'Integrate restorer or stem splitter endpoints', route: 'api-ref' },
      ]
    }
  ];

  // Filter tools based on search query
  const filteredCategories = toolCategories.map(category => {
    const filteredTools = category.tools.filter(tool => 
      tool.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      ...category,
      tools: filteredTools
    };
  }).filter(category => category.tools.length > 0);

  return (
    <div id="tools-list-view" className="space-y-8 animate-fade-in text-left">
      {/* Banner / Header matching Image 1 */}
      <div className="bg-gradient-to-r from-blue-950/30 via-slate-900/50 to-cyan-950/35 border border-cyan-500/15 rounded-2xl p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl space-y-4 relative z-10">
          <span className="text-[10px] tracking-widest font-bold uppercase bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full">
            UDIOSUNOVA AI Directory
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            List of the Best Audio Tools from UDIOSUNOVA AI
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            Restore, enhance, and transform your audio to increase clarity, reduce noise, and breathe new life into your creations. Discover GPU-based tools for upscaling, denoising, and repairing your audio with precision and ease.
          </p>
        </div>

        {/* Search Input bar matching Image 1 */}
        <div className="mt-8 relative max-w-xl z-10">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
            <Search className="w-5 h-5 text-cyan-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools (e.g. Udio downloader, upscaling, Dolby)..."
            className="w-full bg-[#030712]/80 border border-slate-800 focus:border-cyan-500/60 text-sm text-white placeholder-slate-500 pl-12 pr-4 py-3.5 rounded-xl outline-none transition-all focus:ring-1 focus:ring-cyan-500/30 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid of Categorized Columns matching Image 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {filteredCategories.map((category) => (
          <div 
            key={category.id} 
            className="bg-[#051121]/50 border border-slate-800/80 rounded-2xl p-5 space-y-4 hover:border-slate-800 transition-all flex flex-col h-full justify-between"
          >
            <div>
              {/* Category Header */}
              <div className="flex items-center gap-2.5 border-b border-slate-800/50 pb-3">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                  {category.icon}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">{category.title}</h2>
                  <p className="text-[10px] text-slate-500">{category.tools.length} available tools</p>
                </div>
              </div>

              {/* Tools List under Category */}
              <div className="space-y-2 mt-4">
                {category.tools.map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => onSelectTool(tool.route)}
                    className="group border border-slate-800/40 hover:border-cyan-500/30 bg-[#030a14]/60 p-3 rounded-xl cursor-pointer transition-all hover:bg-cyan-950/10 flex flex-col justify-between hover:scale-[1.01]"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-cyan-400 transition-colors leading-snug">
                        {tool.label}
                      </span>
                      {tool.badge && (
                        <span className="text-[8px] font-black uppercase bg-cyan-400/10 text-cyan-400 px-1.5 py-0.5 rounded shrink-0">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {tool.desc}
                    </p>
                    <div className="flex items-center justify-end text-[9px] font-bold text-[#38BDF8] opacity-0 group-hover:opacity-100 transition-opacity gap-1 mt-2">
                      <span>Launch tool</span>
                      <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column Footer Info */}
            <div className="pt-4 border-t border-slate-800/30 text-[10px] text-slate-500 leading-tight">
              {category.description}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Help callout */}
      <div className="bg-[#030712]/50 border border-dashed border-slate-800/80 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-white">Can't find a specific tool?</p>
            <p className="text-[10px] text-slate-400">Our GPU cluster parses many external AI interfaces dynamically. Try pasting your audio link directly into the Studio workspace.</p>
          </div>
        </div>
        <button 
          onClick={() => onSelectTool('restorer')}
          className="text-xs font-bold text-cyan-400 hover:text-white flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <span>Open Main Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
