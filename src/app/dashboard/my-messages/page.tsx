'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { toast } from '@/hooks/use-toast';
import { collection, serverTimestamp, query, where, or } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import type { SupportMessage, UserProfile } from '@/lib/types';
import React, { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function MyMessagesPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const messagesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'messages'),
      or(where('sender_id', '==', user.uid), where('receiver_id', '==', user.uid))
    );
  }, [firestore, user]);
  
  const { data: messages, isLoading } = useCollection<SupportMessage>(messagesQuery);
  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users } = useCollection<UserProfile>(usersQuery);

  const userMap = useMemo(() => {
    const map = new Map<string, {name: string, role: string}>();
    if (users) {
      users.forEach(u => map.set(u.id, { name: `${u.firstName} ${u.lastName}`, role: u.role }));
    }
    return map;
  }, [users]);
  
  const sortedMessages = useMemo(() => {
    return messages?.sort((a, b) => (a.timestamp as any).seconds - (b.timestamp as any).seconds);
  }, [messages]);


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const text = formData.get('message') as string;

    if (!text.trim() || !user) return;

    addDocumentNonBlocking(collection(firestore, 'messages'), {
      sender_id: user.uid,
      receiver_id: 'admin', // Simplified: all messages go to admin for now
      text,
      timestamp: serverTimestamp(),
      read: false,
      type: 'manual',
    });

    toast({ title: 'Message Sent!' });
    form.reset();
  };

  return (
    <>
      <PageHeader
        title="My Messages"
        description="Communicate with admins and other staff."
      />
      <Card className="h-[70vh] flex flex-col">
        <CardHeader>
            <CardTitle>Chat</CardTitle>
            <CardDescription>Direct messages with the administrative team.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
          <ScrollArea className="flex-grow pr-4">
            <div className="space-y-4">
              {isLoading && <p>Loading messages...</p>}
              {sortedMessages?.map(msg => {
                const senderInfo = userMap.get(msg.sender_id);
                const isSentByCurrentUser = msg.sender_id === user?.uid;
                
                return (
                  <div key={msg.id} className={cn("flex items-end gap-2", isSentByCurrentUser ? 'justify-end' : 'justify-start')}>
                    {!isSentByCurrentUser && (
                       <Avatar className="h-8 w-8">
                        <AvatarFallback>{senderInfo?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2", isSentByCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                      <p className="font-bold text-sm">{senderInfo?.name}</p>
                      <p className="text-sm">{msg.text}</p>
                       <p className="text-xs text-right opacity-70 mt-1">
                        {msg.timestamp && formatDistanceToNow(new Date((msg.timestamp as any).seconds * 1000), { addSuffix: true })}
                      </p>
                    </div>
                     {isSentByCurrentUser && (
                       <Avatar className="h-8 w-8">
                        <AvatarFallback>{senderInfo?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )
              })}
              {!isLoading && sortedMessages?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</p>
              )}
            </div>
          </ScrollArea>
           <form
            className="flex w-full items-center space-x-2 pt-4 border-t"
            onSubmit={handleSubmit}
          >
            <Textarea
              id="message"
              name="message"
              placeholder="Type your message..."
              className="flex-1 resize-none"
              rows={1}
            />
            <Button type="submit">
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
