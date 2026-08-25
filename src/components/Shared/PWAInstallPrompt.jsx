import React, { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone, Sparkles, CheckCircle2, ChevronRight, ShieldCheck, Zap, BookOpen } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [platform, setPlatform] = useState({
    isIOS: false,
    isSafari: false,
    isMacSafari: false,
    isChromium: false
  });

  useEffect(() => {
    // 1. Détection si l'application est déjà lancée en mode autonome (PWA installée)
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) return;

    // 2. Détection de la plateforme et du navigateur
    const ua = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS|Android/i.test(ua);
    const isMacSafari = !isIOS && isSafari && /Macintosh/i.test(ua);
    const isChromium = /Chrome|Chromium|Edg|OPR/i.test(ua);

    setPlatform({ isIOS, isSafari, isMacSafari, isChromium });

    // 3. Vérification de la préférence utilisateur (snooze / refus)
    const dismissedUntil = localStorage.getItem('historia_pwa_dismissed_until');
    const isDismissed = dismissedUntil && (dismissedUntil === 'never' || Date.now() < parseInt(dismissedUntil, 10));

    // 4. Écoute de l'événement PWA standard (Chrome / Edge / Android)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed) {
        // Délais doux de 2.5 secondes pour ne pas agresser au chargement initial
        setTimeout(() => setShowBanner(true), 2500);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Si sur iOS Safari ou Mac Safari et non ignoré, afficher après un petit délai
    if ((isIOS || isMacSafari) && !isDismissed) {
      setTimeout(() => setShowBanner(true), 3000);
    }

    // Écouter si l'utilisateur installe l'app
    window.addEventListener('appinstalled', () => {
      setShowBanner(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Déclencher l'installation ou le guide
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Cas Chrome / Edge / Android : Prompt natif
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (platform.isIOS || platform.isSafari) {
      // Cas Safari (iOS / Mac) : Afficher le tutoriel interactif
      setShowIosModal(true);
    } else {
      // Fallback modal d'explication
      setShowIosModal(true);
    }
  };

  // Fermer temporairement (3 jours)
  const handleDismiss = (days = 3) => {
    setShowBanner(false);
    const expireTime = Date.now() + days * 24 * 60 * 60 * 1000;
    localStorage.setItem('historia_pwa_dismissed_until', expireTime.toString());
  };

  // Fermer définitivement
  const handleNeverAsk = () => {
    setShowBanner(false);
    localStorage.setItem('historia_pwa_dismissed_until', 'never');
  };

  if (isStandalone) return null;

  return (
    <>
      {/* 🚀 Bandeau Flottant Incitatif (Bas d'écran) */}
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-bounce-subtle">
          <div className="bg-gradient-to-br from-[#0c1427] via-[#0f172a] to-[#0a0f1d] border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-md">
            
            <div className="flex items-start gap-3.5">
              {/* Logo Icon Nuance C */}
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#0a0f1d] border border-amber-400/50 p-1 shrink-0 shadow-inner flex items-center justify-center overflow-hidden">
                <img 
                  src="/favicon.svg" 
                  alt="Historia App Icon" 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Text content */}
              <div className="flex-grow min-w-0 pr-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold tracking-wider uppercase">
                    App Gratuite
                  </span>
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> Sans pub
                  </span>
                </div>
                <h4 className="font-serif font-bold text-slate-100 text-base leading-tight truncate">
                  Installer l'application Historia
                </h4>
                <p className="text-slate-300 text-xs mt-0.5 line-clamp-2">
                  {platform.isIOS 
                    ? "Accédez à vos 200 chapitres en plein écran d'un simple toucher." 
                    : "Téléchargez l'application pour une lecture fluide et hors-ligne."}
                </p>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => handleDismiss(3)}
                className="text-slate-400 hover:text-white p-1 -mt-1 -mr-1 rounded-lg transition-colors"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-2.5 mt-3.5 pt-3 border-t border-slate-800/80">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Installer maintenant</span>
              </button>
              
              <button
                onClick={() => handleDismiss(7)}
                className="text-slate-400 hover:text-slate-200 text-xs px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                Plus tard
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 📱 Modal Guide d'installation pas-à-pas (Spécial Safari iOS & Mac) */}
      {showIosModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f172a] border border-amber-500/40 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-slate-100 overflow-hidden">
            
            {/* Background gold flare */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0a0f1d] border border-amber-400/50 p-1 flex items-center justify-center overflow-hidden">
                  <img src="/favicon.svg" alt="Historia" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-amber-200">Installer Historia</h3>
                  <p className="text-xs text-slate-400">Guide d'installation rapide</p>
                </div>
              </div>
              <button 
                onClick={() => setShowIosModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="py-5 space-y-4">
              {platform.isIOS ? (
                <>
                  <div className="flex items-start gap-3.5 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-sm">
                      1
                    </div>
                    <div className="text-sm">
                      <p className="text-slate-200">
                        Dans la barre de navigation Safari, touchez le bouton <strong>Partager</strong> :
                      </p>
                      <div className="inline-flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-300 mt-1.5 border border-slate-700">
                        <Share2 className="w-4 h-4 text-blue-400" />
                        <span>Bouton Partager (en bas sur iPhone, en haut sur iPad)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-sm">
                      2
                    </div>
                    <div className="text-sm">
                      <p className="text-slate-200">
                        Faites défiler le menu vers le bas et sélectionnez :
                      </p>
                      <div className="inline-flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-300 mt-1.5 border border-slate-700">
                        <PlusSquare className="w-4 h-4 text-amber-400" />
                        <span>Sur l'écran d'accueil</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-sm">
                      3
                    </div>
                    <div className="text-sm">
                      <p className="text-slate-200">
                        Touchez <strong>"Ajouter"</strong> en haut à droite. L'icône Historia apparait immédiatement sur votre écran d'accueil !
                      </p>
                    </div>
                  </div>
                </>
              ) : platform.isMacSafari ? (
                <>
                  <div className="flex items-start gap-3.5 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-sm">
                      1
                    </div>
                    <div className="text-sm">
                      <p className="text-slate-200">
                        Dans la barre des menus de Safari (en haut à gauche de votre Mac), cliquez sur <strong>Fichier</strong>.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-sm">
                      2
                    </div>
                    <div className="text-sm">
                      <p className="text-slate-200">
                        Sélectionnez <strong>"Ajouter au Dock..."</strong> puis validez. Historia s'ouvrira comme une application Mac native !
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3.5 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-sm">
                      1
                    </div>
                    <div className="text-sm">
                      <p className="text-slate-200">
                        Dans la barre d'adresse de votre navigateur, cliquez sur l'icône <strong>Installer (⊞)</strong> à droite de l'URL.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Benefits Footer */}
            <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 text-xs text-slate-300 space-y-1.5 mb-5">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pourquoi installer l'application ?</span>
              </div>
              <p>• Expérience plein écran sans distractions de navigateur.</p>
              <p>• Chargement instantané et mémorisation de votre lecture.</p>
            </div>

            <button
              onClick={() => {
                setShowIosModal(false);
                setShowBanner(false);
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
            >
              J'ai compris
            </button>

          </div>
        </div>
      )}
    </>
  );
}
