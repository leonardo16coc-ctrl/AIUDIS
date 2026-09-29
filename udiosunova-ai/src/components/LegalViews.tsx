/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, FileText, CheckCircle, HelpCircle, RotateCcw, XCircle, Mail } from 'lucide-react';

interface LegalViewsProps {
  section: 'terms' | 'privacy' | 'copyright' | 'dmca' | 'acceptable-use' | 'refund' | 'cancellation' | 'contact';
}

export default function LegalViews({ section }: LegalViewsProps) {
  const renderTerms = () => (
    <div className="space-y-6 text-slate-300">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
        <FileText className="w-6 h-6 text-sky-400" />
        Terms of Service (Condiciones del Servicio)
      </h2>
      <p className="text-sm">Last updated: June 30, 2026</p>
      
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">1. Acceptable Use of UdioSunova AI</h3>
        <p className="text-sm leading-relaxed">
          UDIOSUNOVA AI is a tool developed exclusively for music creators, AI artists, and sound producers. It enables importing user-owned, public audio files, downloading high-quality audio files, and converting formats.
        </p>
        <p className="text-sm leading-relaxed font-semibold text-cyan-400">
          “UDIOSUNOVA AI is not affiliated with Udio, Suno, UdioSunova Analog or any mentioned platform. All trademarks belong to their respective owners. Users are responsible for ensuring they have the rights to import, upload, process and download any content.”
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">2. Intellectual Property Rights</h3>
        <p className="text-sm leading-relaxed">
          You represent and warrant that you own or hold the necessary permissions/rights to process, convert, or restore any audio file submitted to this studio. UdioSunova AI does not scan or distribute private, password-protected tracks. We act strictly as a technical conversion utility.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">3. Platform Limitations & Fair Use (Límites de la Plataforma)</h3>
        <p className="text-sm leading-relaxed">
          The free tier allows importing a maximum of 5 songs total to your library. To import more tracks and unlock high-fidelity WAV downloads and the full UdioSunova Analog DSP Tools suite, you must upgrade to the paid plan.
        </p>
        <p className="text-sm leading-relaxed">
          El plan gratuito permite importar un máximo de 5 canciones en total a tu biblioteca. Para importar más canciones y desbloquear descargas de WAV en alta fidelidad y el conjunto completo de herramientas UdioSunova Analog DSP, debes actualizar al plan de pago.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">4. Subscriptions, Stripe Billing & Refunds (Suscripciones y Facturación)</h3>
        <p className="text-sm leading-relaxed">
          Our Premium Subscription costs $3 USD per month. All transactions are securely processed via Stripe. We do not store your credit card details. This subscription grants you unlimited imports, full access to our UdioSunova Analog DSP Tools, and lossless WAV master exports. You can cancel your subscription at any time. All payments are final and non-refundable.
        </p>
        <p className="text-sm leading-relaxed">
          Nuestra Suscripción Premium cuesta $3 USD al mes. Todas las transacciones se procesan de forma segura a través de Stripe. No almacenamos los datos de tu tarjeta de crédito. Esta suscripción te otorga importaciones ilimitadas, acceso completo a nuestras herramientas de IA UdioSunova Analog DSP y exportaciones WAV en alta fidelidad. Puedes cancelar tu suscripción en cualquier momento. Todos los pagos son finales y no reembolsables.
        </p>
      </section>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6 text-slate-300">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
        <Shield className="w-6 h-6 text-sky-400" />
        Privacy Policy (Política de Privacidad)
      </h2>
      <p className="text-sm">Last updated: June 30, 2026</p>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">1. Information We Collect</h3>
        <p className="text-sm leading-relaxed">
          We collect account emails, upload logs, file metadata (such as titles, artist names, durations, and original file paths), download requests, and diagnostic information (including secure client IP addresses and user agents) to secure our servers from bypass scripts or scraping.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">2. File Expiration and Deletion</h3>
        <p className="text-sm leading-relaxed">
          Under the FREE tier, files are held temporarily on secure storage servers and are automatically pruned 7 days after creation. PLUS users enjoy 30 days of persistent storage. Users can delete any metadata and physical audio records from our servers instantly by selecting "Delete Track" in the Studio panel.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">3. Third-party Platforms</h3>
        <p className="text-sm leading-relaxed">
          When importing links from Udio or Suno, we make secure, server-side HTTP calls to fetch meta-tags visible to the public. We do not store or transmit cookies, login tokens, or account keys belonging to third-party services.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">4. Secure Payments (Stripe)</h3>
        <p className="text-sm leading-relaxed">
          Payment processing is managed securely by Stripe. When you subscribe, Stripe collects your payment method details in compliance with their own privacy standards (https://stripe.com/privacy). We do not collect, view, or store credit card numbers.
        </p>
        <p className="text-sm leading-relaxed">
          El procesamiento de pagos es gestionado de forma segura por Stripe. Al suscribirte, Stripe recopila los datos de tu método de pago de acuerdo con sus propios estándares de privacidad (https://stripe.com/privacy). Nosotros no recopilamos, vemos ni almacenamos números de tarjetas de crédito.
        </p>
      </section>
    </div>
  );

  const renderCopyright = () => (
    <div className="space-y-6 text-slate-300">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
        <HelpCircle className="w-6 h-6 text-sky-400" />
        Copyright Policy & DMCA
      </h2>
      <p className="text-sm">Last updated: June 30, 2026</p>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Digital Millennium Copyright Act Notice</h3>
        <p className="text-sm leading-relaxed">
          UdioSunova AI respects the intellectual property rights of all content creators. In compliance with the DMCA (17 U.S.C. § 512), we respond promptly to allegations of copyright infringement.
        </p>
        <p className="text-sm leading-relaxed">
          If you believe that any public material hosted on our servers infringes your copyright, you may submit a formal takedown request containing the following information:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-400 text-sm pl-4">
          <li>Physical or electronic signature of the authorized copyright holder.</li>
          <li>Identification of the copyrighted work claimed to have been infringed.</li>
          <li>Specific URL or audio asset ID that displays the infringing work.</li>
          <li>Your contact details, including email address and telephone number.</li>
          <li>A statement indicating your good-faith belief that the use is unauthorized.</li>
        </ul>
        <p className="text-sm leading-relaxed">
          Submit DMCA notices directly to our secure agent at <span className="text-sky-400">udiosunovai@gmail.com</span>. Infringing files will be removed immediately.
        </p>
      </section>
    </div>
  );

  const renderAcceptableUse = () => (
    <div className="space-y-6 text-slate-300">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
        <CheckCircle className="w-6 h-6 text-sky-400" />
        Acceptable Use Policy (AUP)
      </h2>
      <p className="text-sm">Last updated: June 30, 2026</p>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Prohibited Activities</h3>
        <p className="text-sm leading-relaxed">
          To maintain security, legal standards, and high performance for creators, users are prohibited from doing the following:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm text-slate-300 pl-4">
          <li>Uploading files larger than the allotted tier limit (50MB for Free).</li>
          <li>Using automated bypass scripts, scrapers, or browser crawlers to download audio assets.</li>
          <li>Submitting URLs that contain internal server parameters, session cookies, or authorization tokens.</li>
          <li>Attempting SSRF, DNS rebinding, or loopback requests targeting internal or private container ports.</li>
          <li>Accessing, copying, or reverse-engineering proprietary backend conversion filters.</li>
        </ul>
        <p className="text-sm leading-relaxed">
          Violating these rules triggers an automatic system flag, logging your client IP in our secure AbuseLog registry and immediately revoking platform privileges.
        </p>
      </section>
    </div>
  );

  const renderRefund = () => (
    <div className="space-y-6 text-slate-300">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
        <RotateCcw className="w-6 h-6 text-sky-400" />
        Refund Policy (Política de Reembolso)
      </h2>
      <p className="text-sm">Last updated: June 30, 2026</p>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Digital Goods Refund Rules</h3>
        <p className="text-sm leading-relaxed">
          Since UdioSunova AI provides non-tangible, irrevocable digital goods and instant processing credits upon subscription, we do not issue refunds once the order is completed and the product/service is activated.
        </p>
        <p className="text-sm leading-relaxed">
          Como UdioSunova AI proporciona bienes digitales intangibles e irrevocables y créditos de procesamiento instantáneos tras la suscripción, no realizamos reembolsos una vez que se completa el pedido y se activa el producto/servicio.
        </p>
        <p className="text-sm leading-relaxed">
          If you experience any technical issues with our tool suite or did not receive your premium benefits, please reach out to our support team immediately.
        </p>
      </section>
    </div>
  );

  const renderCancellation = () => (
    <div className="space-y-6 text-slate-300">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
        <XCircle className="w-6 h-6 text-sky-400" />
        Cancellation Policy (Política de Cancelación)
      </h2>
      <p className="text-sm">Last updated: June 30, 2026</p>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">How to Cancel</h3>
        <p className="text-sm leading-relaxed">
          You may cancel your UdioSunova AI Premium subscription at any time. There are no cancellation fees or lock-in contracts.
        </p>
        <p className="text-sm leading-relaxed">
          Puedes cancelar tu suscripción Premium de UdioSunova AI en cualquier momento. No hay cargos por cancelación ni contratos de permanencia.
        </p>
        <p className="text-sm leading-relaxed">
          Upon cancellation, your account will remain Premium with full access to the high-fidelity tools and unlimited library slots until the end of the current billing cycle, at which point it will revert to the standard Free tier.
        </p>
      </section>
    </div>
  );

  const renderContact = () => (
    <div className="space-y-6 text-slate-300">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
        <Mail className="w-6 h-6 text-sky-400" />
        Contact Support (Contacto y Soporte)
      </h2>
      <p className="text-sm">Last updated: June 30, 2026</p>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Get in Touch</h3>
        <p className="text-sm leading-relaxed">
          If you have any questions, feedback, bug reports, or need assistance with your subscription billing, please reach out to our support team.
        </p>
        <p className="text-sm leading-relaxed font-semibold text-cyan-400">
          Email: udiosunovai@gmail.com
        </p>
        <p className="text-sm leading-relaxed">
          Our general response time is within 24 to 48 hours. Please include your registered account email and any relevant transaction IDs when writing regarding billing inquiries.
        </p>
      </section>
    </div>
  );

  return (
    <div className="bg-[#0f172a]/75 border border-sky-500/10 rounded-2xl p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden max-w-4xl mx-auto my-6">
      {/* Background neon flares */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {section === 'terms' && renderTerms()}
      {section === 'privacy' && renderPrivacy()}
      {section === 'copyright' && renderCopyright()}
      {section === 'dmca' && renderCopyright()}
      {section === 'acceptable-use' && renderAcceptableUse()}
      {section === 'refund' && renderRefund()}
      {section === 'cancellation' && renderCancellation()}
      {section === 'contact' && renderContact()}
    </div>
  );
}
