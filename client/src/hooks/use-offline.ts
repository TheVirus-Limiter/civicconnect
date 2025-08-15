import { useState, useEffect } from 'react';

interface OfflineState {
  isOnline: boolean;
  isOfflineReady: boolean;
  lastSync: Date | null;
  hasServiceWorker: boolean;
}

interface ServiceWorkerMessage {
  type: string;
  timestamp: string;
  data?: any;
}

export function useOffline() {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isOfflineReady: false,
    lastSync: null,
    hasServiceWorker: false
  });

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      // Trigger background sync when coming back online
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          // Try to register sync if available
          if ('sync' in registration) {
            (registration as any).sync.register('civic-data-sync');
          }
        }).catch(error => {
          console.error('Background sync registration failed:', error);
        });
      }
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    // Listen for service worker messages
    const handleServiceWorkerMessage = (event: MessageEvent<ServiceWorkerMessage>) => {
      if (event.data.type === 'SYNC_COMPLETE') {
        setState(prev => ({ 
          ...prev, 
          lastSync: new Date(event.data.timestamp) 
        }));
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully:', registration.scope);
      
      setState(prev => ({ ...prev, hasServiceWorker: true }));

      // Check if service worker is ready for offline use
      if (registration.active) {
        setState(prev => ({ ...prev, isOfflineReady: true }));
      }

      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              setState(prev => ({ ...prev, isOfflineReady: true }));
              // Notify user about update
              showUpdateNotification();
            }
          });
        }
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const showUpdateNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Connected Civics Updated', {
        body: 'The app has been updated and is ready for offline use!',
        icon: '/icon-192.png',
        tag: 'app-update'
      });
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const syncData = async (): Promise<void> => {
    if (!state.hasServiceWorker || !state.isOnline) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      if ('sync' in registration) {
        await (registration as any).sync.register('civic-data-sync');
      }
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  const clearOfflineData = async (): Promise<void> => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
      setState(prev => ({ ...prev, isOfflineReady: false, lastSync: null }));
    }
  };

  const getStorageUsage = async (): Promise<StorageEstimate | null> => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return await navigator.storage.estimate();
    }
    return null;
  };

  return {
    ...state,
    requestNotificationPermission,
    syncData,
    clearOfflineData,
    getStorageUsage
  };
}

export default useOffline;