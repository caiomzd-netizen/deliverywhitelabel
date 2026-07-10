import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-in-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-orange-100 p-4 flex items-center gap-3">
        <span className="text-3xl">📲</span>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">Instale o App</p>
          <p className="text-xs text-gray-500">Adicione à tela inicial para acesso rápido</p>
        </div>
        <button
          onClick={handleInstall}
          className="bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-orange-600 transition"
        >
          Instalar
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
