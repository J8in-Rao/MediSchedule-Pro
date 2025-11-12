'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { PageHeader } from '@/components/shared/page-header';
import DoctorSettingsForm from '@/components/settings/doctor-settings-form';
import PatientSettingsForm from '@/components/settings/patient-settings-form';
import type { UserProfile, Doctor, Patient } from '@/lib/types';
import React from 'react';

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => (user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const doctorDocRef = useMemoFirebase(() => (user ? doc(firestore, 'doctors', user.uid) : null), [firestore, user]);
  const { data: doctorProfile, isLoading: isDoctorLoading } = useDoc<Doctor>(doctorDocRef);

  const patientDocRef = useMemoFirebase(() => (user ? doc(firestore, 'patients', user.uid) : null), [firestore, user]);
  const { data: patientProfile, isLoading: isPatientLoading } = useDoc<Patient>(patientDocRef);


  const isLoading = isUserLoading || isProfileLoading || isDoctorLoading || isPatientLoading;

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account and profile settings."
      />
      <div className="grid gap-6">
        {isLoading ? (
          <p>Loading settings...</p>
        ) : userProfile?.role === 'admin' ? (
          <DoctorSettingsForm userProfile={userProfile} doctorProfile={doctorProfile} />
        ) : userProfile?.role === 'patient' ? (
          <PatientSettingsForm userProfile={userProfile} patientProfile={patientProfile} />
        ) : (
          <p>Could not determine user role.</p>
        )}
      </div>
    </>
  );
}
