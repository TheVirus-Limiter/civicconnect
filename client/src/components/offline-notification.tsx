import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useOffline } from '@/hooks/use-offline';

interface OfflineNotificationProps {
  className?: string;
}

export function OfflineNotification({ className }: OfflineNotificationProps) {
  const { isOnline, isOfflineReady } = useOffline();
  const [wasOffline, setWasOffline] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'offline' | 'back-online'>('offline');

  useEffect(() => {
    if (!isOnline && !wasOffline) {
      // Just went offline
      setWasOffline(true);
      setNotificationType('offline');
      setShowNotification(true);
    } else if (isOnline && wasOffline) {
      // Just came back online
      setWasOffline(false);
      setNotificationType('back-online');
      setShowNotification(true);
      
      // Auto-hide the "back online" notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
  }, [isOnline, wasOffline]);

  const handleDismiss = () => {
    setShowNotification(false);
  };

  if (!showNotification) return null;

  if (notificationType === 'back-online') {
    return (
      <div className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}>
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-green-800 dark:text-green-300">
              Back online! Data syncing...
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="h-auto p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            >
              <X className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}>
      <Alert className="bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800">
        <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <AlertDescription className="flex items-center justify-between">
          <div className="text-orange-800 dark:text-orange-300">
            <div className="font-medium">You're offline</div>
            <div className="text-sm mt-1">
              {isOfflineReady 
                ? "Cached data is available for browsing"
                : "Limited functionality available"
              }
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss}
            className="h-auto p-1 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
          >
            <X className="h-3 w-3" />
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default OfflineNotification;