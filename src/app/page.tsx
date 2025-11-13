import Image from 'next/image';
import Link from 'next/link';

import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background relative">
       <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="w-full max-w-md p-4">
        <Card className="shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Stethoscope className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">MediSchedule Pro</h1>
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
