'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

interface UserProfile {
  id: string;
  role: 'admin' | 'doctor';
}

export default function DashboardRedirectPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}`) : null, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (isUserLoading || isProfileLoading) {
      return;
    }

    if (!user) {
      router.replace('/');
      return;
    }

    if (userProfile) {
      if (userProfile.role === 'admin') {
        router.replace('/dashboard/admin');
      } else if (userProfile.role === 'doctor') {
        router.replace('/dashboard/doctor');
      } else {
        router.replace('/');
      }
    }
  }, [user, userProfile, isUserLoading, isProfileLoading, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Loading your dashboard...</p>
    </div>
  );
}

    