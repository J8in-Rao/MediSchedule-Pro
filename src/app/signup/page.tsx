
import Image from 'next/image';
import Link from 'next/link';

import { SignupForm } from '@/components/auth/signup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { ThemeProvider } from '@/components/theme-provider';

export default function SignupPage() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="relative w-full h-screen">
        <div className="absolute top-4 right-4 z-10">
          <ModeToggle />
        </div>
        <Image
          src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2080&auto=format&fit=crop"
          alt="Image of a modern operating room"
          fill
          className="object-cover dark:brightness-[0.3] dark:grayscale"
          data-ai-hint="operating room"
        />
        <div className="relative z-10 flex items-center justify-center h-full py-12">
          <Card className="mx-auto max-w-sm bg-background/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Stethoscope className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold text-primary">MediSchedule Pro</h1>
              </div>
              <CardDescription className="text-center">
                Create your account to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignupForm />
              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/" className="underline">
                  Log in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ThemeProvider>
  );
}
