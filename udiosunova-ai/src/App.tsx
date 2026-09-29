/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Upload, 
  Download, 
  Search, 
  Library, 
  Settings, 
  HelpCircle, 
  Clock, 
  FolderSync, 
  Trash2, 
  ArrowRight, 
  Check, 
  Info, 
  Play, 
  Pause, 
  ChevronRight, 
  ShieldAlert, 
  ChevronDown, 
  User as UserIcon,
  Globe,
  Lock,
  Loader2,
  Edit2,
  FileText,
  Sliders,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  LogOut,
  Music,
  Disc,
  Cpu,
  Volume2,
  Waves,
  Menu,
  X,
  Ticket
} from 'lucide-react';

import { 
  Plan, 
  AudioStatus, 
  Visibility, 
  AudioAsset, 
  User 
} from './types';
import WaveformPlayer from './components/WaveformPlayer';
import MetadataPanel from './components/MetadataPanel';
import LegalViews from './components/LegalViews';
import UdioSunovaLogo, { VinylIcon } from './components/UdioSunovaLogo';
import AuthForm from './components/AuthForm';
import { auth as firebaseAuth, db as firestoreDb } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import AudioRestorationShowcase from './components/AudioRestorationShowcase';
import ShowcaseSections from './components/ShowcaseSections';
import AudioToolsListView from './components/AudioToolsListView';
import UdioDownloaderView from './components/UdioDownloaderView';

const COMMUNITY_TRACKS = [
  {
    id: 'comm-1',
    title: 'U Plavom Podrumu',
    artist: 'Fsvucic@gmail.comAquaHa',
    cover: 'https://imagedelivery.net/C9yUr1FL21Q6JwfYYh2ozQ/a226557d-e8c0-40bb-8454-ccb1b7115b00/public',
    source: 'Example AI Track',
    noMasterLufs: '-15.1 LUFS',
    masteredLufs: '-8.2 LUFS',
    originalHeights: [0.15, 0.35, 0.45, 0.2, 0.55, 0.65, 0.35, 0.4, 0.5, 0.25, 0.3, 0.6, 0.7, 0.5, 0.35, 0.45, 0.55, 0.3, 0.15, 0.45, 0.65, 0.5, 0.35, 0.4, 0.55, 0.3, 0.2, 0.45, 0.6, 0.4, 0.35, 0.5, 0.4, 0.25, 0.3, 0.45, 0.5, 0.3, 0.2, 0.1],
    masteredHeights: [0.35, 0.65, 0.75, 0.45, 0.85, 0.9, 0.7, 0.75, 0.85, 0.55, 0.6, 0.88, 0.95, 0.8, 0.65, 0.78, 0.88, 0.6, 0.45, 0.78, 0.92, 0.8, 0.65, 0.75, 0.88, 0.62, 0.48, 0.78, 0.9, 0.75, 0.68, 0.82, 0.75, 0.55, 0.6, 0.78, 0.85, 0.62, 0.45, 0.3],
    isBlueBorder: true,
    isBlueTitle: true
  },
  {
    id: 'comm-2',
    title: 'As It Is',
    artist: 'RoughKora7500',
    cover: 'https://imagedelivery.net/C9yUr1FL21Q6JwfYYh2ozQ/e69f2c51-eb21-4a9c-0b64-5fccccbc3b00/public',
    source: 'Example AI Track',
    noMasterLufs: '-14.2 LUFS',
    masteredLufs: '-8.5 LUFS',
    originalHeights: [0.3, 0.45, 0.2, 0.5, 0.6, 0.4, 0.25, 0.55, 0.7, 0.4, 0.35, 0.5, 0.65, 0.4, 0.3, 0.45, 0.5, 0.2, 0.35, 0.6, 0.75, 0.5, 0.35, 0.4, 0.55, 0.3, 0.2, 0.45, 0.6, 0.4, 0.35, 0.5, 0.4, 0.25, 0.3, 0.45, 0.5, 0.3, 0.2, 0.15],
    masteredHeights: [0.5, 0.75, 0.45, 0.8, 0.85, 0.75, 0.55, 0.82, 0.9, 0.75, 0.65, 0.8, 0.9, 0.75, 0.6, 0.78, 0.82, 0.5, 0.65, 0.85, 0.95, 0.82, 0.68, 0.75, 0.88, 0.62, 0.48, 0.78, 0.9, 0.75, 0.68, 0.82, 0.75, 0.55, 0.6, 0.78, 0.85, 0.62, 0.45, 0.3],
    isBlueBorder: true,
    isBlueTitle: true
  },
  {
    id: 'comm-3',
    title: 'Too Gorgeous',
    artist: 'WhiteAllegroTaiko689265',
    cover: 'https://imagedelivery.net/C9yUr1FL21Q6JwfYYh2ozQ/4fc68034-361b-42e3-0f8b-0c123db68400/public',
    source: 'Example AI Track',
    noMasterLufs: '-13.8 LUFS',
    masteredLufs: '-7.9 LUFS',
    originalHeights: [0.2, 0.3, 0.5, 0.4, 0.3, 0.5, 0.6, 0.4, 0.3, 0.55, 0.75, 0.4, 0.3, 0.5, 0.6, 0.35, 0.2, 0.45, 0.5, 0.3, 0.25, 0.45, 0.65, 0.5, 0.4, 0.3, 0.5, 0.6, 0.4, 0.3, 0.45, 0.5, 0.3, 0.2, 0.35, 0.5, 0.4, 0.3, 0.2, 0.1],
    masteredHeights: [0.45, 0.6, 0.85, 0.75, 0.65, 0.82, 0.9, 0.75, 0.65, 0.85, 0.95, 0.75, 0.65, 0.8, 0.9, 0.7, 0.5, 0.78, 0.82, 0.6, 0.55, 0.78, 0.92, 0.8, 0.7, 0.6, 0.82, 0.9, 0.75, 0.65, 0.78, 0.82, 0.65, 0.5, 0.65, 0.82, 0.75, 0.6, 0.45, 0.3],
    hasBluePlayButton: true
  },
  {
    id: 'comm-4',
    title: 'Gorgeous Daydreams',
    artist: 'WhiteAllegroTaiko689265',
    cover: 'https://imagedelivery.net/C9yUr1FL21Q6JwfYYh2ozQ/d7ae2f96-988e-4543-b666-4fcde140e400/public',
    source: 'Example AI Track',
    noMasterLufs: '-16.1 LUFS',
    masteredLufs: '-8.9 LUFS',
    originalHeights: [0.25, 0.35, 0.55, 0.45, 0.35, 0.4, 0.5, 0.3, 0.2, 0.4, 0.6, 0.5, 0.4, 0.3, 0.45, 0.5, 0.3, 0.2, 0.35, 0.55, 0.65, 0.45, 0.3, 0.4, 0.5, 0.3, 0.2, 0.4, 0.55, 0.4, 0.3, 0.45, 0.35, 0.25, 0.3, 0.4, 0.45, 0.3, 0.2, 0.1],
    masteredHeights: [0.5, 0.65, 0.88, 0.8, 0.7, 0.75, 0.85, 0.65, 0.5, 0.75, 0.92, 0.82, 0.75, 0.65, 0.78, 0.82, 0.6, 0.5, 0.68, 0.88, 0.95, 0.78, 0.65, 0.75, 0.85, 0.6, 0.5, 0.75, 0.88, 0.75, 0.65, 0.78, 0.7, 0.55, 0.6, 0.75, 0.8, 0.6, 0.45, 0.3]
  },
  {
    id: 'comm-5',
    title: 'Устал, хочу любви ext v1',
    artist: 'CopperClassicalWhip551898',
    cover: 'https://imagedelivery.net/C9yUr1FL21Q6JwfYYh2ozQ/145c9a19-b408-478b-27d1-781820c9c800/public',
    source: 'Example AI Track',
    noMasterLufs: '-12.9 LUFS',
    masteredLufs: '-7.4 LUFS',
    originalHeights: [0.35, 0.5, 0.3, 0.4, 0.5, 0.6, 0.4, 0.35, 0.45, 0.5, 0.65, 0.4, 0.3, 0.45, 0.55, 0.4, 0.3, 0.35, 0.5, 0.65, 0.7, 0.5, 0.35, 0.4, 0.5, 0.3, 0.25, 0.4, 0.5, 0.4, 0.35, 0.45, 0.4, 0.3, 0.35, 0.45, 0.5, 0.35, 0.2, 0.15],
    masteredHeights: [0.6, 0.8, 0.55, 0.7, 0.8, 0.9, 0.75, 0.68, 0.78, 0.82, 0.95, 0.75, 0.65, 0.78, 0.88, 0.7, 0.6, 0.65, 0.8, 0.92, 0.98, 0.82, 0.68, 0.75, 0.85, 0.6, 0.55, 0.75, 0.85, 0.75, 0.68, 0.78, 0.75, 0.6, 0.65, 0.78, 0.82, 0.65, 0.45, 0.35]
  },
  {
    id: 'comm-6',
    title: '花开的时节',
    artist: 'boom260046',
    cover: 'https://imagedelivery.net/C9yUr1FL21Q6JwfYYh2ozQ/b7432a60-8629-4f19-6d2e-c2bbc3370400/public',
    source: 'Example AI Track',
    noMasterLufs: '-14.7 LUFS',
    masteredLufs: '-8.1 LUFS',
    originalHeights: [0.2, 0.35, 0.25, 0.45, 0.55, 0.45, 0.3, 0.4, 0.5, 0.35, 0.25, 0.45, 0.6, 0.45, 0.3, 0.4, 0.5, 0.3, 0.2, 0.45, 0.6, 0.45, 0.3, 0.35, 0.45, 0.3, 0.2, 0.4, 0.5, 0.4, 0.3, 0.4, 0.35, 0.2, 0.25, 0.35, 0.4, 0.3, 0.2, 0.1],
    masteredHeights: [0.45, 0.65, 0.5, 0.75, 0.85, 0.75, 0.6, 0.7, 0.8, 0.65, 0.5, 0.75, 0.9, 0.75, 0.6, 0.7, 0.8, 0.6, 0.45, 0.75, 0.9, 0.75, 0.6, 0.65, 0.75, 0.55, 0.45, 0.7, 0.8, 0.7, 0.6, 0.7, 0.65, 0.45, 0.5, 0.65, 0.7, 0.55, 0.4, 0.25]
  }
];

export default function App() {
  // SPA Routing States
  const [activeView, setActiveView] = useState<'landing' | 'dashboard' | 'studio' | 'legal' | 'auth' | 'tools'>('landing');
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [activeLegalSection, setActiveLegalSection] = useState<'terms' | 'privacy' | 'copyright' | 'acceptable-use' | 'refund' | 'cancellation' | 'contact'>('terms');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // UdioSunova Analog AI Tools State Variables
  const [selectedToolId, setSelectedToolId] = useState<'restorer' | 'stems' | 'mastering' | 'spatial' | 'converter' | 'udio-downloader' | 'suno-downloader' | null>(null);
  const [toolTrackId, setToolTrackId] = useState<string>('');
  const [isToolProcessing, setIsToolProcessing] = useState(false);
  const [toolProgress, setToolProgress] = useState(0);
  const [toolLogs, setToolLogs] = useState<string[]>([]);
  const [toolProcessed, setToolProcessed] = useState(false);
  const [isBypassed, setIsBypassed] = useState(false); // false = Processed, true = Original

  // Tool-specific parameters
  const [enhancerLevel, setEnhancerLevel] = useState(75);
  const [harmonicWarmth, setHarmonicWarmth] = useState(60);
  const [decompressionDepth, setDecompressionDepth] = useState(50);

  const [vocalLevel, setVocalLevel] = useState(100);
  const [drumLevel, setDrumLevel] = useState(100);
  const [bassLevel, setBassLevel] = useState(100);
  const [melodyLevel, setMelodyLevel] = useState(100);

  const [tapeSaturation, setTapeSaturation] = useState(45);
  const [stereoWidth, setStereoWidth] = useState(120);
  const [loudnessThreshold, setLoudnessThreshold] = useState(-14);

  const [spatialSize, setSpatialSize] = useState(60);
  const [headResonance, setHeadResonance] = useState(40);
  const [ambienceLevel, setAmbienceLevel] = useState(30);

  const [convSourceFormat, setConvSourceFormat] = useState('MP3');
  const [convTargetFormat, setConvTargetFormat] = useState('WAV');
  const [convQuality, setConvQuality] = useState('Lossless 24-bit/48kHz');

  // App States
  const [user, setUser] = useState<User | null>(null);
  const [library, setLibrary] = useState<AudioAsset[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'processing' | 'failed' | 'uploaded'>('all');

  // Import track URL states
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importJobStatus, setImportJobStatus] = useState<{
    audio_id: string;
    progress: number;
    message: string;
    status: AudioStatus;
  } | null>(null);

  // Manual File Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Studio Edit states (renaming track titles and artists)
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editVisibility, setEditVisibility] = useState<Visibility>(Visibility.PUBLIC);

  // Download Abuse States
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloadingId, setIsDownloadingId] = useState<string | null>(null);

  // Stripe & Pricing States
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'signup'>('login');
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const [mockupTrack, setMockupTrack] = useState({
    title: 'Nebula Dreams',
    artist: 'Produced by Lumina Wave AI',
    cover: 'https://imagedelivery.net/C9yUr1FL21Q6JwfYYh2ozQ/e69f2c51-eb21-4a9c-0b64-5fccccbc3b00/public',
    source: 'Example AI Track',
    noMasterLufs: '-14.2 LUFS',
    masteredLufs: '-8.5 LUFS',
    originalHeights: [0.3, 0.45, 0.2, 0.5, 0.6, 0.4, 0.25, 0.55, 0.7, 0.4, 0.35, 0.5, 0.65, 0.4, 0.3, 0.45, 0.5, 0.2, 0.35, 0.6, 0.75, 0.5, 0.35, 0.4, 0.55, 0.3, 0.2, 0.45, 0.6, 0.4, 0.35, 0.5, 0.4, 0.25, 0.3, 0.45, 0.5, 0.3, 0.2, 0.15],
    masteredHeights: [0.5, 0.75, 0.45, 0.8, 0.85, 0.75, 0.55, 0.82, 0.9, 0.75, 0.65, 0.8, 0.9, 0.75, 0.6, 0.78, 0.82, 0.5, 0.65, 0.85, 0.95, 0.82, 0.68, 0.75, 0.88, 0.62, 0.48, 0.78, 0.9, 0.75, 0.68, 0.82, 0.75, 0.55, 0.6, 0.78, 0.85, 0.62, 0.45, 0.3]
  });

  // 1. Firebase seeding and sync helper functions
  const seedUserLibraryInFirestore = async (uid: string) => {
    try {
      const seedTracks: AudioAsset[] = [
        {
          id: 'snd_seed_neon_' + uid.substring(0, 5),
          userId: uid,
          title: 'Neon Skyline',
          artist: 'Nova Eclipse',
          coverUrl: 'https://dimensions.fm/images/marketing-toolkit/04-streaming.png',
          sourceUrl: 'https://suno.com/song/neon-skyline-public-link',
          sourcePlatform: 'Suno AI',
          duration: 372,
          originalFileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          mp3FileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          wavFileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          flacFileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          waveformJsonUrl: JSON.stringify(Array.from({ length: 120 }, (_, i) => 0.15 + 0.6 * Math.sin((i / 120) * Math.PI) * (0.6 + 0.4 * Math.random()) + 0.2 * Math.sin((i / 5) * Math.PI))),
          status: AudioStatus.COMPLETE,
          visibility: Visibility.PUBLIC,
          errorMessage: null,
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          expiresAt: null
        },
        {
          id: 'snd_seed_cyber_' + uid.substring(0, 5),
          userId: uid,
          title: 'Cybernetic Echoes',
          artist: 'Lumina Wave',
          coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&h=400&q=80',
          sourceUrl: 'https://udio.com/songs/cybernetic-echoes-public',
          sourcePlatform: 'Udio AI',
          duration: 423,
          originalFileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
          mp3FileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
          wavFileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
          flacFileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
          waveformJsonUrl: JSON.stringify(Array.from({ length: 120 }, (_, i) => 0.15 + 0.6 * Math.sin((i / 120) * Math.PI) * (0.6 + 0.4 * Math.random()) + 0.2 * Math.sin((i / 5) * Math.PI))),
          status: AudioStatus.COMPLETE,
          visibility: Visibility.PUBLIC,
          errorMessage: null,
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          expiresAt: null
        }
      ];

      for (const track of seedTracks) {
        await setDoc(doc(firestoreDb, 'users', uid, 'audioAssets', track.id), track);
      }
    } catch (e) {
      console.error('Error seeding library in Firestore:', e);
    }
  };

  const syncTrackToFirestore = async (trackId: string) => {
    if (!firebaseAuth.currentUser) return;
    try {
      const res = await fetch(`/api/audio/${trackId}`);
      if (res.ok) {
        const track = await res.json();
        await setDoc(doc(firestoreDb, 'users', firebaseAuth.currentUser.uid, 'audioAssets', trackId), track);
      }
    } catch (err) {
      console.error('Error syncing track to Firestore:', err);
    }
  };

  // 2. Fetch User and Library on startup / Firebase Authentication listener
  useEffect(() => {
    let unsubLibrary: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      // Clean up previous library snapshot listener if any exists
      if (unsubLibrary) {
        unsubLibrary();
        unsubLibrary = null;
      }

      if (firebaseUser) {
        const uid = firebaseUser.uid;
        const email = firebaseUser.email || '';
        const name = firebaseUser.displayName || email.split('@')[0] || 'User';

        try {
          const userDocRef = doc(firestoreDb, 'users', uid);
          const userDoc = await getDoc(userDocRef);
          let profile: User;

          if (userDoc.exists()) {
            profile = userDoc.data() as User;
          } else {
            profile = {
              id: uid,
              email: email,
              name: name,
              image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
              plan: Plan.FREE,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await setDoc(userDocRef, profile);
          }

          setUser(profile);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userName', name);

          // Listen to real-time library updates from Firestore for this user
          const q = query(
            collection(firestoreDb, 'users', uid, 'audioAssets'),
            orderBy('createdAt', 'desc')
          );

          unsubLibrary = onSnapshot(q, async (snapshot) => {
            const tracks: AudioAsset[] = [];
            snapshot.forEach((docSnap) => {
              tracks.push(docSnap.data() as AudioAsset);
            });

            // If user's library is empty, seed it with initial tracks so it's not barren
            if (tracks.length === 0) {
              await seedUserLibraryInFirestore(uid);
            } else {
              setLibrary(tracks);
              // Self-healing check for stale incomplete metadata or incorrect duration tracks in Firestore
              for (const track of tracks) {
                const needsUrlSync = track.status === AudioStatus.COMPLETE && (!track.mp3FileUrl || !track.originalFileUrl);
                const hasStaleDuration = track.status === AudioStatus.COMPLETE && track.duration === 131;

                if (needsUrlSync || hasStaleDuration) {
                  console.log(`Self-healing: Completed track ${track.id} has stale data, resyncing to Firestore...`);
                  syncTrackToFirestore(track.id);
                }
              }
            }
          }, (error) => {
            console.warn('Library snapshot listener inactive or disconnected (permissions updated):', error.message);
          });

        } catch (err) {
          console.error('Error loading or creating user profile in Firestore:', err);
        }
      } else {
        setUser(null);
        setLibrary([]);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
      }
    });

    // Check Stripe checkout return status
    const params = new URLSearchParams(window.location.search);
    const planSuccess = params.get('plan_success');
    const sessionId = params.get('session_id');
    const planCancel = params.get('plan_cancel');

    if (planSuccess && sessionId) {
      const handleSuccessfulUpgrade = async () => {
        try {
          const res = await fetch('/api/user/plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: planSuccess })
          });
          if (res.ok) {
            if (firebaseAuth.currentUser) {
              const userRef = doc(firestoreDb, 'users', firebaseAuth.currentUser.uid);
              await updateDoc(userRef, {
                plan: planSuccess,
                updatedAt: new Date().toISOString()
              });
              setUser(prev => prev ? { ...prev, plan: planSuccess as Plan } : null);
            }
            // Remove parameters from URL so refreshes are clean
            window.history.replaceState({}, document.title, window.location.pathname);
            setTimeout(() => {
              alert(`🎉 Thank you! Your UdioSunova AI account has been upgraded to ${planSuccess} successfully! High fidelity formats are now unlocked for your studio.`);
            }, 500);
          }
        } catch (e) {
          console.error('Failed to sync plan upgrade', e);
        }
      };
      handleSuccessfulUpgrade();
    } else if (planCancel) {
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => {
        alert('Subscription checkout cancelled. You can upgrade any time!');
      }, 500);
    }

    return () => {
      unsubscribe();
      if (unsubLibrary) {
        unsubLibrary();
      }
    };
  }, []);

  const fetchLibraryData = async () => {
    if (firebaseAuth.currentUser) {
      // Library is updated in real-time via the Firestore onSnapshot listener
      return;
    }
    setIsLoadingLibrary(true);
    try {
      const res = await fetch('/api/library');
      if (res.ok) {
        const data = await res.json();
        setLibrary(data);
      }
    } catch (e) {
      console.error('Failed to load audio library', e);
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  // 3. Poll active processing tracks in background
  useEffect(() => {
    const processingTracks = library.filter(
      track => track.status === AudioStatus.PENDING || track.status === AudioStatus.PROCESSING
    );

    if (processingTracks.length === 0 && !isImporting) return;

    const interval = setInterval(async () => {
      if (firebaseAuth.currentUser) {
        const uid = firebaseAuth.currentUser.uid;
        for (const track of processingTracks) {
          try {
            const statusRes = await fetch(`/api/audio/${track.id}/status`);
            if (statusRes.ok) {
              const statusData = await statusRes.json();
              
              // Update in Firestore
              const trackRef = doc(firestoreDb, 'users', uid, 'audioAssets', track.id);
              if (statusData.status === AudioStatus.COMPLETE || statusData.status === AudioStatus.FAILED) {
                await syncTrackToFirestore(track.id);
              } else {
                await updateDoc(trackRef, {
                  status: statusData.status,
                  progress: statusData.progress,
                  message: statusData.message,
                  updatedAt: new Date().toISOString()
                });
              }

              // If we have an active import job, update its progress
              if (importJobStatus && importJobStatus.audio_id === track.id) {
                setImportJobStatus({
                  audio_id: track.id,
                  progress: statusData.progress,
                  message: statusData.message,
                  status: statusData.status
                });

                if (statusData.status === AudioStatus.COMPLETE || statusData.status === AudioStatus.FAILED) {
                  setIsImporting(false);
                }
              }
            }
          } catch (e) {
            console.error('Error polling track status for Firebase user:', e);
          }
        }
        return;
      }

      // Fallback for non-logged in or local mode:
      try {
        const res = await fetch('/api/library');
        if (res.ok) {
          const data = await res.json();
          setLibrary(data);

          if (importJobStatus) {
            const currentTrack = data.find((t: AudioAsset) => t.id === importJobStatus.audio_id);
            if (currentTrack) {
              const statusRes = await fetch(`/api/audio/${currentTrack.id}/status`);
              if (statusRes.ok) {
                const statusData = await statusRes.json();
                setImportJobStatus({
                  audio_id: currentTrack.id,
                  progress: statusData.progress,
                  message: statusData.message,
                  status: statusData.status
                });

                if (statusData.status === AudioStatus.COMPLETE || statusData.status === AudioStatus.FAILED) {
                  setIsImporting(false);
                  if (statusData.status === AudioStatus.FAILED) {
                    setImportError(statusData.message || 'The platform could not find public downloadable audio for this link.');
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        console.error('Error polling track updates', e);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [library, isImporting, importJobStatus]);

  // Set default tool track to "demo_retro" if there are no completed library tracks or none is selected
  useEffect(() => {
    if (selectedToolId) {
      const completedTracks = library.filter(t => t.status === AudioStatus.COMPLETE);
      if (completedTracks.length === 0) {
        setToolTrackId('demo_retro');
      } else if (!toolTrackId) {
        setToolTrackId(completedTracks[0].id);
      }
    }
  }, [selectedToolId, library]);

  // Handle Plan Changes directly (Free -> Plus -> Pro for evaluation)
  const changeUserPlan = async (tier: Plan) => {
    try {
      const res = await fetch('/api/user/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: tier })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        fetchLibraryData();
      }
    } catch (e) {
      console.error('Failed to upgrade plan', e);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    setCouponSuccess('');
    try {
      const res = await fetch('/api/user/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupon: couponCode })
      });
      const data = await res.json();
      if (res.ok) {
        setCouponSuccess(data.message || '¡Cupón aplicado con éxito!');
        setCouponCode('');
        if (data.user) {
          setUser(data.user);
        }
        fetchLibraryData();
      } else {
        setCouponError(data.error || 'Código de cupón inválido o expirado.');
      }
    } catch (err) {
      setCouponError('Ocurrió un error al aplicar el cupón. Inténtalo de nuevo.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Launch real or simulated Stripe checkout flow
  const handleStripeCheckout = async (tier: 'PLUS' | 'PRO' | 'PRO_ANNUAL') => {
    if (!user) {
      setAuthInitialTab('signup');
      setActiveView('auth');
      setShowPricingModal(false);
      return;
    }
    if (!agreedToTerms) {
      setTermsError(true);
      alert('Please agree to the Terms & Conditions and Refund Policy before checking out.');
      return;
    }
    setTermsError(false);
    setIsCheckoutLoading(true);

    // Direct Stripe payment links provided by the user
    const directLinks = {
      PRO: (import.meta as any).env?.VITE_STRIPE_PAYMENT_LINK_MONTHLY || 'https://buy.stripe.com/4gM14o9bg6pY8lg97b9Zm00',
      PRO_ANNUAL: (import.meta as any).env?.VITE_STRIPE_PAYMENT_LINK_ANNUAL || 'https://buy.stripe.com/3cI8wQ9bg7u2bxsfvz9Zm01',
      PLUS: null as string | null,
    };

    const directLink = directLinks[tier];
    if (directLink) {
      // Append prefilled_email and client_reference_id for automatic/easy tracking
      const emailParam = user?.email ? `prefilled_email=${encodeURIComponent(user.email)}` : '';
      const uidParam = user?.uid ? `client_reference_id=${encodeURIComponent(user.uid)}` : '';
      const queryParams = [emailParam, uidParam].filter(Boolean).join('&');
      const finalUrl = queryParams ? `${directLink}${directLink.includes('?') ? '&' : '?'}${queryParams}` : directLink;
      
      window.location.href = finalUrl;
      setIsCheckoutLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: tier })
      });
      const data = await res.json();
      if (res.ok && data.url) {
        // Redirect to Stripe or Simulation checkout page
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start Stripe checkout flow.');
      }
    } catch (e: any) {
      console.error('Error starting checkout session:', e);
      alert('Could not reach checkout services. Please verify your connection.');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // Launch simulated UdioSunova Analog audio tool execution
  const handleRunTool = () => {
    if (isToolProcessing) return;
    
    setIsToolProcessing(true);
    setToolProcessed(false);
    setToolProgress(0);
    setToolLogs([]);
    setIsBypassed(false);

    const logMessages: { [key: string]: { [percent: number]: string } } = {
      restorer: {
        5: "Initializing UdioSunova Analog Spectrum Restorer (v3.2.1)...",
        15: "Analyzing track file and computing Fast Fourier Transform (FFT)...",
        30: "Detecting MP3/Suno/Udio compression artifacts and frequency roll-off...",
        45: "Synthesizing harmonic high-frequencies (14kHz - 22kHz spectral band)...",
        60: "Balancing high-frequency exciter levels and sub-bass resonance...",
        75: "Interpolating low-mid transient warmth using UdioSunova Analog Tube Saturation model...",
        90: "Re-dithering master audio stream and building preview buffer...",
        100: "✅ Restoration complete! Audio enhanced successfully."
      },
      stems: {
        5: "Loading HTDemucs-v4 multi-stem separator UdioSunova model...",
        15: "Pre-processing audio waveforms & building spectrogram blocks...",
        30: "Separating Vocals stem (Model epoch: 320, accuracy: 96.4%)...",
        45: "Extracting Drums stem (Transient mapping and transient noise gating)...",
        60: "Isolating Bass stem (Sub-bass separation & dynamic envelope filter)...",
        75: "Extracting remaining Melody & Instruments stem...",
        90: "Combining stem channels & mapping real-time multi-slider mixer...",
        100: "✅ Stem separation complete! Multi-track mixer is now active."
      },
      mastering: {
        5: "Initializing Analog Tape Mastering chain (1/2\" Studer A800 emulation)...",
        15: "Analyzing track loudness profile (RMS and LUFS integrated)...",
        30: "Applying Tape Saturation and Tube Compression warmth filters...",
        45: "Expanding stereo field and balancing mid/side spatial imaging...",
        65: "Maximizing volume to target threshold (-14 LUFS) with true peak limiter...",
        80: "Evaluating dynamic range and applying high-resolution dither...",
        95: "Re-rendering high-fidelity studio master stream...",
        100: "✅ Mastering complete! Dynamic loudness master optimized."
      },
      spatial: {
        5: "Booting Spatial Audio Spatializer engine...",
        15: "Initializing virtual soundstage room impulse responses (RIR)...",
        35: "Calculating binaural HRTF head transfer functions...",
        55: "Applying elevation filters & virtual speaker pan matrices...",
        75: "Synthesizing immersive 360-degree acoustic environment reflections...",
        90: "Compensating binaural phase alignment for headphone playback...",
        100: "✅ Spatializer complete! 3D Dolby Atmos space emulation active."
      },
      converter: {
        5: "Initializing high-fidelity FFmpeg Transcoder pipeline...",
        20: "Reading source container metadata and validating tags...",
        40: "Re-sampling audio bit-depth to match Target Format specifications...",
        65: "Converting bitstream container structure to lossless encoder...",
        85: "Injecting original artist credits, cover artwork and ID3 elements...",
        100: "✅ Transcoding complete! Format converted successfully with metadata intact."
      }
    };

    const currentToolId = selectedToolId || 'restorer';
    const toolLogsMap = logMessages[currentToolId] || logMessages.restorer;

    const interval = setInterval(() => {
      setToolProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 6;
        if (next >= 100) {
          clearInterval(interval);
          setToolProgress(100);
          setIsToolProcessing(false);
          setToolProcessed(true);
          const allMilestones = Object.keys(toolLogsMap).map(Number).sort((a,b) => a-b);
          setToolLogs((logs) => {
            const newLogs = [...logs];
            allMilestones.forEach(m => {
              if (!newLogs.includes(toolLogsMap[m])) {
                newLogs.push(toolLogsMap[m]);
              }
            });
            return newLogs;
          });
          return 100;
        }

        setToolLogs((logs) => {
          const newLogs = [...logs];
          Object.keys(toolLogsMap).forEach((percentStr) => {
            const percent = Number(percentStr);
            if (next >= percent && !newLogs.includes(toolLogsMap[percent])) {
              newLogs.push(toolLogsMap[percent]);
            }
          });
          return newLogs;
        });

        return next;
      });
    }, 220);
  };

  // 3. Import Public AI Link Handler (Generic helper)
  const triggerImportOfUrl = async (url: string, shouldRedirectToDashboard = true) => {
    if (!url || !url.trim()) return;

    if (!user) {
      setAuthInitialTab('signup');
      setActiveView('auth');
      return;
    }

    if (user?.plan === Plan.FREE && library.length >= 5) {
      alert("Limit reached. Free accounts can import up to 5 tracks in total. Please upgrade to Pro for unlimited imports!");
      setShowPricingModal(true);
      return;
    }

    setIsImporting(true);
    setImportError(null);
    setImportJobStatus(null);

    try {
      const res = await fetch('/api/import/from-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate link import.');
      }

      // Successful initiation
      setImportJobStatus({
        audio_id: data.audio_id,
        progress: 5,
        message: 'Enqueuing job pipeline...',
        status: AudioStatus.PENDING
      });

      setImportUrl('');
      
      if (shouldRedirectToDashboard) {
        // Switch views to dashboard to track progress
        setActiveView('dashboard');
      }
      
      if (firebaseAuth.currentUser) {
        await syncTrackToFirestore(data.audio_id);
      } else {
        fetchLibraryData();
      }

    } catch (err: any) {
      setIsImporting(false);
      setImportError(err.message || 'Something went wrong. Please check your network and try again.');
    }
  };

  const handleImportLink = async (e: React.FormEvent) => {
    e.preventDefault();
    await triggerImportOfUrl(importUrl, true);
  };

  // 4. File Drag & Drop & Upload Selection
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFileUpload(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const processFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    // Frontend validation
    const allowedExtensions = ['.mp3', '.wav', '.flac', '.m4a'];
    const hasAllowedExt = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasAllowedExt) {
      setUploadError('Invalid format. UdioSunova supports high-fidelity MP3, WAV, FLAC, and M4A.');
      setIsUploading(false);
      return;
    }

    // Limit check per plan (Max 5 songs total in library for Free tier)
    if (user?.plan === Plan.FREE && library.length >= 5) {
      setUploadError('Limit reached. Free accounts can have up to 5 songs total in their library. Upgrade to Premium for unlimited uploads and AI tools!');
      setIsUploading(false);
      return;
    }

    // Limit check per plan
    const fileSizeMb = file.size / (1024 * 1024);
    const sizeLimit = user?.plan === Plan.FREE ? 50 : (user?.plan === Plan.PLUS ? 250 : 1000);
    if (fileSizeMb > sizeLimit) {
      setUploadError(`File size (${fileSizeMb.toFixed(1)}MB) exceeds your tier upload limit (${sizeLimit}MB). Upgrade your plan.`);
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const res = await fetch('/api/upload/audio', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload audio file.');
      }

      // Success
      if (firebaseAuth.currentUser) {
        await syncTrackToFirestore(data.audio_id);
      } else {
        fetchLibraryData();
      }
      setActiveView('dashboard');
      
      // Select the uploaded track and open studio
      if (data.audio_id) {
        openTrackInStudio(data.audio_id);
      }
    } catch (err: any) {
      setUploadError(err.message || 'File upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  // 5. Open track inside Studio
  const openTrackInStudio = (trackId: string) => {
    const track = library.find(t => t.id === trackId);
    if (track) {
      setSelectedTrackId(trackId);
      setEditTitle(track.title);
      setEditArtist(track.artist);
      setEditVisibility(track.visibility);
      setIsEditingMeta(false);
      setActiveView('studio');
    }
  };

  // Save renamed track metadata
  const handleSaveTrackMeta = async () => {
    if (!selectedTrackId) return;
    try {
      const res = await fetch(`/api/audio/${selectedTrackId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          artist: editArtist,
          visibility: editVisibility
        })
      });

      if (res.ok) {
        const updated = await res.json();
        // Update library
        if (firebaseAuth.currentUser) {
          await syncTrackToFirestore(selectedTrackId);
        } else {
          setLibrary(library.map(t => t.id === selectedTrackId ? updated : t));
        }
        setIsEditingMeta(false);
      }
    } catch (e) {
      console.error('Failed to update track metadata', e);
    }
  };

  // Delete Track from Library
  const handleDeleteTrack = async (trackId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this track from your UdioSunova library? This will purge all formats.");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/audio/${trackId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (firebaseAuth.currentUser) {
          await deleteDoc(doc(firestoreDb, 'users', firebaseAuth.currentUser.uid, 'audioAssets', trackId));
        }
        setLibrary(library.filter(t => t.id !== trackId));
        if (selectedTrackId === trackId) {
          setSelectedTrackId(null);
          setActiveView('dashboard');
        }
      }
    } catch (e) {
      console.error('Failed to delete track', e);
    }
  };

  // 6. Transcode & Download Audio handling
  const handleDownloadTrack = async (trackId: string, format: 'mp3' | 'wav' | 'flac') => {
    setDownloadError(null);
    setIsDownloadingId(trackId);

    try {
      // Allow WAV/FLAC downloads for everyone in the preview/dev environment.

      // Step 1: Query download link (with rate limiting / abuse checks inside server)
      const res = await fetch(`/api/audio/${trackId}/download?format=${format}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process secure download.');
      }

      // Step 2: Trigger standard browser file downloading
      const downloadUrl = data.download_url;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', data.filename || `UdioSunova_track.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err: any) {
      setDownloadError(err.message || 'An error occurred during file download.');
      // Automatically clear download error after 6 seconds
      setTimeout(() => setDownloadError(null), 6000);
    } finally {
      setIsDownloadingId(null);
    }
  };

  // Filter track library items
  const getFilteredLibrary = () => {
    return library.filter(track => {
      // 1. Search Query filter
      const matchesSearch = 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      // 2. Filter tabs
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'completed') return track.status === AudioStatus.COMPLETE;
      if (selectedFilter === 'processing') return track.status === AudioStatus.PROCESSING || track.status === AudioStatus.PENDING;
      if (selectedFilter === 'failed') return track.status === AudioStatus.FAILED;
      if (selectedFilter === 'uploaded') return track.sourcePlatform === 'Manual Upload';

      return true;
    });
  };

  const getActiveTrack = () => {
    return library.find(t => t.id === selectedTrackId);
  };

  // Time formatter
  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-900 overflow-x-hidden">
      
      {/* GLOBAL BACKGROUND GLOWS */}
      <div className="fixed top-[-10%] left-[-20%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* ---------------------------------------------------------------------- */}
      {/* VIEW: LANDING PAGE */}
      {/* ---------------------------------------------------------------------- */}
      {activeView === 'landing' && (
        <div id="landing-page-view" className="relative z-10 flex flex-col min-h-screen">
          
          {/* Header Bar */}
          <header className="sticky top-0 bg-[#030712]/75 backdrop-blur-md border-b border-sky-500/10 z-50 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
              
              {/* Brand Logo */}
              <div 
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => { setActiveView('landing'); setIsMobileMenuOpen(false); }}
              >
                <UdioSunovaLogo size="lg" />
              </div>

              {/* Central Menu Items */}
              <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
                <a href="#features" className="hover:text-cyan-400 hover:scale-105 transition-all">Features</a>
                <span 
                  onClick={() => setActiveView(user ? 'dashboard' : 'auth')} 
                  className="cursor-pointer hover:text-cyan-400 hover:scale-105 transition-all"
                >
                  Studio
                </span>
                <span 
                  onClick={() => {
                    setActiveView('tools');
                    setSelectedToolId(null);
                  }} 
                  className="cursor-pointer hover:text-cyan-400 hover:scale-105 transition-all"
                >
                  AI Tools
                </span>
                <span 
                  onClick={() => setShowPricingModal(true)} 
                  className="cursor-pointer hover:text-cyan-400 hover:scale-105 transition-all text-cyan-400 font-medium"
                >
                  Upgrade
                </span>
                <span 
                  onClick={() => { setActiveView('legal'); setActiveLegalSection('terms'); }} 
                  className="cursor-pointer hover:text-cyan-400 hover:scale-105 transition-all"
                >
                  ToS & Licensing
                </span>
              </nav>

              {/* CTAs & Mobile Toggle */}
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="hidden sm:flex items-center gap-4">
                  {user ? (
                    <button 
                      id="dashboard-cta"
                      onClick={() => setActiveView('dashboard')}
                      className="text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 px-5 py-2 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-cyan-400/20 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse"
                    >
                      Go to Studio
                    </button>
                  ) : (
                    <>
                      <button 
                        id="dashboard-cta"
                        onClick={() => { setAuthInitialTab('login'); setActiveView('auth'); }}
                        className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:scale-102 active:scale-98 transition-all px-4 py-2 cursor-pointer"
                      >
                        Sign In
                      </button>
                      <button 
                        id="start-free-cta"
                        onClick={() => { setAuthInitialTab('signup'); setActiveView('auth'); }}
                        className="text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 px-5 py-2 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-cyan-400/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        Start Free
                      </button>
                    </>
                  )}
                </div>

                {/* Mobile direct navigation / action button */}
                <div className="flex sm:hidden">
                  {user ? (
                    <button 
                      onClick={() => setActiveView('dashboard')}
                      className="text-xs font-semibold text-slate-950 bg-gradient-to-r from-sky-400 to-blue-500 px-3.5 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
                    >
                      Studio
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setAuthInitialTab('signup'); setActiveView('auth'); }}
                      className="text-xs font-semibold text-slate-950 bg-gradient-to-r from-sky-400 to-blue-500 px-3.5 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
                    >
                      Start
                    </button>
                  )}
                </div>

                {/* Hamburger menu button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900/60 transition-all md:hidden cursor-pointer flex items-center justify-center shrink-0"
                  aria-label="Toggle Menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>

            </div>

            {/* Mobile Dropdown Menu Drawer */}
            {isMobileMenuOpen && (
              <div className="md:hidden border-t border-sky-500/10 bg-[#030712]/95 backdrop-blur-lg animate-fade-in py-3 px-4 space-y-2.5 shadow-2xl relative z-50 text-left">
                <nav className="flex flex-col gap-2">
                  <a 
                    href="#features" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-900 transition-all font-medium"
                  >
                    Features
                  </a>
                  <span 
                    onClick={() => { setActiveView(user ? 'dashboard' : 'auth'); setIsMobileMenuOpen(false); }} 
                    className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-900 transition-all font-medium cursor-pointer"
                  >
                    Studio
                  </span>
                  <span 
                    onClick={() => {
                      setActiveView('tools');
                      setSelectedToolId(null);
                      setIsMobileMenuOpen(false);
                    }} 
                    className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-900 transition-all font-medium cursor-pointer"
                  >
                    AI Tools
                  </span>
                  <span 
                    onClick={() => { setShowPricingModal(true); setIsMobileMenuOpen(false); }} 
                    className="block px-3 py-2 rounded-lg text-sm text-cyan-400 hover:text-cyan-300 hover:bg-slate-900 transition-all font-semibold cursor-pointer"
                  >
                    Upgrade / Subscription Plans
                  </span>
                  <span 
                    onClick={() => { setActiveView('legal'); setActiveLegalSection('terms'); setIsMobileMenuOpen(false); }} 
                    className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-900 transition-all font-medium cursor-pointer"
                  >
                    ToS & Licensing
                  </span>
                  {!user && (
                    <span 
                      onClick={() => { setAuthInitialTab('login'); setActiveView('auth'); setIsMobileMenuOpen(false); }} 
                      className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-900 transition-all font-medium cursor-pointer border-t border-slate-800/60 pt-2.5"
                    >
                      Sign In
                    </span>
                  )}
                </nav>
              </div>
            )}
          </header>

          {/* Hero Section */}
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 relative">
            <div className="text-center max-w-3xl mx-auto space-y-6 mb-16">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/40 border border-blue-500/20 text-xs font-semibold text-cyan-400 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Next-Gen AI Audio Studio is Active</span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Improve audio quality <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">in one click</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Paste your public Suno, Udio or audio link below to fetch metadata, split stems, restore missing frequencies, and apply professional studio-level mastering.
              </p>

              {/* Central Importer Input */}
              <form onSubmit={handleImportLink} className="max-w-2xl mx-auto bg-slate-900/60 border border-sky-400/20 rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-[0_0_30px_rgba(56,189,248,0.05)] focus-within:border-cyan-400/40 focus-within:shadow-[0_0_30px_rgba(56,189,248,0.1)] transition-all">
                <div className="flex-1 min-w-0 flex items-center px-3 gap-2 py-1.5 sm:py-0">
                  <Globe className="w-5 h-5 text-slate-500 shrink-0" />
                  <input 
                    id="landing-import-url"
                    type="url" 
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    placeholder="Paste your public Udio, Suno or audio link..."
                    className="w-full min-w-0 bg-transparent border-none text-white placeholder-slate-500 focus:outline-none text-sm"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    id="landing-import-btn"
                    type="submit"
                    disabled={isImporting || !importUrl.trim()}
                    className="flex-1 sm:flex-initial sm:w-auto bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-semibold px-6 py-3 rounded-xl hover:scale-102 active:scale-98 disabled:opacity-50 transition-all cursor-pointer text-sm flex items-center justify-center gap-2 shadow-lg shrink-0"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Importing...</span>
                      </>
                    ) : (
                      <>
                        <FolderSync className="w-4 h-4" />
                        <span>Import Track</span>
                      </>
                    )}
                  </button>
                  <button
                    id="landing-upload-btn"
                    type="button"
                    onClick={() => { if (user) { setActiveView('dashboard'); triggerFileInput(); } else { setAuthInitialTab('signup'); setActiveView('auth'); } }}
                    className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/80 font-semibold px-4 py-3 rounded-xl hover:scale-102 active:scale-98 transition-all cursor-pointer text-sm shrink-0"
                    title="Upload Audio Manually"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Compliance Notice */}
              <p className="text-[11px] text-slate-500 mt-2 max-w-xl mx-auto leading-normal">
                Only import tracks you created, own, or have permission to use. UdioSunova AI is not affiliated with Udio, Suno, UdioSunova Analog, or any third-party AI platform.
              </p>

              {importError && (
                <div className="max-w-xl mx-auto bg-rose-950/30 border border-rose-500/20 text-rose-300 rounded-xl p-3 text-xs text-left flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{importError}</span>
                </div>
              )}

              {/* OR Divider */}
              <div className="relative flex py-4 items-center max-w-2xl mx-auto">
                <div className="flex-grow border-t border-slate-800/80"></div>
                <span className="flex-shrink mx-4 text-slate-500 text-[10px] font-bold tracking-widest uppercase">OR</span>
                <div className="flex-grow border-t border-slate-800/80"></div>
              </div>

              {/* Drag & Drop File Upload Card */}
              <div 
                id="landing-upload-card"
                onClick={() => {
                  if (user) {
                    triggerFileInput();
                  } else {
                    setAuthInitialTab('signup');
                    setActiveView('auth');
                  }
                }}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={async (e) => {
                  if (user) {
                    await handleDrop(e);
                  } else {
                    e.preventDefault();
                    setAuthInitialTab('signup');
                    setActiveView('auth');
                  }
                }}
                className={`w-full max-w-2xl mx-auto border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all flex flex-col items-center justify-center gap-4 group ${
                  dragActive 
                    ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_25px_rgba(34,211,238,0.15)]' 
                    : 'border-slate-800/90 hover:border-cyan-400/50 bg-slate-900/20 hover:bg-cyan-950/5'
                }`}
              >
                {/* Audio upload/soundwave icon with cyan/blue gradient matching our brand */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 via-sky-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/10 group-hover:scale-105 transition-transform duration-300">
                  <Upload className="w-5.5 h-5.5 animate-pulse" />
                </div>
                
                <div className="space-y-1">
                  <p className="text-base font-bold text-white tracking-tight">Upload audio files</p>
                  <p className="text-xs text-slate-400">Drag & drop or click to browse (multiple files supported)</p>
                </div>

                <p className="text-[10px] text-slate-500 max-w-lg leading-normal select-none">
                  Supports: MP3, MPEG, MP2, MPGA, WAV, AIFF, AIF, FLAC, AAC, OGG, OGA, OPUS, M4A, MP4, WEBM, WMA, ALAC, AMR
                  <br />
                  <span className="font-semibold text-slate-400">Max size: 50MB.</span>
                </p>
              </div>

              {uploadError && (
                <div className="max-w-xl mx-auto mt-4 bg-rose-950/30 border border-rose-500/20 text-rose-300 rounded-xl p-3 text-xs text-left flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Audio Restoration Showcase Section */}
            <AudioRestorationShowcase />

            {/* Import Any Track & Surgical Stem Splitting Showcase Sections */}
            <ShowcaseSections onImportAudio={() => { if (user) { triggerFileInput(); } else { setAuthInitialTab('signup'); setActiveView('auth'); } }} />

            {/* Dashboard Mockup Showcase */}
            <div id="showcase-mockup" className="max-w-4xl mx-auto bg-[#071426]/75 border border-sky-400/25 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(56,189,248,0.15)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee]" />
              
              <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                
                {/* Cover art mockup */}
                <div className="w-44 h-44 rounded-2xl overflow-hidden relative group/cover border border-sky-500/20 shrink-0 shadow-2xl">
                  <img 
                    src={mockupTrack.cover} 
                    alt="Mockup cover" 
                    className="w-full h-full object-cover group-hover/cover:scale-105 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <span className="text-[10px] font-semibold text-cyan-400 tracking-wider uppercase bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/20">
                      {mockupTrack.source}
                    </span>
                  </div>
                </div>

                {/* Track details mockup */}
                <div className="flex-1 text-left w-full space-y-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{mockupTrack.title}</h3>
                    <p className="text-sm text-slate-400">{mockupTrack.artist}</p>
                  </div>

                  {/* Unmastered and Mastered Waveforms Comparison */}
                  <div className="space-y-3">
                    {/* Original / No Master Waveform */}
                    <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="text-slate-400 font-medium">Original / No Master</span>
                        <span className="text-[10px] font-mono text-slate-500">{mockupTrack.noMasterLufs}</span>
                      </div>
                      <div className="h-8 flex items-end gap-[1.5px] px-1 select-none">
                        {mockupTrack.originalHeights.map((height, idx) => (
                          <div 
                            key={idx}
                            className="flex-1 bg-slate-700/50 rounded-sm"
                            style={{ height: `${height * 100}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Mastered / UdioSunova Analog Boosted Waveform */}
                    <div className="bg-blue-950/15 p-2.5 rounded-xl border border-blue-500/10">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="text-cyan-400 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                          Mastered / UdioSunova Analog Boosted
                        </span>
                        <span className="text-[10px] font-mono text-cyan-500 font-semibold">{mockupTrack.masteredLufs}</span>
                      </div>
                      <div className="h-8 flex items-end gap-[1.5px] px-1 select-none">
                        {mockupTrack.masteredHeights.map((height, idx) => (
                          <div 
                            key={idx}
                            className="flex-1 bg-gradient-to-t from-blue-600 to-sky-400 rounded-sm shadow-[0_0_3px_rgba(56,189,248,0.2)]"
                            style={{ height: `${height * 100}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-[10px] font-mono text-slate-500">
                      waveforms
                    </p>
                  </div>

                  {/* Buttons Mockup */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/35 border border-cyan-500/25 px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0">
                      <Check className="w-3.5 h-3.5" /> MP3 Ready
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0">
                      <Lock className="w-3 h-3 text-slate-600" /> WAV Master
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0">
                      <Lock className="w-3 h-3 text-slate-600" /> AI Stems
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0">
                      <Lock className="w-3 h-3 text-slate-600" /> Restore
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Join 20,000+ Music Producers Community Section */}
            <div className="mt-16 max-w-4xl mx-auto text-center space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3.5xl font-extrabold text-white tracking-tight leading-tight">
                  Built for <span className="text-[#38bdf8] drop-shadow-[0_0_15px_rgba(56,189,248,0.3)] font-black">music producers</span> turning AI drafts into releases
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Explore demo tracks and preview audio enhancement examples. Click any demo below to compare enhanced vs original waveforms above.
                </p>
              </div>

              {/* 3x2 Grid of Community Tracks */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {COMMUNITY_TRACKS.map((track) => {
                  const isActive = mockupTrack.cover === track.cover;
                  return (
                    <div
                      key={track.id}
                      onClick={() => setMockupTrack(track)}
                      className={`group/comm-card relative bg-slate-900/40 rounded-2xl p-3 text-left cursor-pointer transition-all duration-300 hover:scale-[1.03] flex flex-col gap-3 ${
                        isActive 
                          ? 'border-2 border-[#38bdf8] bg-[#0c223c]/40 shadow-[0_0_20px_rgba(56,189,248,0.25)]' 
                          : track.isBlueBorder 
                            ? 'border border-[#38bdf8]/30 hover:border-[#38bdf8]/70 shadow-[0_0_12px_rgba(56,189,248,0.06)]'
                            : 'border border-slate-800/80 hover:border-sky-500/40'
                      }`}
                    >
                      {/* Image container */}
                      <div className="aspect-square w-full rounded-xl overflow-hidden relative border border-slate-800/60 shadow-md">
                        <img 
                          src={track.cover} 
                          alt={track.title} 
                          className="w-full h-full object-cover group-hover/comm-card:scale-105 transition-all duration-500"
                        />
                        {/* Play overlay */}
                        {(track.hasBluePlayButton || isActive) ? (
                          <div className="absolute inset-0 bg-[#020617]/40 backdrop-blur-[1px] flex items-center justify-center transition-all duration-300">
                            <div className="w-10 h-10 rounded-full bg-[#38bdf8] flex items-center justify-center text-slate-950 shadow-lg shadow-[#38bdf8]/30 transform group-hover/comm-card:scale-110 transition-transform">
                              <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                            </div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover/comm-card:opacity-100 flex items-center justify-center transition-all duration-300">
                            <div className="w-9 h-9 rounded-full bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-white shadow-md">
                              <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                            </div>
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className="text-[9px] font-semibold text-cyan-400 bg-[#020617]/80 backdrop-blur-md px-1.5 py-0.5 rounded border border-cyan-500/20">
                            {track.source}
                          </span>
                        </div>
                      </div>

                      {/* Text info */}
                      <div className="min-w-0 space-y-0.5">
                        <h4 className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                          track.isBlueTitle || isActive ? 'text-[#38bdf8]' : 'text-white'
                        }`}>
                          {track.title}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-slate-400 truncate font-medium">
                          {track.artist}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feature Cards Section */}
            <div id="features" className="mt-32 space-y-12">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <h2 className="text-2xl sm:text-3.5xl font-bold text-white tracking-tight">
                  Premium Suite for AI Musicians
                </h2>
                <p className="text-sm sm:text-base text-slate-400">
                  A high-fidelity system designed to bridge AI platforms and your professional DAW studio environment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* feature 1 */}
                <div className="bg-[#071426]/60 border border-sky-500/10 hover:border-sky-500/20 p-6 rounded-2xl hover:scale-102 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:bg-gradient-to-tr group-hover:from-blue-600 group-hover:to-sky-400 group-hover:text-white transition-all">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">AI Music Importer</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Import your own public AI-generated tracks from supported platforms.
                  </p>
                </div>

                {/* feature 2 */}
                <div className="bg-[#071426]/60 border border-sky-500/10 hover:border-sky-500/20 p-6 rounded-2xl hover:scale-102 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:bg-gradient-to-tr group-hover:from-blue-600 group-hover:to-sky-400 group-hover:text-white transition-all">
                    <Library className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Audio Library</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Keep every track organized with artwork, metadata and download history.
                  </p>
                </div>

                {/* feature 3 */}
                <div className="bg-[#071426]/60 border border-sky-500/10 hover:border-sky-500/20 p-6 rounded-2xl hover:scale-102 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:bg-gradient-to-tr group-hover:from-blue-600 group-hover:to-sky-400 group-hover:text-white transition-all">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Smart Export</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Convert your files to MP3, WAV or FLAC using high-quality FFmpeg processing.
                  </p>
                </div>

                {/* feature 4 */}
                <div 
                  onClick={() => {
                    setActiveView('tools');
                    setSelectedToolId(null);
                  }}
                  className="bg-[#071426]/60 border border-cyan-500/10 hover:border-cyan-500/30 p-6 rounded-2xl hover:scale-102 transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-cyan-500/20 flex items-center justify-center text-cyan-300 mb-4 group-hover:bg-gradient-to-tr group-hover:from-blue-600 group-hover:to-sky-400 group-hover:text-white transition-all">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">AI Audio Toolkit</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Enhance clarity, separate stems, prepare masters, and export clean audio files for your creative workflow.
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-all mt-4">
                    Open Tools Studio <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* feature 5 */}
                <div className="bg-[#071426]/60 border border-sky-500/10 hover:border-sky-500/20 p-6 rounded-2xl hover:scale-102 transition-all group col-md-span-1">
                  <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:bg-gradient-to-tr group-hover:from-blue-600 group-hover:to-sky-400 group-hover:text-white transition-all">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Safe & Legal</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Only public links and user-owned content are supported. No private downloads, no bypassing restrictions.
                  </p>
                </div>

                {/* manual upload quick card */}
                <div className="bg-[#071426]/60 border border-cyan-500/20 hover:border-cyan-500/30 p-6 rounded-2xl hover:scale-102 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/20 flex items-center justify-center text-cyan-300 mb-4">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Instant Local Upload</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      If your link is private, drag and drop the audio file directly into our dashboard player manually.
                    </p>
                  </div>
                  <button
                    onClick={() => { if (user) { setActiveView('dashboard'); triggerFileInput(); } else { setAuthInitialTab('signup'); setActiveView('auth'); } }}
                    className="text-xs font-semibold text-sky-400 flex items-center gap-1 group-hover:translate-x-1 transition-all mt-4 text-left cursor-pointer"
                  >
                    Upload Audio File <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>

          </main>

          {/* Footer legal disclaimer */}
          <footer className="mt-auto bg-slate-950/80 border-t border-slate-900/80 py-10 z-10 text-slate-500 text-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 max-w-xl text-center md:text-left">
                <p>© 2026 UDIOSUNOVA AI. All rights reserved.</p>
                <p className="leading-relaxed text-[11px] text-slate-600">
                  UdioSunova AI provides software tools for user-owned or authorized audio only. We do not sell music, provide unauthorized downloads, bypass platform restrictions, or claim affiliation with any third-party AI music platform.
                </p>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 font-semibold text-[11px] text-slate-400 justify-center md:justify-end">
                <span onClick={() => { setActiveView('legal'); setActiveLegalSection('terms'); }} className="cursor-pointer hover:text-white">Terms of Service</span>
                <span onClick={() => { setActiveView('legal'); setActiveLegalSection('privacy'); }} className="cursor-pointer hover:text-white">Privacy Policy</span>
                <span onClick={() => { setActiveView('legal'); setActiveLegalSection('refund'); }} className="cursor-pointer hover:text-white">Refund Policy</span>
                <span onClick={() => { setActiveView('legal'); setActiveLegalSection('cancellation'); }} className="cursor-pointer hover:text-white">Cancellation Policy</span>
                <span onClick={() => { setActiveView('legal'); setActiveLegalSection('copyright'); }} className="cursor-pointer hover:text-white">DMCA Policy</span>
                <span onClick={() => { setActiveView('legal'); setActiveLegalSection('acceptable-use'); }} className="cursor-pointer hover:text-white">Acceptable Use Policy</span>
                <span onClick={() => { setActiveView('legal'); setActiveLegalSection('contact'); }} className="cursor-pointer hover:text-white">Contact Support</span>
              </div>
            </div>
          </footer>

        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* VIEW: AUTHENTICATION (LOG IN / SIGN UP) */}
      {/* ---------------------------------------------------------------------- */}
      {activeView === 'auth' && (
        <div id="auth-page-view" className="relative z-10 flex-1 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#030712]">
          <AuthForm 
            initialTab={authInitialTab}
            onSuccess={(email, name) => {
              setActiveView('dashboard');
            }}
            onCancel={() => setActiveView('landing')}
            onNavigateToLegal={(section) => {
              setActiveView('legal');
              setActiveLegalSection(section);
            }}
          />
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* VIEW: MAIN STUDIO / DASHBOARD & WORKSPACE */}
      {/* ---------------------------------------------------------------------- */}
      {(activeView === 'dashboard' || activeView === 'studio' || activeView === 'legal' || activeView === 'tools') && (
        <div id="studio-dashboard-layout" className="relative z-10 flex flex-col md:flex-row min-h-screen">
          
          {/* File Input for hidden manual upload triggers */}
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="audio/mp3,audio/mpeg,audio/wav,audio/flac,audio/m4a"
          />

          {/* Sidebar Backdrop Overlay on Mobile */}
          {isSidebarOpen && (
            <div 
              onClick={() => setIsSidebarOpen(false)} 
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
            />
          )}

          {/* 1. Sidebar Left / Mobile Drawer */}
          <aside className={`
            fixed md:static inset-y-0 left-0 z-50 
            w-64 md:w-60 bg-[#071426] border-r border-slate-800/60 
            flex flex-col p-6 gap-6 shrink-0 transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            
            {/* Logo area */}
            <div className="flex items-center justify-between gap-2">
              <div 
                className="flex items-center gap-2.5 cursor-pointer group"
                onClick={() => { setActiveView('landing'); setIsSidebarOpen(false); }}
              >
                <UdioSunovaLogo size="md" />
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all md:hidden cursor-pointer"
                aria-label="Close Sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main sidebar menu */}
            <nav className="flex-1 flex flex-col gap-1 text-sm font-semibold">
              <div 
                id="sidebar-library"
                onClick={() => {
                  if (user) {
                    setActiveView('dashboard');
                    setSelectedTrackId(null);
                  } else {
                    setAuthInitialTab('login');
                    setActiveView('auth');
                  }
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  activeView === 'dashboard' && selectedTrackId === null
                    ? 'bg-[#2563EB]/10 text-[#38BDF8]' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Library className="w-4 h-4 shrink-0" />
                <span>Audio Library</span>
              </div>

              <div 
                id="sidebar-tools-grid"
                onClick={() => {
                  if (user) {
                    setActiveView('tools');
                    setSelectedToolId(null);
                  } else {
                    setAuthInitialTab('login');
                    setActiveView('auth');
                  }
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  activeView === 'tools' && selectedToolId === null
                    ? 'bg-[#2563EB]/10 text-[#38BDF8]' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Sliders className="w-4 h-4 shrink-0 text-cyan-400" />
                <span className="text-cyan-400 font-semibold">Tools / Herramientas</span>
              </div>

              <div 
                id="sidebar-pricing"
                onClick={() => { setShowPricingModal(true); setIsSidebarOpen(false); }}
                className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 shrink-0 text-cyan-400 group-hover:rotate-12 transition-all animate-pulse" />
                  <span className="text-cyan-400 font-semibold">Upgrade / Planes</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400 opacity-80 shrink-0" />
              </div>

              <div 
                id="sidebar-terms"
                onClick={() => { setActiveView('legal'); setActiveLegalSection('terms'); setIsSidebarOpen(false); }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  activeView === 'legal' && activeLegalSection === 'terms'
                    ? 'bg-[#2563EB]/10 text-[#38BDF8]' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Terms of Service</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
              </div>

              <div 
                id="sidebar-privacy"
                onClick={() => { setActiveView('legal'); setActiveLegalSection('privacy'); setIsSidebarOpen(false); }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  activeView === 'legal' && activeLegalSection === 'privacy'
                    ? 'bg-[#2563EB]/10 text-[#38BDF8]' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Privacy Policy</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
              </div>

              <div className="pt-4 pb-1">
                <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">UdioSunova Analog Suite</span>
              </div>
              <div 
                onClick={() => { setActiveView('tools'); setSelectedToolId('restorer'); setIsSidebarOpen(false); }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  activeView === 'tools' && selectedToolId === 'restorer'
                    ? 'bg-[#2563EB]/10 text-[#38BDF8]' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Cpu className="w-4 h-4 shrink-0" />
                  <span>Ultra Restorer</span>
                </div>
              </div>
              
              <div 
                onClick={() => { setActiveView('tools'); setSelectedToolId('stems'); setIsSidebarOpen(false); }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  activeView === 'tools' && selectedToolId === 'stems'
                    ? 'bg-[#2563EB]/10 text-[#38BDF8]' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sliders className="w-4 h-4 shrink-0" />
                  <span>Stem Splitter</span>
                </div>
              </div>

              <div 
                onClick={() => { setActiveView('tools'); setSelectedToolId('mastering'); setIsSidebarOpen(false); }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  activeView === 'tools' && selectedToolId === 'mastering'
                    ? 'bg-[#2563EB]/10 text-[#38BDF8]' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Disc className="w-4 h-4 shrink-0" />
                  <span>Tape Mastering</span>
                </div>
              </div>

              <div 
                onClick={() => { setActiveView('tools'); setSelectedToolId('spatial'); setIsSidebarOpen(false); }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  activeView === 'tools' && selectedToolId === 'spatial'
                    ? 'bg-[#2563EB]/10 text-[#38BDF8]' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Waves className="w-4 h-4 shrink-0" />
                  <span>Spatial Atmos</span>
                </div>
              </div>

              <div 
                onClick={() => { setActiveView('tools'); setSelectedToolId('converter'); setIsSidebarOpen(false); }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  activeView === 'tools' && selectedToolId === 'converter'
                    ? 'bg-[#2563EB]/10 text-[#38BDF8]' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 shrink-0" />
                  <span>HQ Tag Transcoder</span>
                </div>
              </div>
            </nav>

            {/* Plan Badge Upgrade Selector */}
            <div className="bg-gradient-to-b from-[#0F172A] to-[#071426] border border-slate-700/50 rounded-xl p-4 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-300">
                  {user?.plan !== Plan.FREE ? 'Premium Plan' : 'Free Plan'}
                </p>
                <span className={`text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase ${
                  user?.plan !== Plan.FREE ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-300'
                }`}>
                  {user?.plan !== Plan.FREE ? 'PREMIUM' : 'FREE'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full">
                <div 
                  className="bg-[#38BDF8] h-1 rounded-full transition-all duration-300" 
                  style={{ 
                    width: user?.plan !== Plan.FREE 
                      ? '100%' 
                      : `${Math.min(100, (library.length / 5) * 100)}%` 
                  }} 
                />
              </div>
              <p className="text-[10px] text-slate-500">
                {user?.plan !== Plan.FREE 
                  ? 'Unlimited WAV & AI UdioSunova Analog Tools Active' 
                  : `${Math.min(5, library.length)}/5 Songs Imported`
                }
              </p>
              <div className="flex gap-1.5 pt-1">
                {user?.plan === Plan.FREE ? (
                  <button
                    id="upgrade-plus-btn"
                    onClick={() => { setShowPricingModal(true); setIsSidebarOpen(false); }}
                    className="flex-1 text-[9px] py-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 rounded font-black uppercase tracking-wider hover:scale-[1.02] transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
                    title="Upgrade to SoundNova Premium"
                  >
                    Upgrade ($3/mo)
                  </button>
                ) : (
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[9px] text-cyan-400 font-semibold">Active & Billing via Stripe</span>
                    <button
                      id="reset-free-btn"
                      onClick={() => { changeUserPlan(Plan.FREE); setIsSidebarOpen(false); }}
                      className="px-2 py-0.5 text-[8px] rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                      title="Reset to Free Tier (Simulate Unsubscribe)"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Footer User info */}
            {user ? (
              <div className="pt-6 border-t border-slate-850 flex items-center gap-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center shrink-0">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                </div>
                <div className="min-w-0 text-left flex-1">
                  <p className="font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await signOut(firebaseAuth);
                      setActiveView('landing');
                      setIsSidebarOpen(false);
                    } catch (err) {
                      console.error('Failed to log out:', err);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-slate-900/40 hover:bg-red-950/30 hover:text-red-400 text-slate-400 transition-all border border-slate-800/40 cursor-pointer flex items-center justify-center shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="pt-6 border-t border-slate-850 space-y-3 text-left">
                <p className="text-[10px] text-slate-400">Sign in to save your history & unlock downloads.</p>
                <button
                  onClick={() => { setAuthInitialTab('login'); setActiveView('auth'); setIsSidebarOpen(false); }}
                  className="w-full bg-gradient-to-r from-[#38bdf8] to-blue-500 hover:from-sky-300 hover:to-blue-450 text-slate-950 text-xs font-black py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-1.5"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-950" />
                  <span>Sign In / Register</span>
                </button>
              </div>
            )}

          </aside>

          {/* 2. Main Workspace Right Wrapper */}
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            
            {/* Pinned Studio Header */}
            <header className="h-16 border-b border-slate-800/60 px-4 sm:px-8 flex items-center justify-between bg-[#030712]/80 backdrop-blur-md shrink-0 z-30">
              
              <div className="flex items-center gap-2.5">
                {/* Mobile Sidebar Menu Button */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 -ml-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900/60 transition-all md:hidden cursor-pointer flex items-center justify-center shrink-0"
                  aria-label="Open Sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Mobile Brand Logo */}
                <div 
                  className="flex md:hidden items-center gap-1.5 cursor-pointer"
                  onClick={() => { setActiveView('landing'); setIsSidebarOpen(false); }}
                >
                  <UdioSunovaLogo size="sm" />
                </div>
              </div>

              {/* Desktop-only Search / Import Input (Hidden on mobile to stay clear & compact) */}
              <form onSubmit={handleImportLink} className="hidden md:flex items-center gap-4 flex-1 max-w-xl mx-4">
                <div className="relative w-full">
                  <input 
                    id="header-import-url"
                    type="url" 
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    placeholder="Paste your public Udio, Suno or audio link..." 
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB]"
                    required
                  />
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                </div>
                <button 
                  id="header-import-btn"
                  type="submit" 
                  disabled={isImporting || !importUrl.trim()}
                  className="bg-[#2563EB] hover:bg-[#1d4ed8] px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap text-white cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <span>Import Track</span>
                  )}
                </button>
              </form>

              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-xs font-semibold text-slate-400 hidden sm:block">
                      {user.name}
                    </div>
                  </>
                ) : (
                  <button 
                    onClick={() => { setAuthInitialTab('login'); setActiveView('auth'); }}
                    className="text-xs font-bold text-slate-950 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 px-3.5 py-1.5 rounded-lg shadow-md hover:scale-102 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-950" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </header>

            {/* Scrollable Work Area */}
            <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 relative text-left">
            
            {/* Display banner error if download is abusive */}
            {downloadError && (
              <div className="bg-rose-950/40 border border-rose-500/35 text-rose-300 rounded-xl p-4 flex items-start gap-3 relative animate-bounce z-40">
                <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-bold text-white">Rate-Limit Security Alert</h4>
                  <p className="text-xs leading-relaxed mt-1">{downloadError}</p>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------------------- */}
            {/* WORKSPACE SUBVIEW: LEGAL PAGES */}
            {/* ---------------------------------------------------------------------- */}
            {activeView === 'legal' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="text-left">
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">UdioSunova Legal Compliance</span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Policies & Guidelines</h1>
                  </div>
                  <button
                    onClick={() => setActiveView('dashboard')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl text-sm transition-all cursor-pointer"
                  >
                    Back to Library
                  </button>
                </div>

                <div className="flex gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
                  <button
                    onClick={() => setActiveLegalSection('terms')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      activeLegalSection === 'terms' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Terms of Service
                  </button>
                  <button
                    onClick={() => setActiveLegalSection('privacy')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      activeLegalSection === 'privacy' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Privacy Policy
                  </button>
                  <button
                    onClick={() => setActiveLegalSection('refund')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      activeLegalSection === 'refund' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Refund Policy
                  </button>
                  <button
                    onClick={() => setActiveLegalSection('cancellation')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      activeLegalSection === 'cancellation' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Cancellation Policy
                  </button>
                  <button
                    onClick={() => setActiveLegalSection('copyright')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      activeLegalSection === 'copyright' || activeLegalSection === 'dmca' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    DMCA Policy
                  </button>
                  <button
                    onClick={() => setActiveLegalSection('acceptable-use')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      activeLegalSection === 'acceptable-use' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Acceptable Use
                  </button>
                  <button
                    onClick={() => setActiveLegalSection('contact')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      activeLegalSection === 'contact' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Contact Support
                  </button>
                </div>

                <LegalViews section={activeLegalSection} />
              </div>
            )}

            {/* ---------------------------------------------------------------------- */}
            {/* WORKSPACE SUBVIEW: UDIOSUNOVA ANALOG TOOLS SUITE */}
            {/* ---------------------------------------------------------------------- */}
            {activeView === 'tools' && (
              <div className="space-y-6 text-left">
                
                {selectedToolId === 'udio-downloader' || selectedToolId === 'suno-downloader' ? (
                  <UdioDownloaderView
                    user={user}
                    library={library}
                    isImporting={isImporting}
                    importError={importError}
                    importJobStatus={importJobStatus}
                    onImportLink={(url) => {
                      triggerImportOfUrl(url, false);
                    }}
                    onSelectTrack={(trackId) => {
                      setSelectedTrackId(trackId);
                      setActiveView('dashboard');
                    }}
                    onDeleteTrack={(trackId) => {
                      handleDeleteTrack(trackId);
                    }}
                    onDownloadTrack={handleDownloadTrack}
                    setShowPricingModal={setShowPricingModal}
                    onBack={() => {
                      setSelectedToolId(null);
                    }}
                  />
                ) : (
                  <>
                    {/* Header row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/40 pb-6">
                      <div>
                        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">UdioSunova Analog® DSP Suite</span>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                          {selectedToolId ? (
                            selectedToolId === 'restorer' ? 'Spectrum Restorer & Artifact Filter' :
                            selectedToolId === 'stems' ? 'HTDemucs-v4 Stem Separator Mixer' :
                            selectedToolId === 'mastering' ? 'Analog Tape Mastering Chain' :
                            selectedToolId === 'spatial' ? '3D Virtual Atmos Spatializer' :
                            'Lossless ID3 Tag Transcoder'
                          ) : 'Professional AI Audio Tools'}
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                          {selectedToolId ? 'Adjust UdioSunova model weights, select a source track, and render high-fidelity studio formats.' : 'Improve audio quality, isolate stems, master for loudness, and convert formats with one-click UdioSunova Analog processing.'}
                        </p>
                      </div>

                      {selectedToolId && (
                        <button
                          onClick={() => {
                            setSelectedToolId(null);
                            setToolProcessed(false);
                            setIsToolProcessing(false);
                          }}
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <ArrowRight className="w-3.5 h-3.5 rotate-180 text-cyan-400" />
                          <span>Back to Tools Suite</span>
                        </button>
                      )}
                    </div>

                    {/* --- 1. TOOLS SELECTION GRID (selectedToolId === null) --- */}
                    {selectedToolId === null ? (
                      <AudioToolsListView
                        onSelectTool={(toolId) => {
                          setSelectedToolId(toolId as any);
                        }}
                      />
                    ) : (
                      
                      /* --- 2. INDIVIDUAL TOOL STUDIO WORKSPACE (selectedToolId !== null) --- */
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in text-left">
                    
                    {/* LEFT PANEL: CONFIGURATION PARAMETERS & FILE (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                      
                      {/* Song Selection Card */}
                      <div className="bg-[#071426]/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                          <Music className="w-3.5 h-3.5 text-cyan-400" />
                          <span>1. Select Source Audio Track</span>
                        </h3>
                        
                        <div className="space-y-3">
                          <label className="text-[11px] text-slate-400">Choose a track from your Audio Library:</label>
                          <select 
                            id="tool-track-select"
                            value={toolTrackId}
                            onChange={(e) => {
                              setToolTrackId(e.target.value);
                              setToolProcessed(false);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="">-- Choose Library Track --</option>
                            {library.filter(t => t.status === AudioStatus.COMPLETE).map(t => (
                              <option key={t.id} value={t.id}>{t.title} - {t.artist} ({t.sourcePlatform})</option>
                            ))}
                            <option value="demo_retro">Demo Track: Retro Suno Wave</option>
                          </select>
                        </div>

                        {/* Selected Track Metadata Display */}
                        {toolTrackId && (
                          <div className="bg-slate-950/70 border border-slate-800/60 p-3.5 rounded-xl flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-800 shrink-0 bg-slate-900 flex items-center justify-center">
                              {toolTrackId === 'demo_retro' ? (
                                <Disc className="w-6 h-6 text-cyan-400 animate-spin-slow" />
                              ) : (
                                <img 
                                  src={library.find(t => t.id === toolTrackId)?.coverUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=128&h=128&q=80'} 
                                  alt="Selected Track Cover" 
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-white text-xs truncate">
                                {toolTrackId === 'demo_retro' ? 'Retro Suno Wave' : library.find(t => t.id === toolTrackId)?.title}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {toolTrackId === 'demo_retro' ? 'Synthetic Analog' : library.find(t => t.id === toolTrackId)?.artist}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* PARAMETERS FORM PANEL */}
                      <div className="bg-[#071426]/60 border border-slate-800 rounded-2xl p-5 space-y-6">
                        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                          <span>2. Model Hyperparameters</span>
                        </h3>

                        {/* A. Dynamic parameters depending on chosen tool */}
                        
                        {/* RESTORER INTERACTION BLOCK */}
                        {selectedToolId === 'restorer' && (
                          <div className="space-y-5">
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-300">Ultra High Exciter Level</span>
                                <span className="text-[#38BDF8] font-mono font-bold">{enhancerLevel}%</span>
                              </div>
                              <input 
                                type="range" min="0" max="100" value={enhancerLevel} 
                                onChange={(e) => setEnhancerLevel(Number(e.target.value))}
                                className="w-full accent-cyan-400 cursor-pointer h-1 bg-slate-950 rounded-lg appearance-none"
                              />
                              <p className="text-[10px] text-slate-500">Reconstruct spectral detail between 15kHz and 22kHz to counteract MP3 compression roll-off.</p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-300">Analog Tube Saturation Warmth</span>
                                <span className="text-[#38BDF8] font-mono font-bold">{harmonicWarmth}%</span>
                              </div>
                              <input 
                                type="range" min="0" max="100" value={harmonicWarmth} 
                                onChange={(e) => setHarmonicWarmth(Number(e.target.value))}
                                className="w-full accent-cyan-400 cursor-pointer h-1 bg-slate-950 rounded-lg appearance-none"
                              />
                              <p className="text-[10px] text-slate-500">Inject harmonic even-order tube warmth to enrich muddy mid-range vocal frequencies.</p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-300">De-Compression Artifact Gating</span>
                                <span className="text-[#38BDF8] font-mono font-bold">{decompressionDepth}%</span>
                              </div>
                              <input 
                                type="range" min="0" max="100" value={decompressionDepth} 
                                onChange={(e) => setDecompressionDepth(Number(e.target.value))}
                                className="w-full accent-cyan-400 cursor-pointer h-1 bg-slate-950 rounded-lg appearance-none"
                              />
                              <p className="text-[10px] text-slate-500">Applies deep UdioSunova Analog expansion to release phase squashing and muddy multi-band compression spikes.</p>
                            </div>
                          </div>
                        )}

                        {/* STEMS INTERACTION BLOCK */}
                        {selectedToolId === 'stems' && (
                          <div className="space-y-5">
                            <p className="text-xs text-slate-400 bg-slate-950/50 p-3 rounded-lg border border-slate-900">
                              Adjust the volume sliders below to isolate or mix individual stems once separated. Click Mute (M) or Solo (S) to focus on elements.
                            </p>
                            
                            {/* Vocal Stem slider */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                                  Vocals (Acapella)
                                </span>
                                <span className="text-[#38BDF8] font-mono font-bold">{vocalLevel}%</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="range" min="0" max="120" value={vocalLevel} 
                                  onChange={(e) => setVocalLevel(Number(e.target.value))}
                                  className="w-full accent-cyan-400 cursor-pointer h-1 bg-slate-950 rounded-lg appearance-none"
                                />
                                <button 
                                  onClick={() => setVocalLevel(prev => prev === 0 ? 100 : 0)}
                                  className={`text-[10px] font-bold px-2 py-1 rounded border transition-all ${vocalLevel === 0 ? 'bg-rose-950 text-rose-400 border-rose-500/20' : 'bg-slate-950 text-slate-400 border-slate-800'}`}
                                >
                                  MUTE
                                </button>
                              </div>
                            </div>

                            {/* Drums Stem slider */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-pink-400" />
                                  Drums (Beat & Transients)
                                </span>
                                <span className="text-pink-400 font-mono font-bold">{drumLevel}%</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="range" min="0" max="120" value={drumLevel} 
                                  onChange={(e) => setDrumLevel(Number(e.target.value))}
                                  className="w-full accent-pink-400 cursor-pointer h-1 bg-slate-950 rounded-lg appearance-none"
                                />
                                <button 
                                  onClick={() => setDrumLevel(prev => prev === 0 ? 100 : 0)}
                                  className={`text-[10px] font-bold px-2 py-1 rounded border transition-all ${drumLevel === 0 ? 'bg-rose-950 text-rose-400 border-rose-500/20' : 'bg-slate-950 text-slate-400 border-slate-800'}`}
                                >
                                  MUTE
                                </button>
                              </div>
                            </div>

                            {/* Bass Stem slider */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                                  Bass (Sub & Bassline)
                                </span>
                                <span className="text-[#10B981] font-mono font-bold">{bassLevel}%</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="range" min="0" max="120" value={bassLevel} 
                                  onChange={(e) => setBassLevel(Number(e.target.value))}
                                  className="w-full accent-emerald-500 cursor-pointer h-1 bg-slate-950 rounded-lg appearance-none"
                                />
                                <button 
                                  onClick={() => setBassLevel(prev => prev === 0 ? 100 : 0)}
                                  className={`text-[10px] font-bold px-2 py-1 rounded border transition-all ${bassLevel === 0 ? 'bg-rose-950 text-rose-400 border-rose-500/20' : 'bg-slate-950 text-slate-400 border-slate-800'}`}
                                >
                                  MUTE
                                </button>
                              </div>
                            </div>

                            {/* Melody/Instruments Stem slider */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                                  Melody (Keys/Guitars/Synth)
                                </span>
                                <span className="text-purple-400 font-mono font-bold">{melodyLevel}%</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="range" min="0" max="120" value={melodyLevel} 
                                  onChange={(e) => setMelodyLevel(Number(e.target.value))}
                                  className="w-full accent-purple-400 cursor-pointer h-1 bg-slate-950 rounded-lg appearance-none"
                                />
                                <button 
                                  onClick={() => setMelodyLevel(prev => prev === 0 ? 100 : 0)}
                                  className={`text-[10px] font-bold px-2 py-1 rounded border transition-all ${melodyLevel === 0 ? 'bg-rose-950 text-rose-400 border-rose-500/20' : 'bg-slate-950 text-slate-400 border-slate-800'}`}
                                >
                                  MUTE
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ANALOG MASTERING BLOCK */}
                        {selectedToolId === 'mastering' && (
                          <div className="space-y-5">
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-300">1/2" Studer Tape Saturation Drive</span>
                                <span className="text-[#38BDF8] font-mono font-bold">{tapeSaturation}%</span>
                              </div>
                              <input 
                                type="range" min="0" max="100" value={tapeSaturation} 
                                onChange={(e) => setTapeSaturation(Number(e.target.value))}
                                className="w-full accent-cyan-400 cursor-pointer h-1 bg-slate-950 rounded-lg appearance-none"
                              />
                              <p className="text-[10px] text-slate-500">Drives the vintage tape simulator to achieve warm even-harmonic distortion and natural compression.</p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-300">Stereo Spatial Image Expansion</span>
                                <span className="text-[#38BDF8] font-mono font-bold">{stereoWidth}%</span>
                              </div>
                              <input 
                                type="range" min="50" max="200" value={stereoWidth} 
                                onChange={(e) => setStereoWidth(Number(e.target.value))}
                                className="w-full accent-cyan-400 cursor-pointer h-1 bg-slate-950 rounded-lg appearance-none"
                              />
                              <p className="text-[10px] text-slate-500">Expands the side signals (Mid/Side processing) for an immersive, ultra-wide soundstage representation.</p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-300">Loudness Target Limit (LUFS)</span>
                                <span className="text-[#38BDF8] font-mono font-bold">{loudnessThreshold} dB</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="range" min="-18" max="-8" step="0.5" value={loudnessThreshold} 
                                  onChange={(e) => setLoudnessThreshold(Number(e.target.value))}
                                  className="w-full accent-cyan-400 cursor-pointer h-1 bg-slate-950 rounded-lg appearance-none"
                                />
                              </div>
                              <p className="text-[10px] text-slate-500">Commercial target. -14 is standard for Spotify; -10 or -9 is professional club standard.</p>
                            </div>
                          </div>
                        )}

                        {/* SPATIAL BLOCK */}
                        {selectedToolId === 'spatial' && (
                          <div className="space-y-5">
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-300">Virtual Room Soundstage Size</span>
                                <span className="text-[#38BDF8] font-mono font-bold">{spatialSize} meters</span>
                              </div>
                              <input 
                                type="range" min="10" max="150" value={spatialSize} 
                                onChange={(e) => setSpatialSize(Number(e.target.value))}
                                className="w-full accent-cyan-400 cursor-pointer h-1 bg-slate-950 rounded-lg appearance-none"
                              />
                              <p className="text-[10px] text-slate-500">Controls virtual space boundaries and early reflections delay vectors.</p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-300">HRTF Head Resonance Coefficient</span>
                                <span className="text-[#38BDF8] font-mono font-bold">{headResonance}%</span>
                              </div>
                              <input 
                                type="range" min="10" max="100" value={headResonance} 
                                onChange={(e) => setHeadResonance(Number(e.target.value))}
                                className="w-full accent-cyan-400 cursor-pointer h-1 bg-slate-950 rounded-lg appearance-none"
                              />
                              <p className="text-[10px] text-slate-500">Adapts headphone binaural panning matrixes for realistic anatomical head spacing filters.</p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-300">Acoustic Ambience Level</span>
                                <span className="text-[#38BDF8] font-mono font-bold">{ambienceLevel}%</span>
                              </div>
                              <input 
                                type="range" min="0" max="100" value={ambienceLevel} 
                                onChange={(e) => setAmbienceLevel(Number(e.target.value))}
                                className="w-full accent-cyan-400 cursor-pointer h-1 bg-slate-950 rounded-lg appearance-none"
                              />
                              <p className="text-[10px] text-slate-500">Controls immersive wet/dry ratio of diffuse acoustic fields.</p>
                            </div>
                          </div>
                        )}

                        {/* TAG CONVERTER BLOCK */}
                        {selectedToolId === 'converter' && (
                          <div className="space-y-5">
                            
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-slate-300 block">Source Audio Container</label>
                              <select 
                                value={convSourceFormat} onChange={(e) => setConvSourceFormat(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                              >
                                <option value="MP3">MP3 (MPEG Audio File)</option>
                                <option value="WAV">WAV (Waveform Lossless)</option>
                                <option value="FLAC">FLAC (Free Lossless Audio Codec)</option>
                                <option value="M4A">M4A (Apple AAC Container)</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-slate-300 block">Target Master Container</label>
                              <select 
                                value={convTargetFormat} onChange={(e) => setConvTargetFormat(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                              >
                                <option value="WAV">WAV (Broadcast Wave Lossless 32-bit Float)</option>
                                <option value="FLAC">FLAC (Master Reference 24-bit Lossless)</option>
                                <option value="MP3">MP3 LAME (Standard 320kbps Constant Bitrate)</option>
                                <option value="ALAC">ALAC (Apple Lossless Audio Codec)</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-slate-300 block">Encoder Precision Quality</label>
                              <select 
                                value={convQuality} onChange={(e) => setConvQuality(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                              >
                                <option value="Lossless 24-bit/48kHz">Master Gold (24-bit / 48.0kHz PCM)</option>
                                <option value="Lossless 16-bit/44.1kHz">RedBook Lossless (16-bit / 44.1kHz CD Quality)</option>
                                <option value="HQ Constant 320kbps">HQ Constant 320kbps (MP3 LAME encoder)</option>
                              </select>
                              <p className="text-[10px] text-slate-500">Determines high-fidelity container quantization and dithering parameters inside FFmpeg.</p>
                            </div>

                          </div>
                        )}

                        {/* Execute Button */}
                        <div className="pt-2">
                          <button
                            id="execute-tool-pipeline"
                            disabled={isToolProcessing || !toolTrackId}
                            onClick={handleRunTool}
                            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:from-slate-800 disabled:to-slate-850 text-slate-950 disabled:text-slate-500 font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.15)] disabled:shadow-none active:scale-98 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2 text-xs"
                          >
                            {isToolProcessing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>DSP Engine Processing...</span>
                              </>
                            ) : (
                              <>
                                <Cpu className="w-4 h-4 text-slate-950" />
                                <span>Execute UdioSunova Analog® DSP Pipeline</span>
                              </>
                            )}
                          </button>
                          {!toolTrackId && (
                            <p className="text-[10px] text-rose-400 text-center mt-2">
                              ⚠️ Please select a library track above to unlock execution.
                            </p>
                          )}
                        </div>

                      </div>

                    </div>

                    {/* RIGHT PANEL: INTERACTIVE DSP TELEMETRY, PROGRESS & RENDERER (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                      
                      {/* Interactive DSP Panel */}
                      <div className="bg-[#071426]/60 border border-slate-800 rounded-2xl p-6 space-y-6 relative overflow-hidden">
                        
                        <div className="absolute top-0 right-0 w-80 h-80 bg-[#2563EB]/5 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                            {isToolProcessing ? 'DSP STATUS: SYNTHESIZING' : (toolProcessed ? 'DSP STATUS: COMPILED' : 'DSP STATUS: READY')}
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                            <span className={`w-1.5 h-1.5 rounded-full ${isToolProcessing ? 'bg-amber-400 animate-pulse' : (toolProcessed ? 'bg-emerald-400' : 'bg-slate-600')}`} />
                            {isToolProcessing ? 'Running Weights' : (toolProcessed ? 'Processing Completed' : 'Idle')}
                          </span>
                        </div>

                        {/* Render active progress or static standby waveform */}
                        {isToolProcessing ? (
                          <div className="space-y-5 py-6">
                            {/* Spinning loader with progress percentage */}
                            <div className="flex flex-col items-center justify-center gap-4 text-center">
                              <div className="relative w-24 h-24 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                  <circle cx="48" cy="48" r="40" className="stroke-slate-950 stroke-[6] fill-none" />
                                  <circle cx="48" cy="48" r="40" className="stroke-[#38BDF8] stroke-[6] fill-none transition-all duration-300" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={2 * Math.PI * 40 * (1 - toolProgress / 100)} />
                                </svg>
                                <span className="absolute text-lg font-black font-mono text-white">
                                  {toolProgress}%
                                </span>
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-sm font-extrabold text-white">Synthesizing audio nodes</h4>
                                <p className="text-[11px] text-slate-400">Running localized fast Fourier calculations. Stand by...</p>
                              </div>
                            </div>

                            {/* Horizonal loading bar */}
                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300" style={{ width: `${toolProgress}%` }} />
                            </div>
                          </div>
                        ) : toolProcessed ? (
                          <div className="space-y-5 py-2 text-center border border-emerald-500/10 bg-emerald-950/5 rounded-2xl p-4 animate-fade-in">
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-12 h-12 bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/5">
                                <Check className="w-6 h-6" />
                              </div>
                              <div className="text-left">
                                <h4 className="text-sm font-extrabold text-white">DSP Calculations Fully Rendered!</h4>
                                <p className="text-[11px] text-slate-400">The high-fidelity output waveform buffer is ready for evaluation.</p>
                              </div>
                            </div>

                            {/* Comparison Audio Player Module */}
                            <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 mt-4 space-y-4 text-left relative overflow-hidden">
                              
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                                  <Volume2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                                  Comparison Audition Studio
                                </p>
                                
                                {/* A/B Bypass Button */}
                                <div className="bg-slate-900 border border-slate-800 p-0.5 rounded-lg flex gap-1">
                                  <button
                                    onClick={() => setIsBypassed(true)}
                                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${isBypassed ? 'bg-slate-800 text-amber-400 border border-amber-500/15' : 'text-slate-500'}`}
                                  >
                                    Original (Bypass)
                                  </button>
                                  <button
                                    onClick={() => setIsBypassed(false)}
                                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${!isBypassed ? 'bg-[#2563EB]/20 text-[#38BDF8] border border-[#2563EB]/25 font-black' : 'text-slate-500'}`}
                                  >
                                    Processed (DSP)
                                  </button>
                                </div>
                              </div>

                              {/* Interactive active comparison indicator */}
                              <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-850 rounded-lg">
                                <div className="flex items-center gap-2.5">
                                  <div className={`p-1.5 rounded bg-slate-950 border border-slate-850 ${!isBypassed ? 'text-[#38BDF8] animate-pulse' : 'text-slate-500'}`}>
                                    <Disc className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-bold text-white uppercase font-mono">
                                      {isBypassed ? 'Bypassed Waveform Stream' : 'Active Enhanced Output'}
                                    </p>
                                    <p className="text-[9px] text-slate-500 leading-none mt-1">
                                      {isBypassed ? 'Standard MP3 format (192kbps frequency roll-off)' : 'Upgraded Multi-channel UdioSunova Analog harmonics'}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-black text-cyan-400 bg-cyan-950/50 border border-cyan-500/10 px-2 py-0.5 rounded animate-pulse">
                                    {!isBypassed ? 'HI-RES ACTIVE' : 'BYPASS ACTIVE'}
                                  </span>
                                </div>
                              </div>

                              {/* Mock Waveform Visualizer comparison bars */}
                              <div className="h-12 bg-slate-900/40 rounded-lg border border-slate-900/80 flex items-end justify-between p-2 gap-[2px] overflow-hidden">
                                {Array.from({ length: 44 }).map((_, idx) => {
                                  // Random height vectors but multiplier depending on bypass state
                                  const randomFactor = Math.sin(idx * 0.4) * 0.4 + 0.6;
                                  const baseVal = Math.floor(randomFactor * 100);
                                  const processMultiplier = isBypassed ? 0.6 : 1.25; // processors are higher dynamic range
                                  const heightPercent = Math.min(100, Math.max(10, Math.floor(baseVal * processMultiplier)));
                                  const colorClass = isBypassed 
                                    ? 'bg-slate-700/80' 
                                    : (selectedToolId === 'restorer' ? 'bg-cyan-400 shadow-[0_0_5px_#22d3ee]' : 
                                       selectedToolId === 'stems' ? 'bg-blue-500' :
                                       selectedToolId === 'mastering' ? 'bg-purple-500' : 'bg-pink-400');

                                  return (
                                    <div 
                                      key={idx} 
                                      style={{ height: `${heightPercent}%` }} 
                                      className={`w-full rounded-t-sm transition-all duration-300 ${colorClass}`}
                                    />
                                  );
                                })}
                              </div>

                              {/* Export / Download Box */}
                              <div className="pt-2 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="text-[10px] text-slate-500 max-w-sm">
                                  <p>✨ Preview player operates in safe browser environment.</p>
                                  <p className="mt-0.5 font-semibold">Ready to export to your library?</p>
                                </div>

                                <div className="flex gap-2 w-full sm:w-auto">
                                  <button
                                    onClick={() => {
                                      // Free MP3 format download
                                      alert("Downloading processed track in High Quality MP3 (320kbps). Lossless options can be downloaded using WAV format.");
                                      const dummyUrl = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
                                      const link = document.createElement('a');
                                      link.href = dummyUrl;
                                      link.setAttribute('download', `UdioSunovaAnalog_${toolTrackId === 'demo_retro' ? 'Retro_Wave' : 'Output'}.mp3`);
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                    className="flex-1 sm:flex-none text-xs font-bold bg-slate-900 border border-slate-800 hover:border-slate-700 text-white px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download MP3</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      if (user?.plan === Plan.FREE) {
                                        setShowPricingModal(true);
                                      } else {
                                        alert("Lossless Studio WAV format download initiated successfully. Generating package...");
                                        const dummyUrl = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
                                        const link = document.createElement('a');
                                        link.href = dummyUrl;
                                        link.setAttribute('download', `UdioSunovaAnalog_${toolTrackId === 'demo_retro' ? 'Retro_Wave' : 'Output'}_Studio.wav`);
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                      }
                                    }}
                                    className="flex-1 sm:flex-none text-xs font-black bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 px-3 py-2 rounded-xl transition-all hover:scale-102 cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-cyan-400/10"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Export WAV Master</span>
                                    {user?.plan === Plan.FREE && <Lock className="w-2.5 h-2.5 text-slate-900" />}
                                  </button>
                                </div>
                              </div>

                            </div>
                          </div>
                        ) : (
                          /* Standby static screen */
                          <div className="py-14 text-center border border-dashed border-slate-800 rounded-2xl p-6 text-slate-500">
                            <Sliders className="w-8 h-8 mx-auto mb-3 text-slate-600 animate-pulse" />
                            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">
                              UdioSunova Analog DSP Processor Standby
                            </h4>
                            <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                              Select a library track or demo file on the left side, configure custom settings, and click "Execute UdioSunova Analog DSP Pipeline" to start calculations.
                            </p>
                          </div>
                        )}

                        {/* TERMINAL / LOGS CONSOLE PANEL */}
                        <div className="bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden text-left shadow-2xl">
                          <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-950 shrink-0">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                              UdioSunova Analog Live Telemetry Logs
                            </span>
                            <div className="flex gap-1">
                              <span className="w-2 h-2 rounded-full bg-[#EF4444]/60" />
                              <span className="w-2 h-2 rounded-full bg-[#F59E0B]/60" />
                              <span className="w-2 h-2 rounded-full bg-[#10B981]/60" />
                            </div>
                          </div>

                          <div id="telemetry-logs-window" className="p-4 font-mono text-[10px] space-y-2 h-44 overflow-y-auto bg-slate-950 text-emerald-400 scrollbar-thin scrollbar-thumb-slate-800">
                            {toolLogs.length === 0 ? (
                              <p className="text-slate-600 italic">SYSTEM_INFO: Telemetry stream idle. Awaiting hardware allocation...</p>
                            ) : (
                              toolLogs.map((log, idx) => (
                                <p key={idx} className="leading-relaxed border-l-2 border-emerald-500/20 pl-2 animate-fade-in">
                                  <span className="text-slate-500 select-none mr-1">[{new Date().toLocaleTimeString()}]</span> {log}
                                </p>
                              ))
                            )}
                          </div>
                        </div>

                      </div>

                    </div>

                  </div>
                )}
              </>
            )}

          </div>
        )}

            {/* ---------------------------------------------------------------------- */}
            {/* WORKSPACE SUBVIEW: MAIN LIBRARY DASHBOARD */}
            {/* ---------------------------------------------------------------------- */}
            {activeView === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/40 pb-6">
                  <div className="text-left">
                    <span className="text-xs font-semibold text-[#38BDF8] uppercase tracking-widest">Dashboard Workspace</span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      Studio Audio Library
                    </h1>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      id="studio-upload-btn"
                      onClick={triggerFileInput}
                      className="flex-1 sm:flex-none text-xs font-semibold bg-slate-900/50 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white px-4 py-2.5 rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
                    >
                      <Upload className="w-4 h-4 text-[#38BDF8]" />
                      <span>Upload Audio</span>
                    </button>
                  </div>
                </div>

                {/* Central Importer Input - Studio Audio Library */}
                <form onSubmit={handleImportLink} className="max-w-2xl mr-auto w-full bg-slate-900/60 border border-sky-400/20 rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-[0_0_30px_rgba(56,189,248,0.05)] focus-within:border-cyan-400/40 focus-within:shadow-[0_0_30px_rgba(56,189,248,0.1)] transition-all">
                  <div className="flex-1 min-w-0 flex items-center px-3 gap-2">
                    <Globe className="w-5 h-5 text-slate-500 shrink-0" />
                    <input 
                      id="dashboard-import-url"
                      type="url" 
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      placeholder="Paste your public Udio, Suno or audio link..."
                      className="w-full min-w-0 bg-transparent border-none text-white placeholder-slate-500 focus:outline-none text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      id="dashboard-import-btn"
                      type="submit"
                      disabled={isImporting || !importUrl.trim()}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-semibold px-6 py-2.5 rounded-xl hover:scale-102 active:scale-98 disabled:opacity-50 transition-all cursor-pointer text-sm flex items-center justify-center gap-2 shadow-lg shrink-0"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Importing...</span>
                        </>
                      ) : (
                        <>
                          <FolderSync className="w-4 h-4" />
                          <span>Import Track</span>
                        </>
                      )}
                    </button>
                    <button
                      id="dashboard-upload-btn-bar"
                      type="button"
                      onClick={triggerFileInput}
                      className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/80 font-semibold px-4 py-2.5 rounded-xl hover:scale-102 active:scale-98 transition-all cursor-pointer text-sm shrink-0 flex items-center justify-center"
                      title="Upload Audio Manually"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Import / Upload Progress Widget inside Dashboard */}
                {isImporting && importJobStatus && (
                  <div className="bg-[#071426]/75 border border-sky-400/25 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-3 animate-pulse text-left relative overflow-hidden">
                    <div className="absolute top-0 left-0 bottom-0 bg-sky-500/5" style={{ width: `${importJobStatus.progress}%` }} />
                    <div className="flex items-center justify-between text-xs font-bold relative z-10">
                      <span className="text-cyan-400 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {importJobStatus.status === AudioStatus.PROCESSING ? 'Processing conversion' : 'Resolving public stream URL'}
                      </span>
                      <span className="text-white bg-slate-900 px-2 py-0.5 rounded font-mono border border-slate-800">
                        {importJobStatus.progress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden relative z-10">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300" style={{ width: `${importJobStatus.progress}%` }} />
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 relative z-10">
                      {importJobStatus.message}
                    </p>
                  </div>
                )}

                {isUploading && (
                  <div className="bg-[#071426]/75 border border-cyan-500/25 rounded-2xl p-5 backdrop-blur-xl shadow-xl text-left flex items-center gap-3 animate-pulse">
                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Transmitting Manual Audio Stream...</h4>
                      <p className="text-xs text-slate-400">Computing checksums and preparing preview waveforms.</p>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="bg-rose-950/30 border border-rose-500/20 text-rose-300 rounded-xl p-3.5 text-xs text-left flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold">Upload Rejected</p>
                      <p>{uploadError}</p>
                    </div>
                  </div>
                )}

                {/* Filters and Search Bar row */}
                <div className="flex flex-col lg:flex-row items-center gap-4 justify-between">
                  
                  {/* Search input */}
                  <div className="w-full lg:w-80 bg-slate-900/50 border border-slate-700/50 focus-within:border-[#2563EB] rounded-lg px-3 py-2 flex items-center gap-2.5 transition-all">
                    <Search className="w-4 h-4 text-slate-500" />
                    <input 
                      id="search-tracks-input"
                      type="text"
                      placeholder="Search Title or Artist..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none text-white text-sm placeholder-slate-500 focus:outline-none w-full"
                    />
                  </div>

                  {/* Filter tabs */}
                  <div className="flex gap-1.5 bg-slate-900/60 p-1 rounded-lg border border-slate-800 overflow-x-auto w-full lg:w-auto">
                    {(['all', 'completed', 'processing', 'failed', 'uploaded'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setSelectedFilter(filter)}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all cursor-pointer shrink-0 ${
                          selectedFilter === filter 
                            ? 'bg-[#2563EB]/10 text-[#38BDF8] border border-[#2563EB]/25' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                </div>

                {/* Library Track Cards List */}
                {isLoadingLibrary ? (
                  <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500 text-sm font-semibold">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                    <span>Accessing Secure UdioSunova Databases...</span>
                  </div>
                ) : getFilteredLibrary().length === 0 ? (
                  /* Drag and Drop Empty State Zone */
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`py-20 border border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-4 transition-all ${
                      dragActive ? 'border-cyan-400 bg-cyan-950/10 shadow-[0_0_20px_rgba(34,211,238,0.05)]' : 'border-slate-800 hover:border-slate-700 bg-slate-900/10'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                      <Upload className="w-5 h-5 text-[#38BDF8]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white">Drag and Drop Audio Files Here</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        Drag MP3, WAV, FLAC, or M4A files or click below to select from your device.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={triggerFileInput}
                        className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer shadow-lg shadow-[#2563EB]/15"
                      >
                        Select Audio File
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Tracks grid list */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredLibrary().map((track) => (
                      <div 
                        key={track.id} 
                        id={`track-card-${track.id}`}
                        className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-xl hover:bg-slate-800/10 transition-all flex flex-col justify-between text-left relative overflow-hidden group"
                      >
                        {/* Status indicator line */}
                        <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                          track.status === AudioStatus.COMPLETE ? 'bg-[#38BDF8]' : (track.status === AudioStatus.FAILED ? 'bg-rose-500' : 'bg-amber-400 animate-pulse')
                        }`} />

                        {/* Top Metadata specs */}
                        <div className="space-y-4">
                          <div className="flex gap-3.5">
                            
                            {/* Track Cover preview */}
                            <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-800 shadow relative">
                              <img 
                                src={track.coverUrl} 
                                alt={track.title} 
                                className="w-full h-full object-cover"
                              />
                              {track.status === AudioStatus.PROCESSING && (
                                <div className="absolute inset-0 bg-[#030712]/75 flex items-center justify-center">
                                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                                </div>
                              )}
                            </div>

                            {/* Details text */}
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-white truncate text-base group-hover:text-[#38BDF8] transition-colors">
                                {track.title}
                              </h3>
                              <p className="text-xs text-slate-400 truncate">
                                {track.artist}
                              </p>
                              
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="text-[9px] uppercase font-bold text-[#38BDF8] px-1.5 py-0.5 rounded bg-[#2563EB]/10 border border-[#2563EB]/20">
                                  {track.sourcePlatform}
                                </span>
                                <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-600" />
                                  {formatDuration(track.duration)}
                                </span>
                              </div>
                            </div>

                          </div>

                          {/* Dynamic job progression reporting if track is converting */}
                          {track.status !== AudioStatus.COMPLETE && track.status !== AudioStatus.FAILED && (
                            <div className="space-y-1.5 pt-2">
                              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 animate-pulse w-[45%]" />
                              </div>
                              <p className="text-[10px] font-mono text-slate-500 italic truncate">
                                Enqueued in pipeline worker...
                              </p>
                            </div>
                          )}

                          {track.status === AudioStatus.FAILED && (
                            <div className="bg-rose-950/20 border border-rose-500/10 text-rose-400 text-[10px] rounded p-2 flex items-start gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400 mt-0.5" />
                              <span className="truncate">{track.errorMessage || 'Link bypass restricted or unresolvable.'}</span>
                            </div>
                          )}
                        </div>

                        {/* Bottom Actions Row */}
                        <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-800/40">
                          <button
                            id={`open-studio-btn-${track.id}`}
                            onClick={() => openTrackInStudio(track.id)}
                            className="flex-1 bg-[#2563EB] hover:bg-[#1d4ed8] text-xs text-white font-semibold py-2 rounded-lg text-center transition-all cursor-pointer"
                          >
                            Open Studio
                          </button>
                          
                          <button
                            id={`quick-download-btn-${track.id}`}
                            onClick={() => handleDownloadTrack(track.id, 'mp3')}
                            disabled={track.status !== AudioStatus.COMPLETE || isDownloadingId === track.id}
                            className="bg-slate-800 hover:bg-slate-700 text-[#38BDF8] font-bold p-2.5 rounded-lg border border-slate-700/50 transition-all disabled:opacity-30 cursor-pointer text-xs flex items-center justify-center"
                            title="Quick Download MP3"
                          >
                            {isDownloadingId === track.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            id={`delete-track-btn-${track.id}`}
                            onClick={() => handleDeleteTrack(track.id)}
                            className="bg-slate-900/50 hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 p-2.5 rounded-lg border border-slate-800 hover:border-rose-500/15 transition-all cursor-pointer"
                            title="Delete track"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

                {/* ---------------------------------------------------------------------- */}
                {/* DYNAMIC TOOLS DIRECTORY INSIDE DASHBOARD (Below Audio Library) */}
                {/* ---------------------------------------------------------------------- */}
                <div id="dashboard-tools-section" className="pt-12 border-t border-slate-800/40 mt-12 space-y-6">
                  <div className="text-left">
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">UdioSunova Analog® DSP Directory</span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      UdioSunova Audio Tools / Herramientas
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Quick launch one of our dynamic super-resolution rendering, stem isolation, or vintage mastering tools.
                    </p>
                  </div>
                  <AudioToolsListView
                    onSelectTool={(toolId) => {
                      setActiveView('tools');
                      setSelectedToolId(toolId as any);
                    }}
                  />
                </div>

              </div>
            )}

            {/* ---------------------------------------------------------------------- */}
            {/* WORKSPACE SUBVIEW: INDIVIDUAL TRACK STUDIO PAGE */}
            {/* ---------------------------------------------------------------------- */}
            {activeView === 'studio' && getActiveTrack() && (
              <div className="space-y-6 text-left">
                
                {/* Back navigation header */}
                <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                  <button 
                    id="back-to-library-btn"
                    onClick={() => { setActiveView('dashboard'); setSelectedTrackId(null); }}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/20 px-3 py-1.5 rounded-lg border border-transparent hover:border-slate-800/60 transition-all cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5 rotate-180 text-[#38BDF8]" />
                    <span>Back to Library Workspace</span>
                  </button>

                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    STREAM_ID: {getActiveTrack()?.id}
                  </span>
                </div>

                {/* Main Song presentation banner */}
                <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[#2563EB]/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                    <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                      
                      {/* Cover Large image */}
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-slate-800 shadow-2xl shrink-0">
                        <img 
                          src={getActiveTrack()?.coverUrl} 
                          alt={getActiveTrack()?.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Edit Fields */}
                      <div className="space-y-2">
                        {isEditingMeta ? (
                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Track Title</label>
                              <input
                                id="edit-title-input"
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#2563EB] w-64 block"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Artist Name</label>
                              <input
                                id="edit-artist-input"
                                type="text"
                                value={editArtist}
                                onChange={(e) => setEditArtist(e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#2563EB] w-64 block"
                              />
                            </div>
                            <div className="flex gap-2 pt-1">
                              <button
                                id="save-meta-btn"
                                onClick={handleSaveTrackMeta}
                                className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
                              >
                                Save Changes
                              </button>
                              <button
                                id="cancel-meta-btn"
                                onClick={() => setIsEditingMeta(false)}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
                                {getActiveTrack()?.title}
                              </h1>
                              <button
                                id="toggle-edit-meta"
                                onClick={() => setIsEditingMeta(true)}
                                className="text-slate-400 hover:text-white transition-all cursor-pointer p-1 rounded hover:bg-slate-800/50"
                                title="Rename Track"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <p className="text-sm text-slate-400 font-medium">
                              {getActiveTrack()?.artist}
                            </p>

                            <div className="flex items-center gap-3 mt-3 flex-wrap">
                              <span className="text-[10px] uppercase font-bold text-[#38BDF8] px-2 py-0.5 rounded bg-[#2563EB]/10 border border-[#2563EB]/20">
                                {getActiveTrack()?.sourcePlatform}
                              </span>
                              <span className="text-xs text-slate-500 font-mono">
                                duration: {formatDuration(getActiveTrack()?.duration || 0)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                    </div>

                    {/* Exporters actions */}
                    {getActiveTrack()?.status === AudioStatus.COMPLETE && (
                      <div className="flex flex-col gap-2 w-full sm:w-auto min-w-[220px]">
                        <button
                          id="studio-download-mp3"
                          onClick={() => handleDownloadTrack(getActiveTrack()!.id, 'mp3')}
                          className="w-full bg-slate-900/50 hover:bg-slate-800/50 border border-slate-850 hover:border-slate-700 text-slate-300 hover:text-white font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-xs flex items-center justify-between gap-2"
                        >
                          <span className="flex items-center gap-2">
                            <Download className="w-4 h-4 text-[#38BDF8] shrink-0" />
                            <span>Download MP3 format</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">320kbps</span>
                        </button>

                        <button
                          id="studio-export-wav"
                          onClick={() => handleDownloadTrack(getActiveTrack()!.id, 'wav')}
                          className="w-full bg-[#2563EB]/10 hover:bg-[#2563EB]/20 border border-[#2563EB]/20 hover:border-[#2563EB]/30 text-[#38BDF8] font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-xs flex items-center justify-between gap-2 group"
                        >
                          <span className="flex items-center gap-2">
                            <Download className="w-4 h-4 text-[#38BDF8] shrink-0" />
                            <span>Export WAV Studio</span>
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400 group-hover:text-cyan-300 transition-colors uppercase font-bold">
                            Lossless 24b
                          </span>
                        </button>

                        <button
                          id="studio-export-flac"
                          onClick={() => handleDownloadTrack(getActiveTrack()!.id, 'flac')}
                          className="w-full bg-slate-900/50 hover:bg-slate-800/50 border border-slate-850 hover:border-slate-700 text-slate-300 hover:text-white font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-xs flex items-center justify-between gap-2 group"
                        >
                          <span className="flex items-center gap-2">
                            <Download className="w-4 h-4 text-pink-400 shrink-0" />
                            <span>Export FLAC Master</span>
                          </span>
                          <span className="text-[10px] font-mono text-pink-400 group-hover:text-pink-300 transition-colors uppercase font-bold">
                            Ultra 24b
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interactive Waveform Visualizer */}
                {getActiveTrack()?.status === AudioStatus.COMPLETE ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-extrabold tracking-widest text-slate-500 block">
                      UdioSunova Studio Interactive Wave Player
                    </label>
                    <WaveformPlayer 
                      audioUrl={getActiveTrack()?.mp3FileUrl || ''} 
                      waveformPeaks={getActiveTrack()?.waveformJsonUrl ? JSON.parse(getActiveTrack()!.waveformJsonUrl) : undefined}
                      duration={getActiveTrack()?.duration || 180}
                    />
                  </div>
                ) : (
                  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl py-12 text-center text-slate-500 text-sm font-semibold">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mx-auto mb-2" />
                    <span>Track waveform will load once background conversion is complete.</span>
                  </div>
                )}

                {/* Spec metadata panels & Future AI tooling blocks */}
                <MetadataPanel track={getActiveTrack()!} />

                {/* Interactive Footer */}
                <footer className="pt-8 border-t border-slate-800/40 flex flex-col sm:flex-row justify-between items-center opacity-50 gap-4 text-xs">
                  <p className="text-[10px] tracking-widest uppercase font-mono">UDIOSUNOVA AI © 2026 • AI AUDIO STUDIO</p>
                  <div className="flex gap-4 font-mono text-[9px] uppercase">
                    <span className="hover:text-white cursor-pointer" onClick={() => { setActiveView('legal'); setActiveLegalSection('terms'); }}>Legal</span>
                    <span className="hover:text-white cursor-pointer" onClick={() => { setActiveView('legal'); setActiveLegalSection('privacy'); }}>Privacy Policy</span>
                  </div>
                </footer>

              </div>
            )}

          </main>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* PRICING / STRIPE UPGRADE MODAL */}
      {/* ---------------------------------------------------------------------- */}
      {showPricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-left overflow-y-auto max-h-[92vh]">
            {/* Close Button */}
            <button 
              onClick={() => setShowPricingModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800/60 transition-all cursor-pointer z-10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-8 sm:mb-10">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/50 border border-cyan-500/20 px-3 py-1 rounded-full">
                Upgrade / Subscription Plans
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Choose your plan and start creating without limits
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Unlock high-fidelity WAV exports, unlimited imports, and the complete suite of 100% functional UdioSunova Analog DSP Tools.
              </p>
              
              <div className="bg-slate-950/50 border border-cyan-500/10 rounded-2xl p-4 text-xs space-y-2 text-slate-300 text-center">
                <p className="font-semibold text-cyan-300">
                  You are subscribing to software tools for importing, organizing, converting and enhancing your own or authorized AI-generated audio files.
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  UdioSunova AI does not sell music, provide unauthorized downloads, bypass platform restrictions, or claim affiliation with third-party AI music platforms.
                </p>
              </div>
            </div>

            {/* Gorgeous Pricing Grid matching the uploaded design */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              
              {/* Card 1: Core / Free (Light card, exactly matching 'Core' from screenshot) */}
              <div className="bg-[#f8fafc] text-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg border border-slate-200/80 min-h-[580px]">
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Core</h3>
                    <p className="text-xs text-slate-500 mt-1">Upload and import your favorite music.</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">Free</span>
                  </div>

                  <hr className="border-slate-200" />

                  <div>
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase block mb-3">
                      AVAILABLE FEATURES:
                    </span>
                    <ul className="space-y-2.5 text-xs text-slate-600">
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="font-semibold text-slate-800">No credit card required</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="font-semibold text-red-600">25s LIMIT per track</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>Demo processing only</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>Match EQ browser preview</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>5 included monthly processing minutes</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>Import from file: 50mb max upload</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>3 AI platform imports every 24h</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>2 online source imports every 24 hours</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>Preview Audio Restoration</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>Preview Auto Mastering</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>Preview Stem Splitting</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span className="text-slate-500">Batch Downloads not available</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-slate-500 italic">Imported tracks are always featured on community pages</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>Tracks deleted after 1 week</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => setShowPricingModal(false)}
                    className="w-full text-center py-3.5 bg-[#0066fe] hover:bg-[#0055d0] text-white font-bold rounded-xl text-sm transition-all cursor-pointer shadow-md shadow-blue-500/10 active:scale-98"
                  >
                    Continue with Free
                  </button>
                </div>
              </div>

              {/* Card 2: Pro / Premium (Vibrant deep blue card, exactly matching middle 'Pro' card) */}
              <div className="bg-gradient-to-b from-[#09359e] via-[#0b41c4] to-[#1d5bf0] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative min-h-[600px] md:-translate-y-2 border border-blue-400/20">
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-bold">Pro (Monthly)</h3>
                    <p className="text-xs text-blue-200 mt-1">The complete AI suite and high fidelity.</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight">$3.00</span>
                    <span className="text-xs text-blue-200 font-medium">/ month</span>
                  </div>

                  <hr className="border-white/10" />

                  <div>
                    <span className="text-[10px] font-black tracking-wider text-blue-200 uppercase block mb-3">
                      INCLUDES:
                    </span>
                    <ul className="space-y-2 text-xs text-blue-100 max-h-[350px] overflow-y-auto pr-1">
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                        <span className="font-bold text-white">FULL SONGS (5 min max input)</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                        <span>Unlimited Realtime Match EQ, exports, downloads</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                        <span>1000 included monthly processing minutes</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                        <span>Import from file: 256mb max upload</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                        <span>100 AI platform imports every 24h</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                        <span>100 online source imports every 7 days</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                        <span className="font-semibold text-cyan-300">HD exports (WAV, FLAC, MP3 320kbps)</span>
                      </li>
                      
                      {/* Audio Restoration */}
                      <li className="flex items-start gap-2.5 pt-1 border-t border-white/10">
                        <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="font-bold text-white">Audio Restoration for Music and Voice:</span>
                          <div className="flex flex-wrap gap-1 text-[9px] mt-1">
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-blue-100">MP3 MUSIC RESTORATION</span>
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-blue-100">APOLLO VOICE</span>
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-blue-100">NOVASR</span>
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-blue-100">LAVASR</span>
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-blue-100">AUDIOSR</span>
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-blue-100">DAC VAE</span>
                          </div>
                        </div>
                      </li>

                      {/* Auto Mastering */}
                      <li className="flex items-start gap-2.5 pt-1 border-t border-white/10">
                        <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="font-bold text-white">Auto Mastering:</span>
                          <div className="flex flex-wrap gap-1 text-[9px] mt-1">
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-blue-100">MATCH EQ</span>
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-blue-100">STREAMING READY</span>
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-blue-100">-14 LUFS</span>
                          </div>
                        </div>
                      </li>

                      {/* Stem Splitting */}
                      <li className="flex items-start gap-2.5 pt-1 border-t border-white/10">
                        <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="font-bold text-white">Universal Stem Splitting:</span>
                          <p className="text-[10px] text-blue-200">Voice, Bass, Instrumental, Drums, Piano, Guitar, Backing vocals, Denoise, Dereverb</p>
                          <div className="flex flex-wrap gap-1 text-[9px] mt-1">
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-blue-100">SAM AUDIO BASE</span>
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-blue-100">MELBAND ROFORMER</span>
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-blue-100">BS ROFORMER</span>
                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-blue-100">MDX23C</span>
                          </div>
                        </div>
                      </li>

                      {/* Downloads and details */}
                      <li className="flex items-start gap-2.5 pt-1 border-t border-white/10">
                        <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                        <span>Batch Downloads (zip): originals, restored, mastered</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                        <span>Privacy control: Choose which tracks are featured on community pages</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                        <span>Long term tracks storage</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    disabled={isCheckoutLoading}
                    onClick={() => handleStripeCheckout('PRO')}
                    className="w-full text-center py-3.5 bg-white hover:bg-slate-100 text-[#0066fe] font-black rounded-xl text-sm transition-all cursor-pointer shadow-lg disabled:opacity-50 active:scale-98 flex items-center justify-center gap-2"
                  >
                    {isCheckoutLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#0066fe]" />
                        <span>Connecting to Stripe...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#0066fe] animate-pulse" />
                        <span>Subscribe with Stripe ($3/month)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Card 3: Annual / Premium Anual (Light card, matching 'Annual' from screenshot) */}
              <div className="bg-[#f8fafc] text-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg border border-slate-200/80 min-h-[580px]">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Annual</h3>
                      <p className="text-xs text-slate-500 mt-1">Discounted annual subscription.</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-200/50">
                      Save 16%
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">$30.00</span>
                    <span className="text-xs text-slate-500 font-medium">/ year</span>
                  </div>

                  <hr className="border-slate-200" />

                  <div>
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase block mb-3">
                      INCLUDES:
                    </span>
                    <ul className="space-y-2 text-xs text-slate-600 max-h-[350px] overflow-y-auto pr-1">
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="font-bold text-slate-800">FULL SONGS (5 min max input)</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>Unlimited Realtime Match EQ, exports, downloads</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>12000 included annual processing minutes</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>Import from file: 256mb max upload</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>100 AI platform imports every 24h</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>100 online source imports every 7 days</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="font-semibold text-blue-600">HD exports (WAV, FLAC, MP3 320kbps)</span>
                      </li>
                      
                      {/* Audio Restoration */}
                      <li className="flex items-start gap-2.5 pt-1 border-t border-slate-200">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="font-bold text-slate-800">Audio Restoration for Music and Voice:</span>
                          <div className="flex flex-wrap gap-1 text-[9px] mt-1">
                            <span className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">MP3 MUSIC RESTORATION</span>
                            <span className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">APOLLO VOICE</span>
                            <span className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">NOVASR</span>
                            <span className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">LAVASR</span>
                            <span className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">AUDIOSR</span>
                            <span className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">DAC VAE</span>
                          </div>
                        </div>
                      </li>

                      {/* Auto Mastering */}
                      <li className="flex items-start gap-2.5 pt-1 border-t border-slate-200">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="font-bold text-slate-800">Auto Mastering:</span>
                          <div className="flex flex-wrap gap-1 text-[9px] mt-1">
                            <span className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">MATCH EQ</span>
                            <span className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">STREAMING READY</span>
                            <span className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">-14 LUFS</span>
                          </div>
                        </div>
                      </li>

                      {/* Stem Splitting */}
                      <li className="flex items-start gap-2.5 pt-1 border-t border-slate-200">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="font-bold text-slate-800">Universal Stem Splitting:</span>
                          <p className="text-[10px] text-slate-500">Voice, Bass, Instrumental, Drums, Piano, Guitar, Backing vocals, Denoise, Dereverb</p>
                          <div className="flex flex-wrap gap-1 text-[9px] mt-1">
                            <span className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">SAM AUDIO BASE</span>
                            <span className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">MELBAND ROFORMER</span>
                            <span className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">BS ROFORMER</span>
                            <span className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">MDX23C</span>
                          </div>
                        </div>
                      </li>

                      {/* Downloads and details */}
                      <li className="flex items-start gap-2.5 pt-1 border-t border-slate-200">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>Batch Downloads (zip): originals, restored, mastered</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>Privacy control: Choose which tracks are featured on community pages</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>Long term tracks storage</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    disabled={isCheckoutLoading}
                    onClick={() => handleStripeCheckout('PRO_ANNUAL')}
                    className="w-full text-center py-3.5 bg-[#0066fe] hover:bg-[#0055d0] text-white font-bold rounded-xl text-sm transition-all cursor-pointer shadow-md shadow-blue-500/10 active:scale-98 flex items-center justify-center gap-2"
                  >
                    {isCheckoutLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <span>Get Premium Annual ($30/year)</span>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* Coupon Code Section */}
            <div className="mt-8 max-w-xl mx-auto p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-3">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Ticket className="w-4 h-4 text-cyan-400" />
                ¿Tienes un cupón de descuento?
              </h4>
              <p className="text-[11px] text-slate-400">
                Introduce tu código de cupón para activar el acceso premium ilimitado de por vida al instante.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: INFINITO o UNLIMITED"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    setCouponError('');
                    setCouponSuccess('');
                  }}
                  className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600 uppercase tracking-widest"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponCode.trim()}
                  className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-cyan-500/10 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5"
                >
                  {isApplyingCoupon ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Aplicar</span>
                  )}
                </button>
              </div>
              {couponError && (
                <p className="text-xs text-rose-400 font-semibold flex items-center gap-1.5 animate-pulse">
                  <span>❌</span> {couponError}
                </p>
              )}
              {couponSuccess && (
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span>🎉</span> {couponSuccess}
                </p>
              )}
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className={`mt-8 max-w-xl mx-auto p-4 rounded-2xl border transition-all ${
              termsError 
                ? 'bg-rose-950/20 border-rose-500/40 animate-pulse' 
                : 'bg-slate-950/40 border-slate-800/80'
            }`}>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (e.target.checked) setTermsError(false);
                  }}
                  className="mt-1 w-4 h-4 rounded border-slate-750 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
                />
                <div className="space-y-1 text-left">
                  <span className="text-xs font-semibold text-slate-200 block">
                    Terms of Service & Refund Policy Agreement
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    By checking this box, I authorize SoundNova to charge my payment method via Stripe. I agree to the{' '}
                    <span className="text-blue-400 underline hover:text-blue-300">Terms of Service</span>,{' '}
                    <span className="text-blue-400 underline hover:text-blue-300">Privacy Policy</span>, and understand the{' '}
                    <span className="text-blue-400/90 underline hover:text-blue-300">Refund Policy</span> (all purchases are final, cancel anytime).
                  </p>
                </div>
              </label>
            </div>

            {/* Safe Billing Notice */}
            <div className="mt-8 text-center text-[11px] text-slate-500 font-medium max-w-md mx-auto space-y-1">
              <p>💳 Secured by Stripe. Standard encryption protocols enforced. cancel any time.</p>
              <p className="text-[10px] text-slate-600">All prices in USD. VAT or regional processing taxes may apply at checkout.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
