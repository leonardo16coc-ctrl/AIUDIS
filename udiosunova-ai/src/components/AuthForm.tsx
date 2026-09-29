import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import UdioSunovaLogo from './UdioSunovaLogo';
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';

interface AuthFormProps {
  onSuccess: (userEmail: string, userName: string) => void;
  onCancel?: () => void;
  onNavigateToLegal?: (section: 'terms' | 'privacy') => void;
  initialTab?: 'login' | 'signup';
}

export default function AuthForm({ onSuccess, onCancel, onNavigateToLegal, initialTab = 'login' }: AuthFormProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const displayName = userCredential.user.displayName || email.trim().split('@')[0];
        onSuccess(userCredential.user.email || email.trim(), displayName);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const displayName = email.trim().split('@')[0];
        onSuccess(userCredential.user.email || email.trim(), displayName);
      }
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      let errMsg = err.message || 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errMsg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'This email address is already in use.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'The password is too weak.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'The email address is badly formatted.';
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'Google' | 'Apple') => {
    setError(null);
    setIsLoading(true);

    if (provider === 'Google') {
      try {
        const googleProvider = new GoogleAuthProvider();
        googleProvider.setCustomParameters({ prompt: 'select_account' });
        const userCredential = await signInWithPopup(auth, googleProvider);
        const emailVal = userCredential.user.email || '';
        const nameVal = userCredential.user.displayName || emailVal.split('@')[0] || 'Google User';
        onSuccess(emailVal, nameVal);
      } catch (err: any) {
        console.error('Google Sign-In Error:', err);
        setError(err.message || 'Google Sign-In failed.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Apple login simulation fallback with explicit developer instruction
      setTimeout(() => {
        setIsLoading(false);
        const emailVal = 'apple.user@udiosunova.ai';
        const nameVal = 'Apple User';
        onSuccess(emailVal, nameVal);
        alert("Note: Apple sign-in is currently running in simulation mode. Fully enabling Apple authentication requires registering an Apple Developer account and adding the Service ID in the Firebase Console under Authentication > Sign-in method.");
      }, 1200);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-1">
      {/* Outer Glow Wrapper Card */}
      <div className="relative rounded-3xl bg-[#090d16]/95 border border-slate-900 shadow-[0_0_80px_rgba(37,99,235,0.18)] backdrop-blur-xl overflow-hidden p-8 sm:p-10">
        
        {/* Decorative corner glows */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header containing Logo & Subtitle */}
        <div className="flex flex-col items-center text-center mb-8 relative">
          {/* Logo with slight backlight glow */}
          <div className="relative mb-2">
            <div className="absolute -inset-2 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            <UdioSunovaLogo size="xl" showAiSuffix={false} className="relative" />
          </div>
          
          <h2 className="text-sm font-semibold tracking-wide text-slate-300">
            Create. Import. Elevate.
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your sound, unlimited.
          </p>
        </div>

        {/* Primary/Prominent Social Sign-In Block */}
        <div className="space-y-3 mb-6 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black tracking-widest text-[#38BDF8] uppercase bg-blue-950/40 px-2 py-0.5 rounded-md border border-sky-500/15 animate-pulse">
              ⚡ RECOMENDADO
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Registro e Ingreso instantáneo</span>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleSocialLogin('Google')}
              className="w-full py-3.5 px-4 rounded-xl border border-sky-500/20 bg-[#0c1322] hover:bg-[#111a30] text-white font-extrabold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_20px_rgba(56,189,248,0.08)] hover:shadow-[0_0_25px_rgba(56,189,248,0.2)] focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {/* Google Colorful G SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>Ingresar con Google</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleSocialLogin('Apple')}
              className="w-full py-3.5 px-4 rounded-xl border border-slate-800 bg-[#050505] hover:bg-[#111] text-white font-extrabold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_20px_rgba(255,255,255,0.02)] hover:shadow-[0_0_25px_rgba(255,255,255,0.08)] focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              {/* Apple White Logo SVG */}
              <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.64.74-1.2 1.88-1.05 2.99 1.12.09 2.27-.57 3-1.44" />
              </svg>
              <span>Ingresar con Apple</span>
            </button>
          </div>
        </div>

        {/* Divider with "O continuar con correo" */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-900/85"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
            <span className="bg-[#090d16] px-3 text-slate-500">O CON TU CUENTA DE CORREO</span>
          </div>
        </div>

        {/* Tabs: Log In / Sign Up */}
        <div className="flex border-b border-slate-900 mb-6 relative">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setError(null); }}
            className={`flex-1 pb-3 text-sm font-bold tracking-wide transition-all cursor-pointer relative ${
              activeTab === 'login' ? 'text-white font-extrabold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Iniciar Sesión
            {activeTab === 'login' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 shadow-[0_1px_8px_rgba(59,130,246,0.5)]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('signup'); setError(null); }}
            className={`flex-1 pb-3 text-sm font-bold tracking-wide transition-all cursor-pointer relative ${
              activeTab === 'signup' ? 'text-white font-extrabold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Registrarse
            {activeTab === 'signup' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 shadow-[0_1px_8px_rgba(59,130,246,0.5)]" />
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/20 text-xs text-red-400 font-medium">
            {error}
          </div>
        )}

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Address */}
          <div className="space-y-1">
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <Mail className="w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Dirección de correo electrónico"
                disabled={isLoading}
                className="w-full bg-[#030712] border border-slate-800/80 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <Lock className="w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña (mínimo 6 caracteres)"
                disabled={isLoading}
                className="w-full bg-[#030712] border border-slate-800/80 rounded-xl py-3 pl-11 pr-11 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-600 hover:text-slate-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          {activeTab === 'login' && (
            <div className="flex items-center justify-between text-xs pt-1 pb-2">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded bg-[#030712] border-slate-800 text-blue-600 focus:ring-blue-500/30 focus:ring-offset-0 transition-all"
                />
                <span>Recordarme</span>
              </label>
              
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setError("Se ha simulado un enlace de recuperación. Revisa tu bandeja de entrada.")}
                className="text-blue-500 hover:text-blue-400 font-medium hover:underline cursor-pointer"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {/* Main Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-[0_4px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_4px_25px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:pointer-events-none hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <span>{activeTab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
            )}
          </button>
        </form>

        {/* Disclaimer Legal Links */}
        <p className="text-[11px] text-slate-600 text-center leading-relaxed mt-6">
          Al continuar, aceptas nuestros{' '}
          <button
            type="button"
            onClick={() => onNavigateToLegal && onNavigateToLegal('terms')}
            className="text-blue-500 hover:text-blue-400 font-medium hover:underline inline cursor-pointer"
          >
            Términos de Servicio
          </button>{' '}
          y{' '}
          <button
            type="button"
            onClick={() => onNavigateToLegal && onNavigateToLegal('privacy')}
            className="text-blue-500 hover:text-blue-400 font-medium hover:underline inline cursor-pointer"
          >
            Política de Privacidad
          </button>
          .
        </p>

        {/* Back Link if Cancel is possible */}
        {onCancel && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-500 hover:text-slate-400 transition-colors cursor-pointer"
            >
              Cancelar y volver
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
