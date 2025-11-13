import Image from 'next/image';
import Link from 'next/link';

import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 relative">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Stethoscope className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-primary">MediSchedule Pro</h1>
            </div>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop"
          alt="Image of a modern operating room"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.3] dark:grayscale"
          data-ai-hint="operating room"
        />
      </div>
    </div>
  );
}
