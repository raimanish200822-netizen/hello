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
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
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

    // Detect iOS
    const platform = detectDevicePlatform();
    setIsIOS(platform === 'ios');

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
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
    window.addEventListener('appinstalled', handleAppInstalled);

    // Initial heart beat
    registerDeviceState(isInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [registerDeviceState, isInstalled]);

  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
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
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
    platform: detectDevicePlatform(),
  };
}
