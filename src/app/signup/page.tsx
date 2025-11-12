import Link from 'next/link';
import { SignupForm } from '@/components/auth/signup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-4">
        <Card className="shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Stethoscope className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">MediSchedule Pro</h1>
            </div>
            <CardTitle className="text-2xl">Create a Doctor Account</CardTitle>
            <CardDescription>Enter your details to register as a doctor.</CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm />
            <div className="mt-4 text-sm text-center">
              Already have an account?{' '}
              <Link href="/" className="underline text-primary">
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    