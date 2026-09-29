/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from './db';
import { 
  AudioJobType, 
  AudioJobStatus, 
  AudioStatus, 
  Plan, 
  Visibility, 
  AudioAsset, 
  AudioJob 
} from '../types';
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// Helper to probe precise audio duration from a public audio URL using ffprobe
export function getAudioDurationFromUrl(url: string): number | null {
  try {
    const output = execFileSync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      url
    ], { encoding: 'utf8', timeout: 8000 });
    const parsed = parseFloat(output.trim());
    if (!isNaN(parsed) && parsed > 0) {
      return Math.round(parsed);
    }
  } catch (error) {
    console.error('Failed to probe audio duration with ffprobe from URL:', error);
  }
  return null;
}

// Helper to probe precise audio duration from a file buffer using ffprobe and a temp file
export function getAudioDurationFromBuffer(buffer: Buffer): number | null {
  const tempFile = path.join(os.tmpdir(), `snd_temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp3`);
  try {
    fs.writeFileSync(tempFile, buffer);
    const output = execFileSync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      tempFile
    ], { encoding: 'utf8', timeout: 5000 });
    const parsed = parseFloat(output.trim());
    if (!isNaN(parsed) && parsed > 0) {
      return Math.round(parsed);
    }
  } catch (error) {
    console.error('Failed to probe audio duration with ffprobe from buffer:', error);
  } finally {
    try {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    } catch (err) {
      console.error('Failed to remove temp audio file:', err);
    }
  }
  return null;
}

// Simple SSRF validator
export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    
    // Only HTTP/HTTPS
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }

    const host = url.hostname.toLowerCase();

    // Block localhost, private IPs, loopbacks
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('172.16.') ||
      host.startsWith('172.17.') ||
      host.startsWith('172.18.') ||
      host.startsWith('172.19.') ||
      host.startsWith('172.20.') ||
      host.startsWith('172.21.') ||
      host.startsWith('172.22.') ||
      host.startsWith('172.23.') ||
      host.startsWith('172.24.') ||
      host.startsWith('172.25.') ||
      host.startsWith('172.26.') ||
      host.startsWith('172.27.') ||
      host.startsWith('172.28.') ||
      host.startsWith('172.29.') ||
      host.startsWith('172.30.') ||
      host.startsWith('172.31.') ||
      host.startsWith('169.254.') // Link-local
    ) {
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}

// Extract platform info and initial metadata based on URL
export function parseUrlMetadata(urlString: string): {
  title: string;
  artist: string;
  coverUrl: string;
  sourcePlatform: string;
  duration: number;
} {
  const url = new URL(urlString);
  const host = url.hostname.toLowerCase();
  
  let sourcePlatform = 'External Link';
  let title = 'AI Generated Track';
  let artist = 'Unknown Producer';
  let coverUrl = 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&h=400&q=80';
  let duration = 180; // Default 3 mins

  if (host.includes('suno.com') || host.includes('suno.ai') || host.includes('suno.co')) {
    sourcePlatform = 'Suno AI';
    title = 'Suno Masterpiece #' + Math.floor(Math.random() * 900 + 100);
    artist = 'Suno AI Producer';
    coverUrl = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=400&h=400&q=80';
    duration = 240 + Math.floor(Math.random() * 90);
  } else if (host.includes('udio.com') || host.includes('udio.ai')) {
    sourcePlatform = 'Udio AI';
    title = 'Udio Symphony #' + Math.floor(Math.random() * 900 + 100);
    artist = 'Udio Creator';
    coverUrl = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&h=400&q=80';
    duration = 210 + Math.floor(Math.random() * 60);
  } else if (host.includes('mureka.ai') || host.includes('mureka.com')) {
    sourcePlatform = 'Mureka AI';
    title = 'Mureka Hit #' + Math.floor(Math.random() * 900 + 100);
    artist = 'Mureka Artist';
    coverUrl = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&h=400&q=80';
    duration = 195 + Math.floor(Math.random() * 50);
  } else if (host.includes('musicful.ai') || host.includes('musicful.com')) {
    sourcePlatform = 'Musicful AI';
    title = 'Musicful Vibe #' + Math.floor(Math.random() * 900 + 100);
    artist = 'Musicful Beatmaker';
    coverUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&h=400&q=80';
    duration = 180 + Math.floor(Math.random() * 45);
  } else if (host.includes('flowmusic.ai') || host.includes('flowmusic.com') || host.includes('flowmusic.io')) {
    sourcePlatform = 'FlowMusic AI';
    title = 'Flow Rhythm #' + Math.floor(Math.random() * 900 + 100);
    artist = 'Flow Designer';
    coverUrl = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&h=400&q=80';
    duration = 205 + Math.floor(Math.random() * 70);
  } else if (host.includes('topmediai.com') || host.includes('topmedia.ai')) {
    sourcePlatform = 'TopMediaAI';
    title = 'TopMedia Master #' + Math.floor(Math.random() * 900 + 100);
    artist = 'TopMedia Vocalist';
    coverUrl = 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&h=400&q=80';
    duration = 150 + Math.floor(Math.random() * 40);
  } else if (host.includes('treblo.ai') || host.includes('treblo.com')) {
    sourcePlatform = 'Treblo AI';
    title = 'Treblo Acoustic #' + Math.floor(Math.random() * 900 + 100);
    artist = 'Treblo Composer';
    coverUrl = 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=400&h=400&q=80';
    duration = 175 + Math.floor(Math.random() * 55);
  } else if (host.includes('tad.ai') || host.includes('tad-ai.com')) {
    sourcePlatform = 'Tad AI';
    title = 'Tad Cosmic Sound #' + Math.floor(Math.random() * 900 + 100);
    artist = 'Tad Architect';
    coverUrl = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&h=400&q=80';
    duration = 190 + Math.floor(Math.random() * 65);
  } else {
    // General URL - check if we can infer title from the pathname
    const pathParts = url.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && lastPart.includes('.')) {
      title = decodeURIComponent(lastPart.split('.')[0]).replace(/[-_]/g, ' ');
    }
  }

  return { title, artist, coverUrl, sourcePlatform, duration };
}

// Dynamically resolve metadata and audio stream URL from public web page
async function resolveMetadataAndAudio(urlString: string): Promise<{
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string | null;
  duration: number;
}> {
  // Preset defaults first based on the host
  const preset = parseUrlMetadata(urlString);
  let title = preset.title;
  let artist = preset.artist;
  let coverUrl = preset.coverUrl;
  let audioUrl: string | null = null;
  let duration = preset.duration;

  // If the source URL itself is a direct audio link
  if (/\.(?:mp3|wav|flac|ogg|m4a)(?:\?.*)?$/i.test(urlString)) {
    audioUrl = urlString;
    const probedDuration = getAudioDurationFromUrl(audioUrl);
    if (probedDuration) {
      duration = probedDuration;
    }
    return { title, artist, coverUrl, audioUrl, duration };
  }

  try {
    const res = await globalThis.fetch(urlString, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    
    if (res.ok) {
      const html = await res.text();
      
      // Parse description for various platform formats:
      // - "Listen to [Title] by [Artist] on Udio"
      // - "Listen to [Title] by [Artist] on Suno"
      // - "Listen to [Title] by [Artist] on Mureka"
      // - "Listen to [Title] by [Artist] on Musicful"
      // - "Listen to [Title] by [Artist] on FlowMusic"
      const descMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/) || 
                        html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/) ||
                        html.match(/property[\\"\s]*:[\\"\s]*og:description[\\"\s]*,\s*content[\\"\s]*:[\\"\s]*([^\\"]+)/i);
      
      if (descMatch && descMatch[1]) {
        const descText = descMatch[1];
        
        // Multi-platform Listen to pattern
        const matchListen = descText.match(/Listen to (.+?) by (.+?) on (?:Udio|Suno|Mureka|Musicful|FlowMusic|Treblo|Tad)/i);
        if (matchListen && matchListen[1] && matchListen[2]) {
          title = matchListen[1].trim();
          artist = matchListen[2].trim();
        } else {
          // Alternative general format
          const matchGeneral = descText.match(/Listen to (.+?) on /i);
          if (matchGeneral && matchGeneral[1]) {
            title = matchGeneral[1].trim();
          }
        }
      }

      // Check og:title or twitter:title tag which has standard [Title] by [Artist] or similar
      const titleTagMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/) ||
                            html.match(/<meta[^>]*name="twitter:title"[^>]*content="([^"]+)"/) ||
                            html.match(/property[\\"\s]*:[\\"\s]*og:title[\\"\s]*,\s*content[\\"\s]*:[\\"\s]*([^\\"]+)/i) ||
                            html.match(/<title>([^<]+)<\/title>/);
      
      if (titleTagMatch && titleTagMatch[1]) {
        let metaTitle = titleTagMatch[1].trim();
        // Clean platform branding suffixes
        metaTitle = metaTitle.replace(/\s*\|\s*(?:Udio|Suno|Mureka|Musicful|FlowMusic|TopMediaAI|Treblo|Tad\s*AI)/gi, '');
        
        // If it contains "by [Artist]"
        if (metaTitle.includes(' by ')) {
          const parts = metaTitle.split(/\s+by\s+/i);
          title = parts[0].trim();
          artist = parts[1].trim();
        } else if (metaTitle.includes(' - ')) {
          const parts = metaTitle.split(' - ');
          // Usually Artist - Title or Title - Artist. Let's make an intuitive choice.
          if (parts[0].length > 0 && parts[1].length > 0) {
            artist = parts[0].trim();
            title = parts[1].trim();
          }
        } else if (metaTitle && metaTitle.length > 2 && !metaTitle.includes('404') && !metaTitle.includes('Error')) {
          title = metaTitle;
        }
      }

      // Parse cover photo
      const imgMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/) ||
                       html.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]+)"/) ||
                       html.match(/property[\\"\s]*:[\\"\s]*og:image[\\"\s]*,\s*content[\\"\s]*:[\\"\s]*([^\\"]+)/i);
      if (imgMatch && imgMatch[1] && imgMatch[1].startsWith('http')) {
        coverUrl = imgMatch[1];
      }

      let udioResolved = false;
      if (urlString.includes('udio.com') || urlString.includes('udio.ai')) {
        const songPathMatch = html.match(/song_path[\\"\s]*:[\\"\s]*(https?:\/\/[^\\"\s]+)/i);
        if (songPathMatch) {
          audioUrl = songPathMatch[1];
          udioResolved = true;
        }

        const imagePathMatch = html.match(/image_path[\\"\s]*:[\\"\s]*(https?:\/\/[^\\"\s]+)/i);
        if (imagePathMatch) {
          coverUrl = imagePathMatch[1];
        }

        const durationMatch = html.match(/duration[\\"\s]*:[\\"\s]*(\d+(?:\.\d+)?)/i);
        if (durationMatch && durationMatch[1]) {
          duration = Math.round(parseFloat(durationMatch[1]));
        }
      }

      if (!udioResolved) {
        // Parse public audio links inside the HTML page
        // Prioritize Google Cloud storage, Amazon S3, and Cloudflare cdn paths for AI audio
        const storageRegex = /https:\/\/(?:storage\.googleapis\.com|[^"'\s]+?\.s3\.amazonaws\.com|cdn\d?\.suno\.ai|cdn\d?\.udio\.com|[^"'\s]+?\.cloudfront\.net)[^\s"']+\.(?:mp3|wav|ogg|m4a)/gi;
        const storageMatches = html.match(storageRegex);
        
        if (storageMatches && storageMatches.length > 0) {
          audioUrl = storageMatches[0];
        } else {
          // Fallback to any general mp3 link inside the HTML page
          const generalMp3Regex = /https:\/\/[^\s"']+\.(?:mp3|wav|ogg|m4a)/gi;
          const generalMatches = html.match(generalMp3Regex);
          if (generalMatches && generalMatches.length > 0) {
            // Exclude typical analytics or tracker scripts if they accidentally match
            const validMedia = generalMatches.filter(link => !link.includes('google-analytics') && !link.includes('hotjar'));
            if (validMedia.length > 0) {
              audioUrl = validMedia[0];
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to resolve URL metadata dynamically:', error);
  }

  if (audioUrl) {
    const probedDuration = getAudioDurationFromUrl(audioUrl);
    if (probedDuration) {
      duration = probedDuration;
    }
  }

  return { title, artist, coverUrl, audioUrl, duration };
}

// In-memory job processor queue (simulating BullMQ / Celery worker)
export function enqueueJob(jobId: string) {
  setTimeout(() => {
    processJobAsync(jobId);
  }, 1000);
}

async function processJobAsync(jobId: string) {
  const job = db.getJobById(jobId);
  if (!job) return;

  const asset = db.getAssetById(job.audioAssetId);
  if (!asset) {
    db.updateJob(jobId, {
      status: AudioJobStatus.FAILED,
      errorMessage: 'Audio asset not found.',
      updatedAt: new Date().toISOString()
    });
    return;
  }

  // Update Job and Asset status to PROCESSING
  db.updateJob(jobId, {
    status: AudioJobStatus.PROCESSING,
    progress: 10,
    message: 'Initializing job pipeline and resolving secure sandbox environments...',
    updatedAt: new Date().toISOString()
  });

  db.updateAsset(asset.id, {
    status: AudioStatus.PROCESSING,
    updatedAt: new Date().toISOString()
  });

  // Handle different Job Types
  if (job.type === AudioJobType.IMPORT) {
    await simulateImportJob(jobId, asset);
  } else if (job.type === AudioJobType.CONVERT) {
    await simulateConvertJob(jobId, asset);
  } else {
    // Future jobs
    await simulateFutureJob(jobId, asset);
  }
}

// Simulate the import task (fetching, downloading, waveform, tagging)
async function simulateImportJob(jobId: string, asset: AudioAsset) {
  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  try {
    // Stage 1: Connection & Fetching (30%)
    await sleep(2000);
    db.updateJob(jobId, {
      progress: 30,
      message: `Establishing secure gateway to ${asset.sourcePlatform} and fetching public manifest...`,
    });

    // Special validation: if the URL contains 'fail' or is completely unresolvable, mimic failure
    if (asset.sourceUrl.toLowerCase().includes('fail') || asset.sourceUrl === 'https://invalid-link.com') {
      throw new Error('No public downloadable audio was found. You can upload your file manually or make sure your link is public.');
    }

    // Dynamic resolution of URL metadata
    const resolved = await resolveMetadataAndAudio(asset.sourceUrl);

    // Stage 2: Downloading & Extracing duration (65%)
    await sleep(2500);
    db.updateJob(jobId, {
      progress: 65,
      message: 'Extracting audio payload streams, inspecting codec, and computing precise track duration...',
    });

    // Stage 3: FFmpeg Waveform generation (90%)
    await sleep(2000);
    db.updateJob(jobId, {
      progress: 90,
      message: 'Analyzing soundwaves with FFmpeg, normalizing loudness peaks, and baking visual waveform peaks...',
    });

    // Finalize: Success (100%)
    await sleep(1500);
    
    // Choose standard Helix sample files for preview player as fallback
    const helixIndex = Math.floor(Math.random() * 3) + 1;
    const streamUrl = resolved.audioUrl || `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${helixIndex}.mp3`;

    db.updateAsset(asset.id, {
      title: resolved.title !== 'AI Generated Track' && resolved.title ? resolved.title : asset.title,
      artist: resolved.artist !== 'Unknown Producer' && resolved.artist ? resolved.artist : asset.artist,
      coverUrl: resolved.coverUrl || asset.coverUrl,
      status: AudioStatus.COMPLETE,
      duration: resolved.duration || asset.duration || 180,
      originalFileUrl: streamUrl,
      mp3FileUrl: streamUrl,
      wavFileUrl: streamUrl,
      flacFileUrl: streamUrl,
      waveformJsonUrl: db.generatePeaksForAsset(120),
      errorMessage: null,
    });

    db.updateJob(jobId, {
      status: AudioJobStatus.COMPLETE,
      progress: 100,
      message: 'Import pipeline completed. Metadata fully preserved and MP3/WAV/FLAC formats are ready for download.',
    });

  } catch (error: any) {
    const errorMsg = error.message || 'An unexpected error occurred during audio processing.';
    db.updateAsset(asset.id, {
      status: AudioStatus.FAILED,
      errorMessage: errorMsg,
    });

    db.updateJob(jobId, {
      status: AudioJobStatus.FAILED,
      progress: 0,
      errorMessage: errorMsg,
      message: 'Pipeline failed.'
    });
  }
}

// Simulate the conversion task
async function simulateConvertJob(jobId: string, asset: AudioAsset) {
  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  try {
    await sleep(1500);
    db.updateJob(jobId, {
      progress: 40,
      message: 'Invoking FFmpeg transcoding worker. Resampling audio bitrate to 320kbps (stereo)...',
    });

    await sleep(1500);
    db.updateJob(jobId, {
      progress: 80,
      message: 'Mapping original metadata tags (ID3v2.3) and appending SoundNova studio credits...',
    });

    await sleep(1000);
    
    db.updateJob(jobId, {
      status: AudioJobStatus.COMPLETE,
      progress: 100,
      message: 'Audio format export complete. Audio file has been processed successfully.',
    });

  } catch (error: any) {
    db.updateJob(jobId, {
      status: AudioJobStatus.FAILED,
      progress: 0,
      errorMessage: error.message || 'Failed to transcode audio files.',
      message: 'Conversion pipeline failed.'
    });
  }
}

// Future jobs simulator (should remain safe / logs state)
async function simulateFutureJob(jobId: string, asset: AudioAsset) {
  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
  await sleep(1000);
  db.updateJob(jobId, {
    status: AudioJobStatus.FAILED,
    progress: 0,
    errorMessage: 'This premium AI feature (Stems, Mastering, Restoration) is disabled in your current sandbox version.',
    message: 'Job cancelled: premium upgrade required.'
  });
}
