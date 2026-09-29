/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Upload, Sparkles, Waves, Headphones, Music } from 'lucide-react';

interface ShowcaseSectionsProps {
  onImportAudio: () => void;
}

interface StemExample {
  id: string;
  title: string;
  description: string;
  toggles: ('original' | 'lalal' | 'neural')[];
  synthType: 'piano' | 'drums' | 'reverb' | 'crowd';
}

const STEM_EXAMPLES: StemExample[] = [
  {
    id: 'piano',
    title: 'Example: Piano Extraction from Full Mix',
    description: 'SAM Audio isolates the piano from a complex classical passage with minimal artifacts.',
    toggles: ['original', 'lalal', 'neural'],
    synthType: 'piano',
  },
  {
    id: 'drums',
    title: 'Example: Removing Drums from a Cinematic Track',
    description: 'Despite the prompt containing NO DRUMS and NO PERCUSSION, the music model still added some. Use SAM Audio to remove these uncommon sounds.',
    toggles: ['original', 'neural'],
    synthType: 'drums',
  },
  {
    id: 'reverb',
    title: 'Example: Removing Reverb from a Vocal Track',
    description: 'Clean up vocals by removing room echo and reverb trails using deconvolution.',
    toggles: ['original', 'neural'],
    synthType: 'reverb',
  },
  {
    id: 'crowd',
    title: 'Example: Removing Crowd Noise from a Live Recording',
    description: 'Listen to how the kid noises and chatter are removed from the live performance.',
    toggles: ['original', 'neural'],
    synthType: 'crowd',
  }
];

export default function ShowcaseSections({ onImportAudio }: ShowcaseSectionsProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activeToggles, setActiveToggles] = useState<Record<string, 'original' | 'lalal' | 'neural'>>({
    piano: 'original',
    drums: 'original',
    reverb: 'original',
    crowd: 'original',
  });
  const [playheadProgress, setPlayheadProgress] = useState<Record<string, number>>({
    piano: 0,
    drums: 0,
    reverb: 0,
    crowd: 0,
  });

  // Web Audio Context & Node references for real-time sound simulation
  const stemAudioCtxRef = useRef<AudioContext | null>(null);
  const stemSynthNodesRef = useRef<{
    osc1?: OscillatorNode;
    osc2?: OscillatorNode;
    noise?: AudioBufferSourceNode;
    noiseGain?: GainNode;
    filter?: BiquadFilterNode;
    gain?: GainNode;
    lfo?: OscillatorNode;
    lfoGain?: GainNode;
    delay?: DelayNode;
    delayGain?: GainNode;
  } | null>(null);

  const stemAnimationFrameId = useRef<number | null>(null);

  // Stop stem synth engine
  const stopStemSynthEngine = () => {
    if (stemAudioCtxRef.current) {
      if ((stemAudioCtxRef.current as any).patternInterval) {
        clearInterval((stemAudioCtxRef.current as any).patternInterval);
      }
      try {
        if (stemSynthNodesRef.current) {
          stemSynthNodesRef.current.osc1?.stop();
          stemSynthNodesRef.current.osc2?.stop();
          stemSynthNodesRef.current.noise?.stop();
          stemSynthNodesRef.current.lfo?.stop();
        }
        stemAudioCtxRef.current.close();
      } catch (e) {}
      stemAudioCtxRef.current = null;
      stemSynthNodesRef.current = null;
    }
  };

  // Helper to dynamically adjust filters and noise levels based on Active mode
  const updateStemFilters = (id: string, mode: 'original' | 'lalal' | 'neural') => {
    const nodes = stemSynthNodesRef.current;
    if (!nodes || !stemAudioCtxRef.current) return;
    const ctx = stemAudioCtxRef.current;

    if (id === 'piano') {
      if (mode === 'original') {
        // Original: Piano + background shaker noise
        nodes.filter?.frequency.setValueAtTime(10000, ctx.currentTime);
        nodes.noiseGain?.gain.setValueAtTime(0.04, ctx.currentTime);
        if (nodes.lfoGain) nodes.lfoGain.gain.setValueAtTime(0, ctx.currentTime);
      } else if (mode === 'lalal') {
        // Lalal.ai: phasey bubbly piano, no shaker but bubbly LFO sweep
        nodes.filter?.frequency.setValueAtTime(2500, ctx.currentTime);
        nodes.noiseGain?.gain.setValueAtTime(0.001, ctx.currentTime);
        if (nodes.lfoGain) nodes.lfoGain.gain.setValueAtTime(800, ctx.currentTime);
      } else {
        // UdioSunova Analog: pristine piano, no shaker, no phaser
        nodes.filter?.frequency.setValueAtTime(16000, ctx.currentTime);
        nodes.noiseGain?.gain.setValueAtTime(0.001, ctx.currentTime);
        if (nodes.lfoGain) nodes.lfoGain.gain.setValueAtTime(0, ctx.currentTime);
      }
    } else if (id === 'drums') {
      if (mode === 'original') {
        // Original: Pad + loud rhythmic drum hits
        nodes.noiseGain?.gain.setValueAtTime(0.12, ctx.currentTime);
      } else {
        // UdioSunova Analog: pad only (silent drums)
        nodes.noiseGain?.gain.setValueAtTime(0, ctx.currentTime);
      }
    } else if (id === 'reverb') {
      if (mode === 'original') {
        // Original: vocal melody with heavy wet reverb/delay
        nodes.delayGain?.gain.setValueAtTime(0.65, ctx.currentTime);
      } else {
        // UdioSunova Analog: direct dry vocal
        nodes.delayGain?.gain.setValueAtTime(0.01, ctx.currentTime);
      }
    } else if (id === 'crowd') {
      if (mode === 'original') {
        // Original: speech voice + loud crowd chatter
        nodes.noiseGain?.gain.setValueAtTime(0.07, ctx.currentTime);
      } else {
        // UdioSunova Analog: speech voice with silent background
        nodes.noiseGain?.gain.setValueAtTime(0.002, ctx.currentTime);
      }
    }
  };

  // Sound Engine: start synthesized audio loop
  const startStemSynthEngine = (id: string, synthType: 'piano' | 'drums' | 'reverb' | 'crowd') => {
    try {
      stopStemSynthEngine();

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      stemAudioCtxRef.current = ctx;

      const filterNode = ctx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(8000, ctx.currentTime);

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.12; // safe volume

      // Create noise node
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const noiseGainNode = ctx.createGain();
      noiseSource.connect(noiseGainNode);
      noiseGainNode.connect(filterNode);
      noiseSource.start();

      let osc1 = ctx.createOscillator();
      let osc2 = ctx.createOscillator();

      let lfoNode: OscillatorNode | undefined;
      let lfoGainNode: GainNode | undefined;
      let delayNode: DelayNode | undefined;
      let delayGainNode: GainNode | undefined;

      if (synthType === 'piano') {
        // Piano: classic chord trigger progression
        osc1.type = 'sine';
        osc2.type = 'triangle';

        // Set up LFO for Lalal.ai phase artifacts
        lfoNode = ctx.createOscillator();
        lfoNode.type = 'sine';
        lfoNode.frequency.value = 8.0;

        lfoGainNode = ctx.createGain();
        lfoNode.connect(lfoGainNode);
        lfoGainNode.connect(filterNode.frequency);
        lfoNode.start();

        const notes = [
          [220.00, 261.63, 329.63], // Am
          [174.61, 220.00, 261.63], // F
          [130.81, 164.81, 196.00], // C
          [196.00, 246.94, 293.66], // G
        ];

        let chordIdx = 0;
        const interval = setInterval(() => {
          if (stemAudioCtxRef.current && stemAudioCtxRef.current.state === 'running') {
            const chord = notes[chordIdx % notes.length];
            const now = ctx.currentTime;
            osc1.frequency.setValueAtTime(chord[0], now);
            osc2.frequency.setValueAtTime(chord[1], now);
            chordIdx++;
          }
        }, 1200);

        (ctx as any).patternInterval = interval;

      } else if (synthType === 'drums') {
        // Drums: deep bass sawtooth pad
        osc1.type = 'sawtooth';
        osc1.frequency.value = 73.42; // D2
        osc2.type = 'sawtooth';
        osc2.frequency.value = 110.00; // A2

        filterNode.frequency.setValueAtTime(320, ctx.currentTime);

        // trigger rhythmic drum hits on the noise source
        const interval = setInterval(() => {
          if (stemAudioCtxRef.current && stemAudioCtxRef.current.state === 'running') {
            const now = ctx.currentTime;
            noiseGainNode.gain.setValueAtTime(0.24, now);
            noiseGainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          }
        }, 500);
        (ctx as any).patternInterval = interval;

      } else if (synthType === 'reverb') {
        // Reverb: gentle vocal-like sine wave playing a melody
        osc1.type = 'sine';
        osc1.frequency.value = 329.63; // E4
        osc2.type = 'triangle';
        osc2.frequency.value = 392.00; // G4

        // Multi-tap Delay effect
        delayNode = ctx.createDelay(1.0);
        delayNode.delayTime.value = 0.32;

        delayGainNode = ctx.createGain();
        delayGainNode.gain.value = 0.45;

        osc1.connect(delayNode);
        osc2.connect(delayNode);
        delayNode.connect(delayGainNode);
        delayGainNode.connect(delayNode);
        delayGainNode.connect(filterNode);

        const melody = [329.63, 392.00, 440.00, 392.00];
        let noteIdx = 0;
        const interval = setInterval(() => {
          if (stemAudioCtxRef.current && stemAudioCtxRef.current.state === 'running') {
            const now = ctx.currentTime;
            osc1.frequency.setValueAtTime(melody[noteIdx % melody.length], now);
            osc2.frequency.setValueAtTime(melody[noteIdx % melody.length] * 1.5, now);
            noteIdx++;
          }
        }, 800);
        (ctx as any).patternInterval = interval;

      } else if (synthType === 'crowd') {
        // Crowd: speech fundamental E2 modulated by voice cadences
        osc1.type = 'triangle';
        osc1.frequency.value = 98.00; // G2
        osc2.type = 'sine';
        osc2.frequency.value = 146.83; // D3

        const modGain = ctx.createGain();
        modGain.gain.value = 12;
        const modOsc = ctx.createOscillator();
        modOsc.type = 'sine';
        modOsc.frequency.value = 2.4;
        modOsc.connect(modGain);
        modGain.connect(osc1.frequency);
        modOsc.start();
      }

      osc1.connect(filterNode);
      osc2.connect(filterNode);
      filterNode.connect(masterGain);
      masterGain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      stemSynthNodesRef.current = {
        osc1,
        osc2,
        noise: noiseSource,
        noiseGain: noiseGainNode,
        filter: filterNode,
        gain: masterGain,
        lfo: lfoNode,
        lfoGain: lfoGainNode,
        delay: delayNode,
        delayGain: delayGainNode,
      };

      const currentMode = activeToggles[id];
      updateStemFilters(id, currentMode);

    } catch (e) {
      console.error('Failed to start stem synth engine:', e);
    }
  };

  // Stem Playback Control
  const handleStemPlayPause = (id: string, synthType: 'piano' | 'drums' | 'reverb' | 'crowd') => {
    if (playingId === id) {
      setPlayingId(null);
      stopStemSynthEngine();
    } else {
      setPlayingId(id);
      startStemSynthEngine(id, synthType);
    }
  };

  // Live playhead animation loop for stem examples
  useEffect(() => {
    if (playingId) {
      const startTime = Date.now();
      const initialProgress = playheadProgress[playingId] || 0;
      
      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const totalDuration = 12; // 12 seconds loop
        const nextProgress = (initialProgress + (elapsed / totalDuration)) % 1.0;
        
        setPlayheadProgress(prev => ({
          ...prev,
          [playingId]: nextProgress
        }));

        stemAnimationFrameId.current = requestAnimationFrame(animate);
      };
      
      stemAnimationFrameId.current = requestAnimationFrame(animate);
    } else {
      if (stemAnimationFrameId.current) {
        cancelAnimationFrame(stemAnimationFrameId.current);
      }
    }

    return () => {
      if (stemAnimationFrameId.current) {
        cancelAnimationFrame(stemAnimationFrameId.current);
      }
    };
  }, [playingId]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopStemSynthEngine();
    };
  }, []);

  const handleToggle = (id: string, mode: 'original' | 'lalal' | 'neural') => {
    setActiveToggles(prev => {
      const updated = { ...prev, [id]: mode };
      
      if (playingId === id && stemSynthNodesRef.current) {
        updateStemFilters(id, mode);
      }
      
      return updated;
    });
  };

  // Helper to generate realistic waveform height bars programmatically to match screenshots
  const getWaveformHeights = (id: string, count = 120) => {
    const heights: number[] = [];
    for (let i = 0; i < count; i++) {
      const progress = i / count;
      let h = 0.15;

      if (id === 'piano') {
        h = Math.abs(Math.sin(progress * Math.PI * 6.5) * Math.cos(progress * Math.PI * 2.2)) * 0.72 + 0.14;
        h += Math.sin(progress * 110) * 0.08;
      } else if (id === 'drums') {
        h = Math.abs(Math.sin(progress * Math.PI * 16)) * 0.45 + 0.45;
        h += Math.sin(progress * 190) * 0.05;
      } else if (id === 'reverb') {
        const phrase1 = progress > 0.05 && progress < 0.23;
        const phrase2 = progress > 0.28 && progress < 0.54;
        const phrase3 = progress > 0.60 && progress < 0.76;
        const phrase4 = progress > 0.81 && progress < 0.95;
        if (phrase1 || phrase2 || phrase3 || phrase4) {
          h = Math.abs(Math.sin(progress * Math.PI * 22)) * 0.68 + 0.15;
          h += Math.cos(progress * 110) * 0.09;
        } else {
          h = 0.04;
        }
      } else if (id === 'crowd') {
        const burst1 = progress > 0.06 && progress < 0.36;
        const burst2 = progress > 0.41 && progress < 0.66;
        const burst3 = progress > 0.71 && progress < 0.95;
        if (burst1 || burst2 || burst3) {
          h = Math.abs(Math.sin(progress * Math.PI * 11)) * 0.72 + 0.12;
          h += Math.sin(progress * 75) * 0.07;
        } else {
          h = 0.05;
        }
      }
      heights.push(Math.max(0.04, Math.min(0.95, h)));
    }
    return heights;
  };

  return (
    <div id="showcase-additional-sections" className="w-full space-y-24 mt-20 relative">
      
      {/* ----------------- SECTION 1: IMPORT ANY TRACK ----------------- */}
      <div id="import-any-track-section" className="max-w-4xl mx-auto px-4 text-center space-y-12">
        
        {/* Title and Subtitle */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Import Any Track. From Link or File.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Paste a Suno or Udio link, or drop your own DAW exports. We automatically fetch metadata, cover art, measure LUFS, compute spectrogram, and prepare your track for the ultimate polish.
          </p>
        </div>

        {/* Image Card Container */}
        <div className="flex justify-center">
          <div 
            id="shifting-sands-player-mockup"
            className="w-full max-w-3xl bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative group"
          >
            <img 
              src="https://neuralanalog.com/_next/image?url=%2Fimg%2Flanding-mp3-metadata.png&w=1920&q=75&dpl=cc30_2026-07-01_13-55-26"
              alt="Import and metadata extraction visualizer"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover opacity-95 group-hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </div>

      </div>

      {/* ----------------- SECTION 1.5: PROCESS IN BULK ----------------- */}
      <div id="process-in-bulk-section" className="max-w-4xl mx-auto px-4 text-center space-y-12">
        
        {/* Title and Subtitle */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Process in Bulk
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Import whole playlists from Suno or Udio, or upload multiple files at once. Restore, master, and download all of them in one click. Perfect for albums, labels, compilations, YouTube channels, AI tubers, and DJs who need to process entire libraries in a single click.
          </p>
        </div>

        {/* Bulk Image Card Container */}
        <div className="flex justify-center">
          <div 
            id="bulk-processing-mockup"
            className="w-full max-w-3xl bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative group"
          >
            <img 
              src="https://neuralanalog.com/_next/image?url=%2Fimg%2Fbatch-import.jpeg&w=3840&q=75&dpl=cc30_2026-07-01_13-55-26"
              alt="Process in Bulk Batch upload visualizer"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover opacity-95 group-hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center pt-2">
          <button
            id="bulk-import-cta-btn"
            onClick={onImportAudio}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-500/15 hover:shadow-orange-500/25 transform active:scale-97 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import audio</span>
          </button>
        </div>

      </div>

      {/* ----------------- SECTION 2: SURGICAL STEM SPLITTING ----------------- */}
      <div id="surgical-stem-splitting-section" className="max-w-4xl mx-auto px-4 text-left space-y-12">
        
        {/* Title and Subtitle */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Surgical Stem Splitting
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Isolate any instrument with precision. Ditch the generic presets and describe exactly what you want to extract, from "piano" to "vintage drum machine".
          </p>
        </div>

        {/* 4 Beautiful interactive examples as seen in the screenshot */}
        <div className="space-y-14 pt-4">
          {STEM_EXAMPLES.map((example) => {
            const currentMode = activeToggles[example.id];
            const isPlaying = playingId === example.id;
            const progress = playheadProgress[example.id] || 0;
            const heights = getWaveformHeights(example.id);

            return (
              <div 
                key={example.id}
                id={`stem-example-${example.id}`}
                className="space-y-4 text-left"
              >
                {/* Title and Toggle row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {example.title}
                  </h3>
                  
                  {/* Tab Selector Pill Button Group */}
                  <div className="flex items-center bg-[#0a0f1d]/70 border border-slate-800/80 rounded-lg p-0.5 text-xs font-semibold shrink-0 overflow-x-auto max-w-full no-scrollbar">
                    {example.toggles.map((toggleMode) => {
                      const isActive = currentMode === toggleMode;
                      return (
                        <button
                          key={toggleMode}
                          onClick={() => handleToggle(example.id, toggleMode)}
                          className={`px-2 py-1.5 sm:px-3 sm:py-1.5 rounded transition-all flex items-center gap-1.5 cursor-pointer font-medium text-[10px] sm:text-[11px] whitespace-nowrap ${
                            isActive
                              ? 'bg-slate-800 text-white border border-slate-700/60 shadow-sm'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {toggleMode === 'original' && <span className="text-amber-500 text-[10px] sm:text-xs">♫</span>}
                          {toggleMode === 'lalal' && <span className="text-indigo-400 text-[10px] sm:text-xs">✦</span>}
                          {toggleMode === 'neural' && <span className="text-cyan-400 text-[10px] sm:text-xs">✦</span>}
                          <span className="capitalize">
                            {toggleMode === 'neural' ? 'UdioSunova Analog' : toggleMode}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Subtext description */}
                <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
                  {example.description}
                </p>

                {/* Play button and soundwave player */}
                <div className="flex items-center gap-4 bg-[#040d1a]/40 border border-slate-900/60 p-3 rounded-xl">
                  {/* Play/Pause Button */}
                  <button
                    onClick={() => handleStemPlayPause(example.id, example.synthType)}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all border shrink-0 cursor-pointer ${
                      isPlaying
                        ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)] scale-102'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-white hover:scale-102'
                    }`}
                    title={isPlaying ? 'Pause simulation' : 'Play simulation'}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>

                  {/* Programmatic custom waveform bars matching screenshot */}
                  <div className="flex-1 h-12 flex items-center justify-between gap-[2.5px] relative px-1 select-none">
                    {heights.map((height, idx) => {
                      const barFraction = idx / heights.length;
                      const isPlayed = barFraction <= progress;

                      return (
                        <div
                          key={idx}
                          className={`w-[2.5px] rounded-full transition-all duration-300 ${
                            idx >= 36 ? 'hidden sm:block' : ''
                          } ${
                            isPlayed && isPlaying
                              ? 'bg-[#06b6d4] shadow-[0_0_8px_rgba(6,182,212,0.65)] h-full'
                              : 'bg-slate-700/35 hover:bg-slate-600/50'
                          }`}
                          style={{ height: `${height * 100}%` }}
                        />
                      );
                    })}

                    {/* Playhead slider line */}
                    {isPlaying && (
                      <div
                        className="absolute top-0 bottom-0 w-[1.5px] bg-white shadow-[0_0_8px_#fff] pointer-events-none transition-all duration-100"
                        style={{ left: `${progress * 100}%` }}
                      />
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* ----------------- SECTION 3: PRO MASTERING FOR STREAMING ----------------- */}
      <div id="pro-mastering-section" className="max-w-4xl mx-auto px-4 text-center space-y-8 pb-12">
        
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Pro Mastering for Streaming
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Hit industry standard loudness and tonal balance in seconds. Use Match EQ to capture the vibe of top-chart hits and make your audio sound release-ready.
          </p>
        </div>

        {/* Centered CTA Orange Import Button */}
        <div className="flex justify-center pt-2">
          <button
            id="pro-mastering-cta-btn"
            onClick={onImportAudio}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white font-black text-sm tracking-wide shadow-lg shadow-orange-500/15 hover:shadow-orange-500/25 transform active:scale-97 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import audio</span>
          </button>
        </div>

      </div>

    </div>
  );
}
