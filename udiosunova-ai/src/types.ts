/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Plan {
  FREE = 'FREE',
  PLUS = 'PLUS',
  PRO = 'PRO'
}

export enum AudioStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  FAILED = 'FAILED'
}

export enum AudioJobType {
  IMPORT = 'IMPORT',
  CONVERT = 'CONVERT',
  MASTER = 'MASTER',
  STEMS = 'STEMS',
  RESTORE = 'RESTORE',
  WAVEFORM = 'WAVEFORM'
}

export enum AudioJobStatus {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  FAILED = 'FAILED'
}

export enum Visibility {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC'
}

export interface User {
  id: string;
  email: string;
  name: string;
  image: string;
  plan: Plan;
  createdAt: string;
  updatedAt: string;
}

export interface AudioAsset {
  id: string;
  userId: string;
  title: string;
  artist: string;
  coverUrl: string;
  sourceUrl: string;
  sourcePlatform: string; // e.g. Suno, Udio, Manual Upload, YouTube, etc.
  duration: number; // in seconds
  originalFileUrl: string;
  mp3FileUrl: string;
  wavFileUrl: string;
  flacFileUrl: string;
  waveformJsonUrl: string; // URL or JSON string containing waveform peaks
  status: AudioStatus;
  visibility: Visibility;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
}

export interface AudioJob {
  id: string;
  audioAssetId: string;
  type: AudioJobType;
  status: AudioJobStatus;
  progress: number; // 0 to 100
  message: string;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DownloadLog {
  id: string;
  userId: string;
  audioAssetId: string;
  format: string; // 'mp3' | 'wav' | 'flac'
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface AbuseLog {
  id: string;
  userId: string;
  ipAddress: string;
  reason: string;
  sourceUrl: string;
  createdAt: string;
}

export interface ImportRequest {
  url: string;
}

export interface ImportResponse {
  audio_id: string;
  status: AudioStatus;
}

export interface JobStatusResponse {
  audio_id: string;
  status: AudioStatus;
  progress: number;
  message: string;
}
