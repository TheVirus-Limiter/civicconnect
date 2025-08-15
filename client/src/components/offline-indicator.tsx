import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOffline } from '@/hooks/use-offline';
import { useToast } from '@/hooks/use-toast';

export function OfflineIndicator() {
  const { 
    isOnline, 
    isOfflineReady, 
    lastSync, 
    hasServiceWorker,
    syncData,
    clearOfflineData,
    getStorageUsage 
  } = useOffline();
  
  const { toast } = useToast();
  const [storageInfo, setStorageInfo] = useState<StorageEstimate | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Get storage usage information
    getStorageUsage().then(setStorageInfo);
  }, [getStorageUsage]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncData();
      toast({
        title: "Sync Complete",
        description: "Civic data has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Unable to sync data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearData = async () => {
    try {
      await clearOfflineData();
      toast({
        title: "Offline Data Cleared",
        description: "All cached data has been removed.",
      });
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: "Unable to clear offline data.",
        variant: "destructive",
      });
    }
  };

  const formatStorageSize = (bytes: number | undefined): string => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getConnectionStatus = () => {
    if (!hasServiceWorker) {
      return { icon: AlertCircle, text: "Service Worker not available", color: "destructive" as const };
    }
    
    if (isOnline && isOfflineReady) {
      return { icon: CheckCircle2, text: "Online & Offline Ready", color: "default" as const };
    }
    
    if (isOnline) {
      return { icon: Wifi, text: "Online", color: "default" as const };
    }
    
    if (isOfflineReady) {
      return { icon: WifiOff, text: "Offline Mode", color: "secondary" as const };
    }
    
    return { icon: AlertCircle, text: "Limited Functionality", color: "destructive" as const };
  };

  const status = getConnectionStatus();
  const StatusIcon = status.icon;

  // Don't show for fully online users unless they want to see status
  if (isOnline && hasServiceWorker && !window.location.hash.includes('offline-debug')) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Badge variant={status.color} className="flex items-center gap-2">
          <StatusIcon className="w-3 h-3" />
          <span className="text-xs">{isOfflineReady ? "Offline Ready" : "Online"}</span>
        </Badge>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <StatusIcon className="w-4 h-4" />
              <span className="font-medium text-sm">{status.text}</span>
            </div>
            <Badge variant={status.color}>{isOnline ? "Online" : "Offline"}</Badge>
          </div>

          {!isOnline && (
            <div className="mb-3 p-2 bg-orange-50 dark:bg-orange-950 rounded-md">
              <p className="text-xs text-orange-700 dark:text-orange-300">
                You're offline, but cached data is available for browsing bills, representatives, and news.
              </p>
            </div>
          )}

          {isOfflineReady && (
            <div className="space-y-2 mb-3">
              <div className="flex justify-between items-center text-xs">
                <span>Storage Used:</span>
                <span>{formatStorageSize(storageInfo?.usage)}</span>
              </div>
              
              {lastSync && (
                <div className="flex justify-between items-center text-xs">
                  <span>Last Sync:</span>
                  <span>{lastSync.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {isOnline && isOfflineReady && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleSync}
                disabled={isSyncing}
                className="flex-1"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync'}
              </Button>
            )}
            
            {isOfflineReady && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleClearData}
                className="flex-1"
              >
                <Download className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {!hasServiceWorker && (
            <div className="mt-3 p-2 bg-red-50 dark:bg-red-950 rounded-md">
              <p className="text-xs text-red-700 dark:text-red-300">
                Offline features are not available in this browser.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default OfflineIndicator;