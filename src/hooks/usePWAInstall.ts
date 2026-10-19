import { useEffect, useState, useCallback } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const STORAGE_KEY_DEVICE_ID = 'shivani_pwa_device_id';
const STORAGE_KEY_INSTALLED = 'shivani_pwa_installed';

export function getOrCreateDeviceId(): string {
  try {
    let id = localStorage.getItem(STORAGE_KEY_DEVICE_ID);
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      localStorage.setItem(STORAGE_KEY_DEVICE_ID, id);
    }
    return id;
  } catch {
    return 'dev_anon_' + Date.now().toString(36);
  }
}

export function detectDevicePlatform(): 'android' | 'ios' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = window.navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return 'android';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  return 'desktop';
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && (window as unknown as { __deferredPWAInstallPrompt?: BeforeInstallPromptEvent }).__deferredPWAInstallPrompt) {
      return (window as unknown as { __deferredPWAInstallPrompt: BeforeInstallPromptEvent }).__deferredPWAInstallPrompt;
    }
    return null;
  });
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        localStorage.getItem(STORAGE_KEY_INSTALLED) === 'true';
      return isStandalone;
    } catch {
      return false;
    }
  });
  const [isIOS, setIsIOS] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Sync install state to Firestore device registry
  const registerDeviceState = useCallback(async (installed: boolean) => {
    try {
      const deviceId = getOrCreateDeviceId();
      const platform = detectDevicePlatform();
      const hasNotification = typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';

      await setDoc(doc(db, 'notification_subscribers', deviceId), {
        id: deviceId,
        platform,
        userAgent: navigator.userAgent.substring(0, 200),
        installedApp: installed,
        notificationsEnabled: hasNotification,
        lastActive: new Date().toISOString(),
        updatedAt: Date.now()
      }, { merge: true });
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect standalone display mode
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      if (isStandalone) {
        setIsInstalled(true);
        try {
          localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
        } catch {}
        registerDeviceState(true);
      }
    };

    checkStandalone();

    // Detect platform
    const platform = detectDevicePlatform();
    setIsIOS(platform === 'ios');
    setIsDesktop(platform === 'desktop');

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as unknown as { __deferredPWAInstallPrompt?: BeforeInstallPromptEvent }).__deferredPWAInstallPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handlePromptAvailable = () => {
      if ((window as unknown as { __deferredPWAInstallPrompt?: BeforeInstallPromptEvent }).__deferredPWAInstallPrompt) {
        setDeferredPrompt((window as unknown as { __deferredPWAInstallPrompt: BeforeInstallPromptEvent }).__deferredPWAInstallPrompt);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      try {
        localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
      } catch {}
      registerDeviceState(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-available', handlePromptAvailable);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Initial heart beat
    registerDeviceState(isInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-available', handlePromptAvailable);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [registerDeviceState, isInstalled]);

  const install = async (): Promise<boolean> => {
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? (window as unknown as { __deferredPWAInstallPrompt?: BeforeInstallPromptEvent }).__deferredPWAInstallPrompt : null);
    if (!promptEvent) return false;
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        try {
          localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
        } catch {}
        registerDeviceState(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return {
    isInstallable: !!deferredPrompt || (typeof window !== 'undefined' && !!(window as unknown as { __deferredPWAInstallPrompt?: BeforeInstallPromptEvent }).__deferredPWAInstallPrompt),
    isInstalled,
    isIOS,
    isDesktop,
    install,
    platform: detectDevicePlatform(),
  };
}
