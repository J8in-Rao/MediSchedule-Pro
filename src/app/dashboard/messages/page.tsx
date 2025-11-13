'use client';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { toast } from '@/hooks/use-toast';
import { collection, serverTimestamp, query, where, or, orderBy } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import type { SupportMessage, UserProfile } from '@/lib/types';
import React, { useMemo, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function MessagesPage() {
  const { user: adminUser } = useUser();
  const firestore = useFirestore();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // 1. Fetch all non-admin users (doctors)
  const usersQuery = useMemoFirebase(() => query(collection(firestore, 'users'), where('role', '!=', 'admin')), [firestore]);
  const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);

  // 2. Fetch all messages
  const allMessagesQuery = useMemoFirebase(() => query(collection(firestore, 'messages'), orderBy('timestamp', 'asc')), [firestore]);
  const { data: allMessages, isLoading: isLoadingMessages } = useCollection<SupportMessage>(allMessagesQuery);
  
  // 3. Group messages by user and find the last message for the conversation list
  const conversations = useMemo(() => {
    if (!allMessages || !users) return [];
    
    const userMap = new Map(users.map(u => [u.id, u]));
    const conversationsMap = new Map<string, { user: UserProfile; lastMessage: SupportMessage }>();

    allMessages.forEach(msg => {
      const otherUserId = msg.sender_id === 'admin-group' ? msg.receiver_id : msg.sender_id;
      const userProfile = userMap.get(otherUserId);
      if(userProfile) {
         conversationsMap.set(otherUserId, { user: userProfile, lastMessage: msg });
      }
    });

    return Array.from(conversationsMap.values()).sort((a,b) => (b.lastMessage.timestamp as any).seconds - (a.lastMessage.timestamp as any).seconds);

  }, [allMessages, users]);

  // 4. Filter messages for the selected conversation
  const selectedUserMessages = useMemo(() => {
    if (!selectedUserId || !allMessages) return [];
    return allMessages.filter(
      (msg) =>
        (msg.sender_id === selectedUserId && msg.receiver_id === 'admin-group') ||
        (msg.sender_id === 'admin-group' && msg.receiver_id === selectedUserId)
    );
  }, [selectedUserId, allMessages]);
  
  const userMap = useMemo(() => {
    const map = new Map<string, {name: string, role: string}>();
    if (users) {
      users.forEach(u => map.set(u.id, { name: `${u.firstName} ${u.lastName}`, role: u.role }));
    }
    // Add a generic admin for sent messages
    map.set('admin-group', {name: 'Admin', role: 'admin'});
    return map;
  }, [users]);


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUserId || !adminUser) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const text = formData.get('message') as string;

    if (!text.trim()) return;

    addDocumentNonBlocking(collection(firestore, 'messages'), {
      sender_id: 'admin-group', // Generic ID for messages sent by any admin
      receiver_id: selectedUserId,
      text,
      timestamp: serverTimestamp(),
      read: false,
      type: 'manual',
    });

    toast({ title: 'Reply Sent!' });
    form.reset();
  };
  
  const isLoading = isLoadingUsers || isLoadingMessages;

  return (
    <>
      <PageHeader
        title="Incoming Messages"
        description="Review and manage messages from doctors."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 h-[75vh]">
        {/* Conversations List */}
        <Card className="md:col-span-1 lg:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-grow overflow-hidden">
            <ScrollArea className="h-full">
              {isLoading && <p className="p-4 text-center">Loading...</p>}
              {conversations.map(({ user, lastMessage }) => (
                <div
                  key={user.id}
                  className={cn(
                    "flex flex-col gap-2 p-4 border-b cursor-pointer hover:bg-muted/50",
                    selectedUserId === user.id && 'bg-muted'
                  )}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">
                      {lastMessage.timestamp && formatDistanceToNow(new Date((lastMessage.timestamp as any).seconds * 1000), { addSuffix: true })}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{lastMessage.text}</p>
                </div>
              ))}
               {!isLoading && conversations.length === 0 && (
                <p className="p-4 text-center text-muted-foreground">No conversations yet.</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="md:col-span-2 lg:col-span-3 h-full flex flex-col">
          <CardHeader>
            <CardTitle>
                {selectedUserId ? userMap.get(selectedUserId)?.name || "Select a conversation" : "Select a conversation"}
            </CardTitle>
             <CardDescription>
                {selectedUserId ? `Chat history with ${userMap.get(selectedUserId)?.name}`: 'Select a user from the left to view messages.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
             {selectedUserId ? (
              <>
                <ScrollArea className="flex-grow pr-4 -mr-4">
                   <div className="space-y-4">
                    {selectedUserMessages.map(msg => {
                        const senderInfo = userMap.get(msg.sender_id);
                        const isSentByAdmin = msg.sender_id === 'admin-group';
                        
                        return (
                        <div key={msg.id} className={cn("flex items-end gap-2", isSentByAdmin ? 'justify-end' : 'justify-start')}>
                            {!isSentByAdmin && (
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{senderInfo?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            )}
                            <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2", isSentByAdmin ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                            <p className="font-bold text-sm">{senderInfo?.name}</p>
                            <p className="text-sm">{msg.text}</p>
                            <p className="text-xs text-right opacity-70 mt-1">
                                {msg.timestamp && formatDistanceToNow(new Date((msg.timestamp as any).seconds * 1000), { addSuffix: true })}
                            </p>
                            </div>
                            {isSentByAdmin && (
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>A</AvatarFallback>
                            </Avatar>
                            )}
                        </div>
                        )
                    })}
                    </div>
                </ScrollArea>
                <form
                    className="flex w-full items-center space-x-2 pt-4 border-t"
                    onSubmit={handleSubmit}
                >
                    <Textarea name="message" placeholder="Type your reply..." className="flex-1 resize-none" rows={1}/>
                    <Button type="submit">Send</Button>
                </form>
              </>
            ) : (
                 <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Select a conversation to start chatting.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
