/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import NodeID3 from 'node-id3';
import Stripe from 'stripe';
import { execSync } from 'child_process';

import { db } from './src/server/db';
import { 
  isValidUrl, 
  parseUrlMetadata, 
  enqueueJob,
  getAudioDurationFromBuffer
} from './src/server/worker';
import { 
  AudioStatus, 
  AudioJobType, 
  AudioJobStatus, 
  Visibility, 
  Plan, 
  AudioAsset, 
  AudioJob,
  DownloadLog,
  AbuseLog
} from './src/types';

const app = express();
const PORT = 3000;

// Lazy initialization of Stripe client
let stripeClient: Stripe | null = null;

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !key.trim()) {
    return null;
  }

  // Validate the secret key prefix
  if (!key.startsWith('sk_live_') && !key.startsWith('sk_test_')) {
    console.error('❌ Stripe Configuration Error: STRIPE_SECRET_KEY must start with "sk_live_" or "sk_test_". Do not use publishable keys (pk_) or restricted keys (rk_) as the secret key.');
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: '2025-01-27.acacia' as any,
    });
  }
  return stripeClient;
}

// 1a. Stripe Webhook (Raw Body parser before general JSON middleware)
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (endpointSecret && !endpointSecret.startsWith('whsec_')) {
    console.error('❌ Stripe Webhook Configuration Error: STRIPE_WEBHOOK_SECRET must start with "whsec_".');
  }

  let event;

  try {
    if (stripe && endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // Fallback for easy testing/simulation or if secret is missing
      console.warn('⚠️ Stripe Webhook running without signatures. In production you must provide STRIPE_WEBHOOK_SECRET.');
      const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(req.body || '');
      const parsed = JSON.parse(rawBody.toString('utf8'));
      event = parsed;
    }
  } catch (err: any) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the completed subscription event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      const planToUpgrade = session.metadata?.plan;
      if (planToUpgrade && Object.values(Plan).includes(planToUpgrade)) {
        console.log(`[Stripe Webhook] Successful checkout. Upgrading user to: ${planToUpgrade}`);
        db.updateUserPlan(planToUpgrade as Plan);
      }
      break;
    }
    default:
      console.log(`[Stripe Webhook] Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Configure JSON and URL encoded body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Multer for in-memory file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // Max 100MB (limit enforced per tier in router)
  }
});

// Helper for generating random IDs
function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// API ROUTES
// ============================================================================

// 1. GET User Status and Plan
app.get('/api/user', (req, res) => {
  try {
    const user = db.getUser();
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve user data' });
  }
});

// 2. POST Update User Plan (For toggling and testing Free/Plus/Pro tiers)
app.post('/api/user/plan', (req, res) => {
  try {
    let { plan } = req.body;
    if (plan === 'PRO_ANNUAL') {
      plan = 'PRO';
    }
    if (!plan || !Object.values(Plan).includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan tier specified' });
    }
    const updatedUser = db.updateUserPlan(plan as Plan);
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update user plan' });
  }
});

// 2.1 POST Validate & Apply Coupon Code for Unlimited Access
app.post('/api/user/coupon', (req, res) => {
  try {
    const { coupon } = req.body;
    if (!coupon || typeof coupon !== 'string') {
      return res.status(400).json({ error: 'Código de cupón inválido.' });
    }
    const cleanCoupon = coupon.trim().toUpperCase();
    const validCoupons = [
      'INFINITO', 
      'UNLIMITED', 
      'UDIOUNLIMITED', 
      'SOUNDNOVA_PRO', 
      'FOREVER', 
      'ILIMITADO', 
      'CUPON_ILIMITADO',
      'GRATIS'
    ];
    if (validCoupons.includes(cleanCoupon)) {
      const updatedUser = db.updateUserPlan(Plan.PRO);
      return res.json({ 
        success: true, 
        user: updatedUser, 
        message: '¡Cupón aplicado con éxito! Plan PRO Ilimitado activado de por vida. 🎉' 
      });
    } else {
      return res.status(400).json({ error: 'El código de cupón no es válido o ya ha sido utilizado.' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al procesar el cupón' });
  }
});

// 2b. POST Create Stripe Checkout Session
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { plan } = req.body;
    if (!plan || (plan !== 'PLUS' && plan !== 'PRO' && plan !== 'PRO_ANNUAL')) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const stripe = getStripe();

    if (!stripe) {
      console.log('Stripe is not configured (STRIPE_SECRET_KEY is missing). Returning simulated checkout session.');
      return res.json({
        simulated: true,
        url: `/api/stripe/simulated-checkout?plan=${plan}`
      });
    }

    const lineItem: any = {
      quantity: 1,
    };

    if (plan === 'PRO' && process.env.STRIPE_PRICE_ID_MONTHLY) {
      lineItem.price = process.env.STRIPE_PRICE_ID_MONTHLY;
    } else if (plan === 'PRO_ANNUAL' && process.env.STRIPE_PRICE_ID_ANNUAL) {
      lineItem.price = process.env.STRIPE_PRICE_ID_ANNUAL;
    } else {
      // Fallback: Dynamic price_data if Stripe Price ID is not provided
      const isAnnual = plan === 'PRO_ANNUAL';
      const planName = isAnnual ? 'SoundNova Pro Annual' : (plan === 'PLUS' ? 'SoundNova Plus' : 'SoundNova Pro');
      const amount = isAnnual ? 3000 : (plan === 'PLUS' ? 150 : 300); // $1.50 for Plus, $3.00 for Pro
      const interval = isAnnual ? 'year' : 'month';

      let targetProductId: string | null = null;
      if (plan === 'PRO') {
        targetProductId = process.env.STRIPE_PRODUCT_ID_PRO || 'prod_UoVMTnZ95XMyOh';
      } else if (plan === 'PRO_ANNUAL') {
        targetProductId = process.env.STRIPE_PRODUCT_ID_PRO_ANNUAL || 'prod_UoXONJfmrLJjvB';
      }

      lineItem.price_data = {
        currency: 'usd',
        unit_amount: amount,
        recurring: {
          interval: interval as any,
        },
      };

      if (targetProductId) {
        lineItem.price_data.product = targetProductId;
      } else {
        lineItem.price_data.product_data = {
          name: planName,
          description: isAnnual
            ? 'Discounted annual subscription. Unlimited Lossless WAV & FLAC Mastering Exports, full AI tools access'
            : (plan === 'PLUS' 
                ? 'Unlimited MP3 Conversions, high speed queues, and full AI tools access' 
                : 'Unlimited Lossless WAV & FLAC Mastering Exports, full AI tools access'),
        };
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [lineItem],
      mode: 'subscription',
      success_url: `${appUrl}?session_id={CHECKOUT_SESSION_ID}&plan_success=${plan}`,
      cancel_url: `${appUrl}?plan_cancel=true`,
      metadata: {
        plan: plan,
      },
    });

    res.json({
      simulated: false,
      url: session.url
    });

  } catch (error: any) {
    // Log technical errors ONLY in the backend console
    console.error('❌ Stripe Checkout Session Generation Failed:', error);
    res.status(500).json({ error: 'Subscription checkout could not be initiated. Please try again later.' });
  }
});

// 2b-2. GET Stripe Connection Status and Verification
app.get('/api/stripe/status', async (req, res) => {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const publishableKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY;
    
    if (!key || !key.trim()) {
      return res.json({
        configured: false,
        verified: false,
        message: 'No active Stripe configuration found. Running in simulation mode.',
        details: {
          hasSecretKey: false,
          hasWebhookSecret: !!(webhookSecret && webhookSecret.trim()),
          hasPublishableKey: !!(publishableKey && publishableKey.trim()),
        }
      });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.json({
        configured: true,
        verified: false,
        message: 'Failed to initialize the Stripe client. Check your secret key format.',
        details: {
          hasSecretKey: true,
          hasWebhookSecret: !!(webhookSecret && webhookSecret.trim()),
          hasPublishableKey: !!(publishableKey && publishableKey.trim()),
        }
      });
    }

    let accountName = 'Unknown Merchant';
    let accountEmail = '';
    let isKeyValid = false;
    let authError = '';

    try {
      // Retrieve your specific account details to verify the API key is fully working
      const account = await stripe.accounts.retrieve('acct_1Toq4CLK19Z5bX2m');
      accountName = account.settings?.dashboard?.display_name || account.business_profile?.name || 'Active Stripe Account';
      accountEmail = account.email || '';
      isKeyValid = true;
    } catch (err: any) {
      // Fallback: Verify general connectivity using stripe.balance.retrieve() if accounts.retrieve is restricted
      try {
        await stripe.balance.retrieve();
        isKeyValid = true;
        accountName = 'SoundNova Merchant';
      } catch (balErr: any) {
        authError = balErr.message || err.message || 'Authentication failed';
      }
    }

    if (!isKeyValid) {
      return res.json({
        configured: true,
        verified: false,
        message: `Stripe API key is invalid or unauthorized: ${authError}`,
        details: {
          hasSecretKey: true,
          hasWebhookSecret: !!(webhookSecret && webhookSecret.trim()),
          hasPublishableKey: !!(publishableKey && publishableKey.trim()),
          authError,
        }
      });
    }

    let productDetails = null;
    let productVerified = false;
    let productError = '';

    const targetProductId = process.env.STRIPE_PRODUCT_ID_PRO || 'prod_UoVMTnZ95XMyOh';

    try {
      const product = await stripe.products.retrieve(targetProductId);
      productDetails = {
        id: product.id,
        name: product.name,
        active: product.active,
        description: product.description,
      };
      productVerified = true;
    } catch (err: any) {
      productError = err.message || 'Product not found';
    }

    return res.json({
      configured: true,
      verified: true,
      message: 'Stripe is fully connected and authenticated successfully!',
      account: {
        id: 'acct_1Toq4CLK19Z5bX2m',
        name: accountName,
        email: accountEmail,
      },
      product: {
        id: targetProductId,
        verified: productVerified,
        details: productDetails,
        error: productError ? `Could not find product ${targetProductId}: ${productError}` : null,
      },
      details: {
        hasSecretKey: true,
        hasWebhookSecret: !!(webhookSecret && webhookSecret.trim()),
        hasPublishableKey: !!(publishableKey && publishableKey.trim()),
      }
    });

  } catch (error: any) {
    res.status(500).json({
      configured: true,
      verified: false,
      message: `An unexpected error occurred during verification: ${error.message}`
    });
  }
});

// 2c. GET Simulated Stripe Checkout Screen
app.get('/api/stripe/simulated-checkout', (req, res) => {
  const plan = req.query.plan as string;
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  
  const isAnnual = plan === 'PRO_ANNUAL';
  const planName = isAnnual ? 'SoundNova Pro Annual' : (plan === 'PRO' ? 'SoundNova Pro' : 'SoundNova Plus');
  const price = isAnnual ? '$30.00/yr' : '$3.00/mo';
  const priceDesc = isAnnual ? 'Annual subscription' : 'Monthly subscription';
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Stripe Checkout (Simulation Mode)</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-[#030712] text-slate-100 min-h-screen flex items-center justify-center font-sans antialiased p-4">
      <div class="max-w-md w-full bg-[#0b1329] border border-slate-800/80 rounded-3xl p-8 shadow-2xl space-y-8 relative overflow-hidden">
        <!-- Accent Glow -->
        <div class="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="space-y-4 text-center">
          <div class="inline-flex items-center justify-center px-3 py-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 rounded-full uppercase tracking-wider">
            Stripe Simulation Mode
          </div>
          <h1 class="text-2xl font-extrabold tracking-tight text-white">Stripe Checkout</h1>
          <p class="text-xs text-slate-400">
            STRIPE_SECRET_KEY is currently empty. Completing this payment will simulate a successful purchase.
          </p>
        </div>

        <!-- Order Summary -->
        <div class="bg-slate-950/60 border border-slate-800/85 p-5 rounded-2xl space-y-4">
          <div class="flex justify-between items-center pb-3 border-b border-slate-800/60">
            <div>
              <p class="font-bold text-white">${planName}</p>
              <p class="text-xs text-slate-500">${priceDesc}</p>
            </div>
            <span class="font-mono text-cyan-400 font-bold text-lg">${price}</span>
          </div>
          <div class="flex justify-between items-center text-xs text-slate-400 font-medium">
            <span>Subtotal</span>
            <span>${price}</span>
          </div>
          <div class="flex justify-between items-center text-xs text-slate-400 font-medium">
            <span>Taxes</span>
            <span>$0.00</span>
          </div>
          <div class="flex justify-between items-center text-sm font-bold text-white pt-2">
            <span>Total Due</span>
            <span class="text-sky-400 font-mono">${price}</span>
          </div>
        </div>

        <!-- Mock Card Inputs -->
        <div class="space-y-4">
          <div>
            <label class="text-[10px] uppercase font-bold text-slate-500 block mb-1">Card number</label>
            <div class="bg-slate-950 border border-slate-850 px-4 py-3 rounded-xl text-slate-300 font-mono text-sm tracking-widest flex items-center justify-between">
              <span>4242 •••• •••• 4242</span>
              <span class="text-xs text-slate-500">VISA</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[10px] uppercase font-bold text-slate-500 block mb-1">Expires</label>
              <div class="bg-slate-950 border border-slate-850 px-4 py-3 rounded-xl text-slate-300 font-mono text-sm">
                12 / 28
              </div>
            </div>
            <div>
              <label class="text-[10px] uppercase font-bold text-slate-500 block mb-1">CVC</label>
              <div class="bg-slate-950 border border-slate-850 px-4 py-3 rounded-xl text-slate-300 font-mono text-sm">
                ***
              </div>
            </div>
          </div>
        </div>

        <!-- Checkout CTAs -->
        <div class="space-y-3 pt-2">
          <button 
            onclick="window.location.href = '${appUrl}?session_id=mock_session_' + Math.random().toString(36).substr(2,9) + '&plan_success=${plan}'"
            class="w-full text-center py-3.5 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(56,189,248,0.2)] hover:scale-102 cursor-pointer"
          >
            Complete Payment (Simulate)
          </button>
          <button 
            onclick="window.location.href = '${appUrl}?plan_cancel=true'"
            class="w-full text-center py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-800 text-slate-400 hover:text-white font-semibold rounded-xl transition-all cursor-pointer"
          >
            Cancel Payment
          </button>
        </div>
      </div>
    </body>
    </html>
  `);
});

// 3. GET All Audio Assets in Library
app.get('/api/library', (req, res) => {
  try {
    const assets = db.getAssets();
    res.json(assets);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch library' });
  }
});

// 4. POST Import Audio from Public Link
app.post('/api/import/from-link', (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'A valid URL is required for import.' });
    }

    // SSRF & Security Validation
    if (!isValidUrl(url)) {
      return res.status(400).json({ 
        error: 'Invalid or restricted URL protocol/host. Only public HTTP/HTTPS endpoints are allowed.' 
      });
    }

    const user = db.getUser();
    const assets = db.getAssets();
    
    // Check Free plan import limitations (Max 5 songs total in library)
    if (user.plan === Plan.FREE && assets.length >= 5) {
      return res.status(403).json({ 
        error: 'Limit reached. Free accounts can import up to 5 songs total. Upgrade to Premium for unlimited imports and AI tools!' 
      });
    }

    // Parse platform and metadata
    const parsedMeta = parseUrlMetadata(url);

    const assetId = generateId('snd');
    const jobId = generateId('job');

    const newAsset: AudioAsset = {
      id: assetId,
      userId: user.id,
      title: parsedMeta.title,
      artist: parsedMeta.artist,
      coverUrl: parsedMeta.coverUrl,
      sourceUrl: url,
      sourcePlatform: parsedMeta.sourcePlatform,
      duration: parsedMeta.duration,
      originalFileUrl: '',
      mp3FileUrl: '',
      wavFileUrl: '',
      flacFileUrl: '',
      waveformJsonUrl: '',
      status: AudioStatus.PENDING,
      visibility: Visibility.PUBLIC,
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: user.plan === Plan.FREE ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString() : null // 7 days expiry for FREE
    };

    const newJob: AudioJob = {
      id: jobId,
      audioAssetId: assetId,
      type: AudioJobType.IMPORT,
      status: AudioJobStatus.QUEUED,
      progress: 0,
      message: 'Pending in active queue...',
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.createAsset(newAsset);
    db.createJob(newJob);

    // Trigger async job processor
    enqueueJob(jobId);

    res.json({
      audio_id: assetId,
      status: AudioStatus.PENDING
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to initiate import pipeline' });
  }
});

// 5. GET Processing Job Status
app.get('/api/audio/:audio_id/status', (req, res) => {
  try {
    const { audio_id } = req.params;
    const asset = db.getAssetById(audio_id);
    
    if (!asset) {
      return res.status(404).json({ error: 'Audio asset not found' });
    }

    const jobs = db.getJobsByAssetId(audio_id);
    const activeJob = jobs.find(
      j => j.status === AudioJobStatus.PROCESSING || j.status === AudioJobStatus.QUEUED
    ) || jobs[jobs.length - 1]; // Fallback to last job

    res.json({
      audio_id,
      status: asset.status,
      progress: activeJob ? activeJob.progress : (asset.status === AudioStatus.COMPLETE ? 100 : 0),
      message: activeJob ? activeJob.message : (asset.status === AudioStatus.COMPLETE ? 'Track ready' : 'Idle')
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch job status' });
  }
});

// 6. GET Audio Asset Details
app.get('/api/audio/:audio_id', (req, res) => {
  try {
    const { audio_id } = req.params;
    const asset = db.getAssetById(audio_id);

    if (!asset) {
      return res.status(404).json({ error: 'Audio track not found.' });
    }

    const user = db.getUser();
    
    // Check visibility / ownership
    if (asset.visibility === Visibility.PRIVATE && asset.userId !== user.id) {
      return res.status(403).json({ error: 'You do not have permission to view this track.' });
    }

    const availableFormats = [];
    if (asset.mp3FileUrl) availableFormats.push('mp3');
    if (user.plan !== Plan.FREE) {
      if (asset.wavFileUrl) availableFormats.push('wav');
      if (asset.flacFileUrl) availableFormats.push('flac');
    }

    res.json({
      ...asset,
      available_formats: availableFormats
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch track details' });
  }
});

// 7. POST Edit Track Details (Title/Artist)
app.post('/api/audio/:audio_id/edit', (req, res) => {
  try {
    const { audio_id } = req.params;
    const { title, artist, visibility } = req.body;

    const asset = db.getAssetById(audio_id);
    if (!asset) {
      return res.status(404).json({ error: 'Audio track not found' });
    }

    const updates: Partial<AudioAsset> = {};
    if (title && typeof title === 'string') updates.title = title.trim();
    if (artist && typeof artist === 'string') updates.artist = artist.trim();
    if (visibility && Object.values(Visibility).includes(visibility)) {
      updates.visibility = visibility as Visibility;
    }

    const updatedAsset = db.updateAsset(audio_id, updates);
    res.json(updatedAsset);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to edit track' });
  }
});

// 8. POST Transcode/Export Audio formats
app.post('/api/audio/:audio_id/export', (req, res) => {
  try {
    const { audio_id } = req.params;
    const { format } = req.body;

    if (!format || !['mp3', 'wav', 'flac'].includes(format)) {
      return res.status(400).json({ error: 'Invalid file format. Supported exports: mp3, wav, flac.' });
    }

    const user = db.getUser();
    if (user.plan === Plan.FREE && format !== 'mp3') {
      return res.status(403).json({ 
        error: 'Premium Export. WAV and FLAC high-fidelity exports require a Plus or Pro subscription.' 
      });
    }

    const asset = db.getAssetById(audio_id);
    if (!asset || asset.status !== AudioStatus.COMPLETE) {
      return res.status(400).json({ error: 'Track must be fully processed before exporting formats.' });
    }

    const jobId = generateId('job');
    const newJob: AudioJob = {
      id: jobId,
      audioAssetId: audio_id,
      type: AudioJobType.CONVERT,
      status: AudioJobStatus.QUEUED,
      progress: 0,
      message: `Queuing audio transcoding to ${format.toUpperCase()}...`,
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.createJob(newJob);
    enqueueJob(jobId);

    res.json({
      job_id: jobId,
      status: AudioJobStatus.PROCESSING
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to enqueue export transcode' });
  }
});

// 9. GET Secure Track Download & Abuse protection
app.get('/api/audio/:audio_id/download', (req, res) => {
  try {
    const { audio_id } = req.params;
    const format = (req.query.format as string || 'mp3').toLowerCase();

    if (!['mp3', 'wav', 'flac'].includes(format)) {
      return res.status(400).json({ error: 'Unsupported download format.' });
    }

    const user = db.getUser();
    // Allow MP3, WAV, and FLAC downloads for all users in the environment so WAV is fully accessible.

    const asset = db.getAssetById(audio_id);
    if (!asset || asset.status !== AudioStatus.COMPLETE) {
      return res.status(404).json({ error: 'Audio track not ready or does not exist.' });
    }

    // Track abuse / rate-limit per IP / User
    const clientIp = req.ip || req.headers['x-forwarded-for'] as string || '127.0.0.1';
    const recentDownloads = db.getDownloadLogs().filter(
      log => log.ipAddress === clientIp && (Date.now() - new Date(log.createdAt).getTime()) < 60000
    );

    if (recentDownloads.length >= 5) {
      // Log Abuse
      db.createAbuseLog({
        id: generateId('abuse'),
        userId: user.id,
        ipAddress: clientIp,
        reason: 'Excessive download rate-limiting (over 5 downloads per minute)',
        sourceUrl: asset.sourceUrl,
        createdAt: new Date().toISOString()
      });

      return res.status(429).json({ 
        error: 'Too many download requests. Please wait a minute before downloading another audio file.' 
      });
    }

    // Log Successful Download
    db.createDownloadLog({
      id: generateId('log'),
      userId: user.id,
      audioAssetId: audio_id,
      format,
      ipAddress: clientIp,
      userAgent: req.headers['user-agent'] || 'Unknown',
      createdAt: new Date().toISOString()
    });

    // Provide file URL (Signed simulated redirect URL)
    let fileUrl = asset.mp3FileUrl;
    if (format === 'wav') fileUrl = asset.wavFileUrl || asset.mp3FileUrl;
    if (format === 'flac') fileUrl = asset.flacFileUrl || asset.mp3FileUrl;

    const cleanFilename = asset.title.replace(/[\\/:*?"<>|]/g, '').trim() || 'track';

    // Append download disposition pointing to our metadata injector proxy
    res.json({
      download_url: `/api/audio/${audio_id}/download-file?format=${format}`,
      title: asset.title,
      filename: `${cleanFilename}.${format}`
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to serve download' });
  }
});

// 9b. GET Secure Proxied Metadata & Cover-Art Injector for exact file download
app.get('/api/audio/:audio_id/download-file', async (req, res) => {
  try {
    const { audio_id } = req.params;
    const format = (req.query.format as string || 'mp3').toLowerCase();

    const asset = db.getAssetById(audio_id);
    if (!asset || asset.status !== AudioStatus.COMPLETE) {
      return res.status(404).send('Audio track not ready or does not exist.');
    }

    let fileUrl = asset.mp3FileUrl;
    if (format === 'wav') fileUrl = asset.wavFileUrl || asset.mp3FileUrl;
    if (format === 'flac') fileUrl = asset.flacFileUrl || asset.mp3FileUrl;

    const cleanFilename = asset.title.replace(/[\\/:*?"<>|]/g, '').trim() || 'track';

    // Set standard browser content disposition download header using RFC 5987 for non-ASCII characters
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(cleanFilename)}.${format}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}.${format}`
    );

    // Try to proxy and write ID3 metadata (tags + cover) for MP3 files
    if (format === 'mp3') {
      try {
        console.log(`Downloading audio source to inject tags: ${fileUrl}`);
        const audioResponse = await globalThis.fetch(fileUrl);
        if (!audioResponse.ok) {
          throw new Error(`Failed to fetch source audio: ${audioResponse.statusText}`);
        }
        
        let audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

        // Construct ID3 tags with exact Title (including version suffix), Artist, and Album info
        const tags: any = {
          title: asset.title,
          artist: asset.artist || 'AI Creator',
          album: 'SoundNova Studio',
        };

        // If the asset has a valid cover image URL, fetch and embed it
        if (asset.coverUrl && asset.coverUrl.startsWith('http')) {
          try {
            console.log(`Fetching cover image for metadata injection: ${asset.coverUrl}`);
            const coverResponse = await globalThis.fetch(asset.coverUrl);
            if (coverResponse.ok) {
              const coverBuffer = Buffer.from(await coverResponse.arrayBuffer());
              const mimeType = coverResponse.headers.get('content-type') || 'image/jpeg';
              tags.APIC = {
                mime: mimeType,
                type: 3, // Cover (front)
                description: 'Cover',
                imageBuffer: coverBuffer
              };
            }
          } catch (coverErr) {
            console.error('Failed to embed album art in ID3 metadata:', coverErr);
          }
        }

        // Write ID3 tags directly into the MP3 audio buffer
        const taggedBuffer = NodeID3.write(tags, audioBuffer);
        if (Buffer.isBuffer(taggedBuffer)) {
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Content-Length', taggedBuffer.length);
          return res.send(taggedBuffer);
        }
      } catch (metadataErr) {
        console.error('ID3 Tagging failed, falling back to direct stream proxying:', metadataErr);
      }
    }

    // 24-bit WAV/FLAC Transcoding & Upscaling Engine (The Hidden Udio Studio Quality Version)
    if (format === 'wav' || format === 'flac') {
      try {
        let originalBuffer: Buffer | null = null;
        let foundDirect = false;

        // Attempt 1: Check if original file is already WAV/FLAC or can be located directly
        if (format === 'wav') {
          if (fileUrl.toLowerCase().endsWith('.wav')) {
            console.log(`SoundNova: Source file is already native WAV. Streaming directly...`);
            const response = await globalThis.fetch(fileUrl);
            if (response.ok) {
              originalBuffer = Buffer.from(await response.arrayBuffer());
              foundDirect = true;
            }
          } else {
            const possibleWavUrls = [
              fileUrl.replace(/\.mp3$/i, '.wav'),
              fileUrl.replace(/\.mp3$/i, '_Studio.wav'),
              fileUrl.replace(/\.mp3$/i, '_master.wav')
            ];
            for (const testUrl of possibleWavUrls) {
              try {
                console.log(`SoundNova: Checking if native WAV exists at ${testUrl}...`);
                const headCheck = await globalThis.fetch(testUrl, { method: 'HEAD' });
                if (headCheck.ok) {
                  console.log(`SoundNova: FOUND native WAV at ${testUrl}! Downloading original...`);
                  const response = await globalThis.fetch(testUrl);
                  if (response.ok) {
                    originalBuffer = Buffer.from(await response.arrayBuffer());
                    foundDirect = true;
                    break;
                  }
                }
              } catch (e) {
                // ignore check error and try next
              }
            }
          }
        } else if (format === 'flac') {
          if (fileUrl.toLowerCase().endsWith('.flac')) {
            console.log(`SoundNova: Source file is already native FLAC. Streaming directly...`);
            const response = await globalThis.fetch(fileUrl);
            if (response.ok) {
              originalBuffer = Buffer.from(await response.arrayBuffer());
              foundDirect = true;
            }
          } else {
            const possibleFlacUrls = [
              fileUrl.replace(/\.mp3$/i, '.flac'),
              fileUrl.replace(/\.mp3$/i, '_Master.flac')
            ];
            for (const testUrl of possibleFlacUrls) {
              try {
                console.log(`SoundNova: Checking if native FLAC exists at ${testUrl}...`);
                const headCheck = await globalThis.fetch(testUrl, { method: 'HEAD' });
                if (headCheck.ok) {
                  console.log(`SoundNova: FOUND native FLAC at ${testUrl}! Downloading original...`);
                  const response = await globalThis.fetch(testUrl);
                  if (response.ok) {
                    originalBuffer = Buffer.from(await response.arrayBuffer());
                    foundDirect = true;
                    break;
                  }
                }
              } catch (e) {
                // ignore
              }
            }
          }
        }

        // If direct native file was found, send it directly! Absolutely zero compression, 100% original quality.
        if (foundDirect && originalBuffer) {
          console.log(`SoundNova Engine: Serving original, untouched, native ${format.toUpperCase()} (${originalBuffer.length} bytes)`);
          res.setHeader('Content-Type', format === 'wav' ? 'audio/wav' : 'audio/flac');
          res.setHeader('Content-Length', originalBuffer.length);
          const sanitizedTitle = asset ? asset.title.replace(/[^a-zA-Z0-9]/g, '_') : 'track';
          res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}_original.${format}"`);
          return res.send(originalBuffer);
        }

        // Attempt 2: Fallback to high-fidelity 24-bit upscaling & transcoding from the source (MP3) file
        console.log(`SoundNova Engine: Native ${format.toUpperCase()} not found on server. Upscaling & Transcoding source file to high-fidelity 24-bit ${format.toUpperCase()}...`);
        const audioResponse = await globalThis.fetch(fileUrl);
        if (!audioResponse.ok) {
          throw new Error(`Failed to fetch source audio: ${audioResponse.statusText}`);
        }
        
        const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
        
        let transcodedBuffer: Buffer;
        if (format === 'wav') {
          // Transcode to 24-bit PCM WAV (pcm_s24le) at 48000Hz (Professional Studio Quality) using high-fidelity SoX resampler
          transcodedBuffer = execSync('ffmpeg -y -i pipe:0 -af aresample=resampler=soxr:osr=48000:dither_method=triangular -acodec pcm_s24le -f wav pipe:1', {
            input: audioBuffer,
            maxBuffer: 150 * 1024 * 1024, // 150MB max buffer
            stdio: ['pipe', 'pipe', 'ignore']
          });
          res.setHeader('Content-Type', 'audio/wav');
        } else {
          // Transcode to 24-bit FLAC at 48000Hz (Lossless Master FLAC) using high-fidelity SoX resampler
          transcodedBuffer = execSync('ffmpeg -y -i pipe:0 -af aresample=resampler=soxr:osr=48000:dither_method=triangular -acodec flac -compression_level 5 -f flac pipe:1', {
            input: audioBuffer,
            maxBuffer: 150 * 1024 * 1024,
            stdio: ['pipe', 'pipe', 'ignore']
          });
          res.setHeader('Content-Type', 'audio/flac');
        }

        if (Buffer.isBuffer(transcodedBuffer)) {
          res.setHeader('Content-Length', transcodedBuffer.length);
          const sanitizedTitle = asset ? asset.title.replace(/[^a-zA-Z0-9]/g, '_') : 'track';
          res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}_studio_24b.${format}"`);
          return res.send(transcodedBuffer);
        }
      } catch (transcodeErr) {
        console.error(`24-bit ${format.toUpperCase()} upscaling failed, falling back to direct proxy:`, transcodeErr);
      }
    }

    // Direct proxy fallback for non-MP3 formats or if tagging failed
    console.log(`Proxying direct file stream for: ${fileUrl}`);
    const streamResponse = await globalThis.fetch(fileUrl);
    if (!streamResponse.ok) {
      return res.status(streamResponse.status).send('Failed to retrieve original audio stream');
    }

    const contentType = streamResponse.headers.get('content-type') || `audio/${format}`;
    res.setHeader('Content-Type', contentType);

    const contentLength = streamResponse.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    const fileBuffer = Buffer.from(await streamResponse.arrayBuffer());
    res.send(fileBuffer);

  } catch (error: any) {
    console.error('Error during file streaming:', error);
    res.status(500).send(error.message || 'Internal proxy error');
  }
});

// 10. POST Manual Audio File Upload
app.post('/api/upload/audio', upload.single('audio'), (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No audio file was attached.' });
    }

    // Validate MIME type
    const allowedMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/flac', 'audio/x-flac', 'audio/mp4', 'audio/m4a', 'audio/x-m4a'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file format. SoundNova supports high-fidelity MP3, WAV, FLAC, and M4A uploads.' 
      });
    }

    const user = db.getUser();
    const assets = db.getAssets();

    // Check Free plan total limit (Max 5 songs total in library)
    if (user.plan === Plan.FREE && assets.length >= 5) {
      return res.status(403).json({ 
        error: 'Limit reached. Free accounts can have up to 5 songs total in their library. Upgrade to Premium for unlimited uploads and AI tools!' 
      });
    }
    
    // Check size limit per plan (FREE: 50MB, PLUS: 250MB, PRO: Unlimited)
    const fileMb = file.size / (1024 * 1024);
    const sizeLimit = user.plan === Plan.FREE ? 50 : (user.plan === Plan.PLUS ? 250 : 1000);

    if (fileMb > sizeLimit) {
      return res.status(400).json({ 
        error: `File size exceeds your tier limit (${fileMb.toFixed(1)}MB vs ${sizeLimit}MB limit). Please upgrade to upload larger files.` 
      });
    }

    // Create a beautiful random title from file name
    const rawName = file.originalname || 'Uploaded Track';
    const cleanTitle = rawName.substring(0, rawName.lastIndexOf('.')) || rawName;
    const formattedTitle = cleanTitle.replace(/[-_]/g, ' ').trim();

    // Extract precise duration from the uploaded file buffer, falling back to random if unreadable
    const probedDuration = getAudioDurationFromBuffer(file.buffer);
    const durationSec = probedDuration || (120 + Math.floor(Math.random() * 240));

    const assetId = generateId('snd');
    const helixIndex = Math.floor(Math.random() * 3) + 1;
    const sampleAudioUrl = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${helixIndex}.mp3`;

    const newAsset: AudioAsset = {
      id: assetId,
      userId: user.id,
      title: formattedTitle,
      artist: user.name || 'Local Producer',
      coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&h=400&q=80',
      sourceUrl: 'Manual Upload',
      sourcePlatform: 'Manual Upload',
      duration: durationSec,
      originalFileUrl: sampleAudioUrl,
      mp3FileUrl: sampleAudioUrl,
      wavFileUrl: sampleAudioUrl,
      flacFileUrl: sampleAudioUrl,
      waveformJsonUrl: db.generatePeaksForAsset(120),
      status: AudioStatus.COMPLETE, // Uploads bypass async fetching and are marked complete
      visibility: Visibility.PRIVATE, // Default upload visibility to private
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: user.plan === Plan.FREE ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString() : null // 7 days expiry for FREE
    };

    db.createAsset(newAsset);

    res.json({
      success: true,
      audio_id: assetId,
      status: AudioStatus.COMPLETE
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to upload audio file' });
  }
});

// 11. DELETE Audio track
app.delete('/api/audio/:audio_id', (req, res) => {
  try {
    const { audio_id } = req.params;
    const deleted = db.deleteAsset(audio_id);
    if (!deleted) {
      return res.status(404).json({ error: 'Audio track not found in library.' });
    }
    res.json({ success: true, message: 'Track deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete track' });
  }
});

// ============================================================================
// VITE DEV SERVER / PRODUCTION STATIC ASSET HOSTING
// ============================================================================

async function startServer() {
  // Mount Vite middleware for asset bundling in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log("Vite dev server middleware mounted successfully.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SoundNova AI Server listening at http://localhost:${PORT}`);
  });
}

startServer();
