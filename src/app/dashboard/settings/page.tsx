'use client';

import React from 'react';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { PageHeader } from '@/components/shared/page-header';
import DoctorSettingsForm from '@/components/settings/doctor-settings-form';
import type { UserProfile, Doctor } from '@/lib/types';

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => (user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const doctorDocRef = useMemoFirebase(() => (user ? doc(firestore, 'doctors', user.uid) : null), [firestore, user]);
  const { data: doctorProfile, isLoading: isDoctorLoading } = useDoc<Doctor>(doctorDocRef);

  const isLoading = isUserLoading || isProfileLoading || isDoctorLoading;

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account and profile settings."
      />
      <div className="grid gap-6">
        {isLoading ? (
          <p>Loading settings...</p>
        ) : (userProfile?.role === 'admin' || userProfile?.role === 'doctor') ? (
          <DoctorSettingsForm userProfile={userProfile} doctorProfile={doctorProfile} />
        ) : (
          <p>Could not determine user role. Please contact support.</p>
        )}
      </div>
    </>
  );
}

    