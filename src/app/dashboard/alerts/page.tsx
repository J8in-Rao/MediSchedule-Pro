'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import type { SupportMessage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AlertsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  // Query for system messages directed at the current user
  const alertsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'messages'),
      where('receiver_id', '==', user.uid),
      where('type', '==', 'system')
      // orderBy('timestamp', 'desc') // Temporarily removed to prevent permission error
    );
  }, [firestore, user]);

  const { data: alerts, isLoading } = useCollection<SupportMessage>(alertsQuery);
  
  // Client-side sorting as a temporary measure
  const sortedAlerts = alerts?.sort((a, b) => {
      const timeA = (a.timestamp as any)?.seconds || 0;
      const timeB = (b.timestamp as any)?.seconds || 0;
      return timeB - timeA;
  });


  const handleMarkAsRead = (alertId: string) => {
    const alertRef = doc(firestore, 'messages', alertId);
    updateDocumentNonBlocking(alertRef, { read: true });
  };
  
  const handleMarkAllAsRead = () => {
    alerts?.forEach(alert => {
        if (!alert.read) {
            handleMarkAsRead(alert.id);
        }
    })
  }

  return (
    <>
      <PageHeader
        title="My Alerts"
        description="System notifications about important updates and schedule changes."
      >
        <Button onClick={handleMarkAllAsRead} disabled={(alerts?.filter(a => !a.read).length || 0) === 0}>
            <Check className="mr-2 h-4 w-4" />
            Mark All as Read
        </Button>
      </PageHeader>
      <Card className="h-[75vh] flex flex-col">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>A log of all system-generated notifications.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden p-0">
          <ScrollArea className="h-full">
             <div className="space-y-0">
                {isLoading && <p className="p-6">Loading alerts...</p>}
                {sortedAlerts?.map(alert => (
                    <div key={alert.id} className={cn("flex items-start gap-4 p-6 border-b", alert.read ? 'opacity-60' : 'bg-muted/50')}>
                        <div className="flex-shrink-0 pt-1">
                             <Bell className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{alert.text}</p>
                            <p className="text-xs text-muted-foreground">
                                {alert.timestamp && formatDistanceToNow(new Date((alert.timestamp as any).seconds * 1000), { addSuffix: true })}
                            </p>
                        </div>
                         {!alert.read && (
                            <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(alert.id)}>
                                <Check className="h-4 w-4 mr-2" /> Mark as read
                            </Button>
                        )}
                    </div>
                ))}
                {!isLoading && alerts?.length === 0 && (
                    <div className="p-6 text-center text-muted-foreground">You have no new alerts.</div>
                )}
             </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  );
}
