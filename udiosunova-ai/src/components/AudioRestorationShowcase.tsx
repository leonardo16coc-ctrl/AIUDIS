/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, Sparkles, AlertCircle, Headphones, Waves, Info } from 'lucide-react';

interface RestorationCardData {
  id: string;
  title: string;
  description: string;
  originalSpectrogram: string;
  restoredSpectrogram: string;
  originalLufs: string;
  restoredLufs: string;
  originalLabel: string;
  restoredLabel: string;
  // Synth properties for customized real-time sound simulation
  synthType: 'podcast' | 'asmr' | 'giorgio' | 'cutoff';
}

const RESTORATION_EXAMPLES: RestorationCardData[] = [
  {
    id: 'podcast',
    title: 'Example: Podcast Quality Restoration',
    description: 'Remove heavy compression, room reverb, and high-frequency roll-off from standard online streaming.',
    originalSpectrogram: 'https://neuralanalog.com/_next/image?url=https%3A%2F%2Fmedia.neuralanalog.com%2Fupscale%2Fspectrograms%2Fpodcast_original.png&w=1200&q=75',
    restoredSpectrogram: 'https://neuralanalog.com/_next/image?url=https%3A%2F%2Fmedia.neuralanalog.com%2Fupscale%2Fspectrograms%2Fpodcast_restored.png&w=1200&q=75',
    originalLufs: '-18.4 LUFS (Muffled)',
    restoredLufs: '-14.0 LUFS (Pristine WAV)',
    originalLabel: 'Original',
    restoredLabel: 'UdioSunova Analog',
    synthType: 'podcast',
  },
  {
    id: 'voicemail',
    title: 'Example: Voicemail ASMR Restoration',
    description: 'Recover whisper transients and eliminate intense background white noise from low-bandwidth recordings.',
    originalSpectrogram: 'https://neuralanalog.com/_next/image?url=https%3A%2F%2Fmedia.neuralanalog.com%2Fupscale%2Fspectrograms%2Fvoicemail_asmr.png&w=1200&q=75',
    restoredSpectrogram: 'https://neuralanalog.com/_next/image?url=https%3A%2F%2Fmedia.neuralanalog.com%2Fupscale%2Fspectrograms%2Fvoicemail_asmr_restored.png&w=1200&q=75',
    originalLufs: '-24.1 LUFS (High Noise)',
    restoredLufs: '-16.2 LUFS (Studio Crisp)',
    originalLabel: 'Original',
    restoredLabel: 'UdioSunova Analog',
    synthType: 'asmr',
  },
  {
    id: 'novasr',
    title: 'Example: Upscaled speech with NovaSR (mono)',
    description: 'Super-resolve vocal frequencies up to 48kHz, restoring missing harmonics and vintage warmth.',
    originalSpectrogram: 'https://neuralanalog.com/_next/image?url=https%3A%2F%2Fmedia.neuralanalog.com%2Fupscale%2Fspectrograms%2Fgiorgio_original.png&w=1200&q=75',
    restoredSpectrogram: 'https://neuralanalog.com/_next/image?url=https%3A%2F%2Fmedia.neuralanalog.com%2Fupscale%2Fspectrograms%2Fgiorgio_restored.png&w=1200&q=75',
    originalLufs: '-21.8 LUFS (8kHz Bandwidth)',
    restoredLufs: '-14.5 LUFS (HD Harmonics)',
    originalLabel: 'Original',
    restoredLabel: 'UdioSunova Analog',
    synthType: 'giorgio',
  },
  {
    id: 'audiosr',
    title: 'Example: AudioSR restoration (4kHz cutoff, mono)',
    description: 'Reconstruct high-frequency detail from a extreme brickwall filter cutoff, repairing damaged stems.',
    originalSpectrogram: 'https://media.neuralanalog.com/stems/ecabbd7e-d21a-4222-97d1-c01e92c8c2f0/a6f497c3-ae5a-4e09-8bac-a512b65b7c74/14291f0a-972e-4e81-b24c-56856e2016f4/crowd.preview-000000026290-000000051290.spectrogram.png',
    restoredSpectrogram: 'https://media.neuralanalog.com/upscaled/ecabbd7e-d21a-4222-97d1-c01e92c8c2f0/upscaled_f157df85-c6d3-4d0d-84fb-a855cda01dab.preview-000000026290-000000051290.spectrogram.png',
    originalLufs: '-19.5 LUFS (Severe Cutoff)',
    restoredLufs: '-14.2 LUFS (Full Spectrogram)',
    originalLabel: 'Original',
    restoredLabel: 'UdioSunova Analog',
    synthType: 'cutoff',
  }
];

export default function AudioRestorationShowcase() {
  const [activeToggles, setActiveToggles] = useState<Record<string, 'original' | 'restored'>>({
    podcast: 'restored',
    voicemail: 'restored',
    novasr: 'restored',
    audiosr: 'restored',
  });

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playheadProgress, setPlayheadProgress] = useState<Record<string, number>>({
    podcast: 0,
    voicemail: 0,
    novasr: 0,
    audiosr: 0,
  });

  // Web Audio Context & Node references for the real-time simulation
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{
    osc1?: OscillatorNode;
    osc2?: OscillatorNode;
    gain?: GainNode;
    noise?: AudioWorkletNode | AudioNode;
    noiseGain?: GainNode;
    filter?: BiquadFilterNode;
  } | null>(null);

  const animationFrameId = useRef<number | null>(null);

  // Toggle mode helper
  const handleToggle = (id: string) => {
    setActiveToggles(prev => {
      const nextVal = prev[id] === 'original' ? 'restored' : 'original';
      
      // If currently playing, dynamically adjust the sound synthesis nodes in real-time
      if (playingId === id && synthNodesRef.current) {
        updateSynthFilters(id, nextVal);
      }

      return {
        ...prev,
        [id]: nextVal
      };
    });
  };

  // Helper to dynamically adjust filter and noise levels based on Original vs Restored state
  const updateSynthFilters = (id: string, mode: 'original' | 'restored') => {
    const nodes = synthNodesRef.current;
    if (!nodes || !nodes.filter || !nodes.noiseGain) return;

    if (mode === 'original') {
      // original = muffled and noisy
      // Muffle: low pass at 400Hz to 800Hz
      const targetFreq = id === 'cutoff' ? 350 : id === 'voicemail' ? 500 : 700;
      nodes.filter.frequency.setValueAtTime(targetFreq, audioCtxRef.current?.currentTime || 0);
      
      // Hiss noise level
      const noiseVol = id === 'voicemail' ? 0.08 : id === 'podcast' ? 0.04 : 0.02;
      nodes.noiseGain.gain.setValueAtTime(noiseVol, audioCtxRef.current?.currentTime || 0);
    } else {
      // restored = pristine, high fidelity, no hiss
      nodes.filter.frequency.setValueAtTime(16000, audioCtxRef.current?.currentTime || 0);
      nodes.noiseGain.gain.setValueAtTime(0.001, audioCtxRef.current?.currentTime || 0);
    }
  };

  // Sound Engine: start synthesized audio loop
  const startSynthEngine = (id: string, synthType: 'podcast' | 'asmr' | 'giorgio' | 'cutoff') => {
    try {
      // Stop any existing synth
      stopSynthEngine();

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Base nodes
      const filterNode = ctx.createBiquadFilter();
      filterNode.type = 'lowpass';

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.15; // Safe volume limit

      // Noise source (for original analog tape hiss / compression artifacts)
      const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
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

      // Instrument / voice simulator
      let osc1 = ctx.createOscillator();
      let osc2 = ctx.createOscillator();

      if (synthType === 'podcast') {
        // Human voice simulation: Formant voice pads
        osc1.type = 'sawtooth';
        osc1.frequency.value = 110; // fundamental A2 (podcast speaker voice)
        
        osc2.type = 'triangle';
        osc2.frequency.value = 165; // fifth E3
        
        // Dynamic pitch modulation to sound like talking
        const modGain = ctx.createGain();
        modGain.gain.value = 12;
        const modOsc = ctx.createOscillator();
        modOsc.type = 'sine';
        modOsc.frequency.value = 1.8; // speaking cadences
        modOsc.connect(modGain);
        modGain.connect(osc1.frequency);
        modGain.connect(osc2.frequency);
        modOsc.start();
      } else if (synthType === 'asmr') {
        // ASMR simulation: Whispery sound. More white noise, gentle sine breath.
        osc1.type = 'sine';
        osc1.frequency.value = 440;
        
        osc2.type = 'triangle';
        osc2.frequency.value = 220;

        // Vibrato
        const modGain = ctx.createGain();
        modGain.gain.value = 8;
        const modOsc = ctx.createOscillator();
        modOsc.type = 'sine';
        modOsc.frequency.value = 0.5;
        modOsc.connect(modGain);
        modGain.connect(osc1.frequency);
        modOsc.start();
      } else if (synthType === 'giorgio') {
        // Giorgio synth simulation: high-speed melodic arpeggios
        osc1.type = 'sawtooth';
        osc1.frequency.value = 130.81; // C3
        
        osc2.type = 'sawtooth';
        osc2.frequency.value = 196.00; // G3

        // Giorgio Moroder style 16th note pattern
        const tempo = 120;
        const stepTime = 60 / tempo / 4; // 16th note in seconds
        const rootFreq = 130.81;
        const notes = [rootFreq, rootFreq * 1.2, rootFreq * 1.5, rootFreq * 1.8, rootFreq * 1.5, rootFreq * 1.2];
        
        let step = 0;
        const interval = setInterval(() => {
          if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
            const currentFreq = notes[step % notes.length];
            osc1.frequency.setValueAtTime(currentFreq, audioCtxRef.current.currentTime);
            osc2.frequency.setValueAtTime(currentFreq * 1.5, audioCtxRef.current.currentTime);
            step++;
          }
        }, stepTime * 1000);

        (ctx as any).patternInterval = interval;
      } else {
        // Cutoff simulation: complex rich soundscape with heavy harmonics
        osc1.type = 'sawtooth';
        osc1.frequency.value = 87.31; // F2
        
        osc2.type = 'square';
        osc2.frequency.value = 130.81; // C3

        // slow filter sweep
        const sweepOsc = ctx.createOscillator();
        sweepOsc.type = 'sine';
        sweepOsc.frequency.value = 0.25;
        const sweepGain = ctx.createGain();
        sweepGain.gain.value = 400;
        sweepOsc.connect(sweepGain);
        sweepGain.connect(osc2.frequency);
        sweepOsc.start();
      }

      osc1.connect(filterNode);
      osc2.connect(filterNode);
      filterNode.connect(masterGain);
      masterGain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      synthNodesRef.current = {
        osc1,
        osc2,
        gain: masterGain,
        noise: noiseSource,
        noiseGain: noiseGainNode,
        filter: filterNode
      };

      // Set initial filters according to current mode
      const currentMode = activeToggles[id];
      updateSynthFilters(id, currentMode);

    } catch (e) {
      console.error('Failed to initialize simulated Web Audio synth:', e);
    }
  };

  // Sound Engine: Stop synth nodes
  const stopSynthEngine = () => {
    if (audioCtxRef.current) {
      // Clear Moroder pattern interval if active
      if ((audioCtxRef.current as any).patternInterval) {
        clearInterval((audioCtxRef.current as any).patternInterval);
      }
      try {
        if (synthNodesRef.current) {
          synthNodesRef.current.osc1?.stop();
          synthNodesRef.current.osc2?.stop();
          if (synthNodesRef.current.noise && 'stop' in synthNodesRef.current.noise) {
            (synthNodesRef.current.noise as any).stop();
          }
        }
        audioCtxRef.current.close();
      } catch (e) {
        // already stopped
      }
      audioCtxRef.current = null;
      synthNodesRef.current = null;
    }
  };

  // Playback control
  const handlePlayPause = (id: string, synthType: 'podcast' | 'asmr' | 'giorgio' | 'cutoff') => {
    if (playingId === id) {
      setPlayingId(null);
      stopSynthEngine();
    } else {
      setPlayingId(id);
      startSynthEngine(id, synthType);
    }
  };

  // Live playhead animation loop
  useEffect(() => {
    if (playingId) {
      const startTime = Date.now();
      const initialProgress = playheadProgress[playingId];
      
      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const totalDuration = 15; // 15 seconds looping
        const nextProgress = (initialProgress + (elapsed / totalDuration)) % 1.0;
        
        setPlayheadProgress(prev => ({
          ...prev,
          [playingId]: nextProgress
        }));

        animationFrameId.current = requestAnimationFrame(animate);
      };
      
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [playingId]);

  // Clean up Web Audio Context on unmount
  useEffect(() => {
    return () => {
      stopSynthEngine();
    };
  }, []);

  return (
    <div id="restoration-showcase-section" className="mt-28 py-16 px-4 bg-[#030a16]/65 border-y border-slate-900 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        
        {/* Header Text */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-[11px] font-semibold text-cyan-400">
            <Waves className="w-3.5 h-3.5" />
            <span>HEAR THE DIFFERENCE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Improve audio quality <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">in one click</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Remove heavy compression artifacts, background noise, and muffled sounds from any recording, turning them back to studio-level clarity.
          </p>
        </div>

        {/* 2x2 Interactive Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {RESTORATION_EXAMPLES.map((example) => {
            const isOriginal = activeToggles[example.id] === 'original';
            const isPlaying = playingId === example.id;
            const progress = playheadProgress[example.id];

            // Render static bars or simulated playing peaks
            const waveformBars = Array.from({ length: 70 }).map((_, i) => {
              const fraction = i / 70;
              // Generate wavy bar heights
              let height = Math.abs(Math.sin(fraction * Math.PI * 4.5)) * 0.7 + 0.15;
              if (isOriginal) {
                // original is muffled and compressed, make waveform flatter
                height = height * 0.55 + 0.05;
              }
              const isPlayed = fraction <= progress;

              return (
                <div
                  key={i}
                  className={`w-[3px] rounded-full transition-all duration-300 ${
                    i >= 30 ? 'hidden sm:block' : ''
                  } ${
                    isPlayed && isPlaying
                      ? 'bg-[#06b6d4] shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                      : isOriginal
                        ? 'bg-slate-700/40'
                        : 'bg-cyan-500/20 group-hover:bg-cyan-500/35'
                  }`}
                  style={{ height: `${height * 100}%` }}
                />
              );
            });

            return (
              <div
                key={example.id}
                id={`restoration-card-${example.id}`}
                className="group bg-[#071325]/85 border border-sky-500/10 hover:border-sky-500/25 rounded-2.5xl overflow-hidden shadow-[0_0_40px_rgba(3,10,22,0.6)] hover:shadow-[0_0_50px_rgba(56,189,248,0.06)] transition-all duration-300"
              >
                {/* Spectrogram Container */}
                <div className="aspect-[16/9] w-full bg-slate-950 relative overflow-hidden border-b border-slate-900 flex items-center justify-center">
                  {/* Frequency Axis Overlay */}
                  <div className="absolute left-2.5 top-0 bottom-0 flex flex-col justify-between text-[9px] font-mono text-slate-500/80 pointer-events-none select-none z-10 py-4">
                    <span>20kHz</span>
                    <span>10kHz</span>
                    <span>5kHz</span>
                    <span>1kHz</span>
                    <span>100Hz</span>
                  </div>

                  <img
                    src={isOriginal ? example.originalSpectrogram : example.restoredSpectrogram}
                    alt={`${example.title} Spectrogram`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover select-none pointer-events-none opacity-90 hover:opacity-100 transition-opacity duration-300"
                  />

                  {/* Top metadata tags */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className="text-[9px] font-mono font-semibold text-slate-400 bg-slate-950/70 border border-slate-800/80 backdrop-blur-md px-2 py-0.5 rounded">
                      {isOriginal ? '44100 Hz : mono' : '44100 Hz : stereo'}
                    </span>
                    <span className="text-[9px] font-mono font-semibold text-slate-400 bg-slate-950/70 border border-slate-800/80 backdrop-blur-md px-2 py-0.5 rounded">
                      {isOriginal ? example.originalLufs : example.restoredLufs}
                    </span>
                  </div>

                  {/* Watermark label */}
                  <div className="absolute bottom-2.5 left-12 text-[8px] font-mono text-slate-600 tracking-wider uppercase select-none pointer-events-none">
                    CREATED BY LIBAVFILTER
                  </div>

                  {/* Spectrogram overlay banner indicating state */}
                  <div className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950/60 border border-slate-800/80 backdrop-blur-sm text-cyan-400">
                    {isOriginal ? 'Original Audio' : 'UdioSunova Analog restored'}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Waveform Player Section */}
                  <div className="flex items-center gap-4 bg-slate-950/50 border border-slate-900 p-3.5 rounded-2xl">
                    {/* Play/Pause Button */}
                    <button
                      id={`play-btn-${example.id}`}
                      onClick={() => handlePlayPause(example.id, example.synthType)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 scale-105'
                          : 'bg-slate-800 hover:bg-slate-700 text-white hover:scale-105 active:scale-95'
                      }`}
                      title={isPlaying ? 'Pause Demo' : 'Play Interactive Demo'}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 fill-white" />
                      ) : (
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      )}
                    </button>

                    {/* Soundwave bars */}
                    <div className="flex-1 h-12 flex items-center justify-between gap-[2px] relative group px-1">
                      {waveformBars}
                      
                      {/* Playhead line overlay when playing */}
                      {isPlaying && (
                        <div
                          className="absolute top-0 bottom-0 w-[1.5px] bg-white shadow-[0_0_10px_#fff] pointer-events-none transition-all duration-100"
                          style={{ left: `${progress * 100}%` }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Description and metadata */}
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{example.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{example.description}</p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-900/80" />

                  {/* Switch toggle original vs restored */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                      <Headphones className="w-3.5 h-3.5" />
                      <span>Compare dynamic audio</span>
                    </div>

                    {/* Toggle Switch */}
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold select-none cursor-pointer ${isOriginal ? 'text-amber-500' : 'text-slate-500 hover:text-slate-400'}`} onClick={() => isOriginal ? null : handleToggle(example.id)}>
                        {example.originalLabel}
                      </span>

                      {/* Custom Switch pill */}
                      <div
                        onClick={() => handleToggle(example.id)}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 cursor-pointer relative ${
                          isOriginal ? 'bg-amber-600/30 border border-amber-500/40' : 'bg-cyan-950/40 border border-cyan-400/40'
                        }`}
                      >
                        <div
                          className={`w-[18px] h-[18px] rounded-full transition-transform duration-300 shadow-md ${
                            isOriginal
                              ? 'translate-x-0 bg-amber-500'
                              : 'translate-x-5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]'
                          }`}
                        />
                      </div>

                      <span className={`text-xs font-semibold flex items-center gap-1 select-none cursor-pointer ${!isOriginal ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-400'}`} onClick={() => !isOriginal ? null : handleToggle(example.id)}>
                        {!isOriginal && <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />}
                        {example.restoredLabel}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Informational guide note */}
        <div className="max-w-3xl mx-auto bg-slate-950/40 border border-slate-900 rounded-2xl p-4 flex gap-3 text-xs text-left items-start">
          <Info className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white">How does it work?</span>
            <p className="text-slate-400 leading-relaxed">
              When you upload high-compression audio files (or import public tracks from AI platforms), our UdioSunova Analog Restorer reconstructs high-frequency bands above 8kHz that are typically destroyed by encoders. It removes artifact noise floor and maps stereo harmonics back to CD quality (320kbps MP3 or 24-bit PCM WAV formats).
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
