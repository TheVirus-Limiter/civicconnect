import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface OfflineState {
  isOnline: boolean;
  isOfflineReady: boolean;
}

export function OfflineIndicator() {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isOfflineReady: false
  });
  
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Register service worker if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(() => {
        setState(prev => ({ ...prev, isOfflineReady: true }));
      });
    }
    
    // Listen for online/offline events
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { isOnline, isOfflineReady } = state;

  const handleSync = async () => {
    setIsSyncing(true);
    // Simple refresh of data
    window.location.reload();
  };

  const getConnectionStatus = () => {
    if (isOnline && isOfflineReady) {
      return { icon: CheckCircle2, text: "Online & Offline Ready", variant: "default" as const };
    }
    if (isOnline) {
      return { icon: Wifi, text: "Online", variant: "default" as const };
    }
    if (isOfflineReady) {
      return { icon: WifiOff, text: "Offline Mode", variant: "secondary" as const };
    }
    return { icon: AlertCircle, text: "Limited Functionality", variant: "destructive" as const };
  };

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isOfflineReady ? "Offline - Using cached data" : "Offline"}
          </span>
        </div>
      </div>
    );
  }

  if (isOfflineReady) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">Offline Ready</span>
        </div>
      </div>
    );
  }

  return null;
}

export default OfflineIndicator;