import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getOrCreateDeviceId, detectDevicePlatform } from '../hooks/usePWAInstall';
import { BroadcastNotification } from '../types';

const STORAGE_SEEN_NOTIFS = 'shivani_seen_notifications_v1';

export function getSeenNotificationIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_SEEN_NOTIFS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markNotificationAsSeen(id: string): void {
  try {
    const seen = new Set(getSeenNotificationIds());
    seen.add(id);
    localStorage.setItem(STORAGE_SEEN_NOTIFS, JSON.stringify(Array.from(seen)));
  } catch {}
}

/**
 * Request native browser/device notification permission.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    const isGranted = permission === 'granted';

    const deviceId = getOrCreateDeviceId();
    const platform = detectDevicePlatform();

    await setDoc(doc(db, 'notification_subscribers', deviceId), {
      id: deviceId,
      platform,
      notificationsEnabled: isGranted,
      subscribedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      updatedAt: Date.now()
    }, { merge: true });

    return isGranted;
  } catch (err) {
    console.error('Notification permission error:', err);
    return false;
  }
}

/**
 * Triggers a native system notification on the user's phone or desktop.
 */
export async function triggerNativePhoneNotification(notif: BroadcastNotification): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  // Device vibration for phones (silent tactile feedback)
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate([150, 80, 150]);
    } catch {}
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  const title = notif.title || 'Shivani Graphics · New Offer!';
  const options: NotificationOptions = {
    body: notif.message,
    icon: notif.imageUrl || '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: notif.id,
    data: {
      url: notif.actionUrl || '/',
      id: notif.id
    }
  };

  try {
    // If Service Worker is active, use ServiceWorkerRegistration.showNotification
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(title, options);
        return true;
      }
    }

    // Fallback to standard Notification constructor
    const n = new Notification(title, options);
    n.onclick = () => {
      window.focus();
      if (notif.actionUrl) {
        window.location.hash = notif.actionUrl.replace(/^#/, '');
      }
    };
    return true;
  } catch (err) {
    console.error('Failed to display native notification:', err);
    return false;
  }
}
