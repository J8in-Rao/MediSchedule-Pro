'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

// Define the UserProfile type for type safety
interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'patient';
}

export default function DashboardRedirectPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}`) : null, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    // Wait for both user and profile to finish loading
    if (isUserLoading || isProfileLoading) {
      return;
    }

    if (!user) {
      // If not logged in, redirect to login page
      router.replace('/');
      return;
    }

    if (userProfile) {
      // Redirect based on the user's role
      if (userProfile.role === 'admin') {
        router.replace('/dashboard/admin');
      } else if (userProfile.role === 'patient') {
        router.replace('/dashboard/patient');
      } else {
        // Fallback for any other roles or if role is not set
        // For now, we can send them to a generic page or the login page
        router.replace('/');
      }
    }
  }, [user, userProfile, isUserLoading, isProfileLoading, router]);

  // Render a loading state while we determine the redirect
  return (
    <div className="flex h-screen items-center justify-center">
      <p>Loading your dashboard...</p>
    </div>
  );
}
