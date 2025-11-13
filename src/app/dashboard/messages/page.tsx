'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { ContactMessage } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { toast } from '@/hooks/use-toast';

export default function MessagesPage() {
  const firestore = useFirestore();
  const messagesCollection = useMemoFirebase(() => query(collection(firestore, 'contact_messages'), orderBy('createdAt', 'desc')), [firestore]);
  const { data: messages, isLoading } = useCollection<ContactMessage>(messagesCollection);

  const handleStatusChange = (id: string, status: ContactMessage['status']) => {
    const messageRef = doc(firestore, 'contact_messages', id);
    updateDocumentNonBlocking(messageRef, { status });
    toast({
      title: 'Status Updated',
      description: `Message marked as ${status}.`
    });
  }

  const getStatusBadgeVariant = (status: ContactMessage['status']) => {
    switch (status) {
      case 'Resolved':
        return 'secondary';
      case 'Read':
        return 'outline';
      case 'New':
      default:
        return 'default';
    }
  }

  return (
    <>
      <PageHeader
        title="Incoming Messages"
        description="Review and manage support messages from users."
      />
      <Card>
        <CardHeader>
          <CardTitle>User Messages</CardTitle>
          <CardDescription>A list of all support requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={6} className="text-center">Loading messages...</TableCell></TableRow>}
              {!isLoading && messages?.map(message => (
                <TableRow key={message.id}>
                  <TableCell className="font-medium">{message.userName}</TableCell>
                  <TableCell>{message.userEmail}</TableCell>
                  <TableCell className="max-w-[400px] truncate">{message.message}</TableCell>
                  <TableCell>
                    {message.createdAt && formatDistanceToNow(new Date((message.createdAt as any).seconds * 1000), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(message.status)}>{message.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleStatusChange(message.id, 'Read')}>Mark as Read</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(message.id, 'Resolved')}>Mark as Resolved</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(message.id, 'New')}>Mark as New</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && messages?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">No messages found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
