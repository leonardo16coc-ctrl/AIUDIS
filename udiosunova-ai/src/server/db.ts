/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { 
  User, 
  AudioAsset, 
  AudioJob, 
  DownloadLog, 
  AbuseLog, 
  Plan, 
  AudioStatus, 
  AudioJobType, 
  AudioJobStatus, 
  Visibility 
} from '../types';

const DB_FILE_PATH = path.join(process.cwd(), 'soundnova_db.json');

interface DatabaseSchema {
  user: User;
  audioAssets: AudioAsset[];
  audioJobs: AudioJob[];
  downloadLogs: DownloadLog[];
  abuseLogs: AbuseLog[];
}

// Generate realistic waveform peaks (0 to 1)
function generatePeaks(count = 100): number[] {
  const peaks: number[] = [];
  for (let i = 0; i < count; i++) {
    // Generate a beautiful natural soundwave pattern
    const val = 0.15 + 0.6 * Math.sin((i / count) * Math.PI) * (0.6 + 0.4 * Math.random()) + 0.2 * Math.sin((i / 5) * Math.PI);
    peaks.push(Math.max(0.05, Math.min(0.95, val)));
  }
  return peaks;
}

const DEFAULT_USER: User = {
  id: 'usr_soundnova_default',
  email: 'udiosunovai@gmail.com',
  name: 'UdioSunova',
  image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  plan: Plan.FREE,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const SEED_TRACKS: AudioAsset[] = [
  {
    id: 'snd_seed_neon',
    userId: 'usr_soundnova_default',
    title: 'Neon Skyline',
    artist: 'Nova Eclipse',
    coverUrl: 'https://dimensions.fm/images/marketing-toolkit/04-streaming.png',
    sourceUrl: 'https://suno.com/song/neon-skyline-public-link',
    sourcePlatform: 'Suno AI',
    duration: 372, // 6:12
    originalFileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    mp3FileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    wavFileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    flacFileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    waveformJsonUrl: JSON.stringify(generatePeaks(120)),
    status: AudioStatus.COMPLETE,
    visibility: Visibility.PUBLIC,
    errorMessage: null,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    expiresAt: null,
  },
  {
    id: 'snd_seed_cyber',
    userId: 'usr_soundnova_default',
    title: 'Cybernetic Echoes',
    artist: 'Lumina Wave',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&h=400&q=80',
    sourceUrl: 'https://udio.com/songs/cybernetic-echoes-public',
    sourcePlatform: 'Udio AI',
    duration: 423, // 7:03
    originalFileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    mp3FileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    wavFileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    flacFileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    waveformJsonUrl: JSON.stringify(generatePeaks(120)),
    status: AudioStatus.COMPLETE,
    visibility: Visibility.PUBLIC,
    errorMessage: null,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    expiresAt: null,
  },
  {
    id: 'snd_seed_soul',
    userId: 'usr_soundnova_default',
    title: 'Synthesized Soul',
    artist: 'Aura Machine',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&h=400&q=80',
    sourceUrl: 'Manual Upload',
    sourcePlatform: 'Manual Upload',
    duration: 302, // 5:02
    originalFileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    mp3FileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    wavFileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    flacFileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    waveformJsonUrl: JSON.stringify(generatePeaks(120)),
    status: AudioStatus.COMPLETE,
    visibility: Visibility.PRIVATE,
    errorMessage: null,
    createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString(), // 30 mins ago
    updatedAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    expiresAt: null,
  }
];

class SoundNovaDB {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      user: DEFAULT_USER,
      audioAssets: SEED_TRACKS,
      audioJobs: [],
      downloadLogs: [],
      abuseLogs: [],
    };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Ensure standard seed data exists
        if (!this.data.audioAssets || this.data.audioAssets.length === 0) {
          this.data.audioAssets = SEED_TRACKS;
          this.save();
        }
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Error loading database, resetting', e);
      this.save();
    }
  }

  private save() {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database', e);
    }
  }

  // User methods
  getUser(): User {
    this.load();
    return this.data.user;
  }

  updateUserPlan(plan: Plan): User {
    this.load();
    this.data.user.plan = plan;
    this.data.user.updatedAt = new Date().toISOString();
    this.save();
    return this.data.user;
  }

  // AudioAsset methods
  getAssets(): AudioAsset[] {
    this.load();
    return this.data.audioAssets;
  }

  getAssetById(id: string): AudioAsset | undefined {
    this.load();
    return this.data.audioAssets.find(asset => asset.id === id);
  }

  createAsset(asset: AudioAsset): AudioAsset {
    this.load();
    this.data.audioAssets.unshift(asset); // Add to beginning
    this.save();
    return asset;
  }

  updateAsset(id: string, updates: Partial<AudioAsset>): AudioAsset | undefined {
    this.load();
    const index = this.data.audioAssets.findIndex(asset => asset.id === id);
    if (index !== -1) {
      this.data.audioAssets[index] = {
        ...this.data.audioAssets[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.save();
      return this.data.audioAssets[index];
    }
    return undefined;
  }

  deleteAsset(id: string): boolean {
    this.load();
    const initialLength = this.data.audioAssets.length;
    this.data.audioAssets = this.data.audioAssets.filter(asset => asset.id !== id);
    this.data.audioJobs = this.data.audioJobs.filter(job => job.audioAssetId !== id);
    this.data.downloadLogs = this.data.downloadLogs.filter(log => log.audioAssetId !== id);
    this.save();
    return this.data.audioAssets.length < initialLength;
  }

  // AudioJob methods
  getJobs(): AudioJob[] {
    this.load();
    return this.data.audioJobs;
  }

  getJobById(id: string): AudioJob | undefined {
    this.load();
    return this.data.audioJobs.find(job => job.id === id);
  }

  getJobsByAssetId(assetId: string): AudioJob[] {
    this.load();
    return this.data.audioJobs.filter(job => job.audioAssetId === assetId);
  }

  createJob(job: AudioJob): AudioJob {
    this.load();
    this.data.audioJobs.push(job);
    this.save();
    return job;
  }

  updateJob(id: string, updates: Partial<AudioJob>): AudioJob | undefined {
    this.load();
    const index = this.data.audioJobs.findIndex(job => job.id === id);
    if (index !== -1) {
      this.data.audioJobs[index] = {
        ...this.data.audioJobs[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.save();
      return this.data.audioJobs[index];
    }
    return undefined;
  }

  // DownloadLog methods
  getDownloadLogs(): DownloadLog[] {
    this.load();
    return this.data.downloadLogs;
  }

  createDownloadLog(log: DownloadLog): DownloadLog {
    this.load();
    this.data.downloadLogs.push(log);
    this.save();
    return log;
  }

  // AbuseLog methods
  getAbuseLogs(): AbuseLog[] {
    this.load();
    return this.data.abuseLogs;
  }

  createAbuseLog(log: AbuseLog): AbuseLog {
    this.load();
    this.data.abuseLogs.push(log);
    this.save();
    return log;
  }

  // Helper to generate custom waveforms on the fly
  generatePeaksForAsset(count = 120): string {
    return JSON.stringify(generatePeaks(count));
  }
}

export const db = new SoundNovaDB();
