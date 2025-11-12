'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  PanelLeft,
  Search,
  LayoutGrid,
  CalendarDays,
  Stethoscope,
  Users,
  BarChart,
  User,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const allMobileNavItems = [
  { href: '/dashboard/admin', icon: LayoutGrid, label: 'Dashboard', roles: ['admin'] },
  { href: '/dashboard/patient', icon: LayoutGrid, label: 'Dashboard', roles: ['patient'] },
  { href: '/dashboard/schedule', icon: CalendarDays, label: 'Schedule', roles: ['admin'] },
  { href: '/dashboard/staff', icon: Stethoscope, label: 'Staff', roles: ['admin'] },
  { href: '/dashboard/patients', icon: Users, label: 'Patients', roles: ['admin'] },
  { href: '/dashboard/reports', icon: BarChart, label: 'Reports', roles: ['admin'] },
  { href: '/dashboard/messages', icon: MessageSquare, label: 'Messages', roles: ['admin'] },
];

type HeaderProps = {
  userRole?: 'admin' | 'patient';
};

export default function Header({ userRole }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const pathParts = pathname.split('/').filter(Boolean);

  const mobileNavItems = allMobileNavItems.filter(item => userRole && item.roles.includes(userRole));
  const dashboardHref = userRole === 'admin' ? '/dashboard/admin' : '/dashboard/patient';

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: 'Logout Failed',
        description: "An error occurred while logging out.",
      });
    }
  };

  const ProfileIcon = userRole === 'admin' ? ShieldCheck : User;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
           <SheetHeader>
            <SheetTitle>
                 <Link
                    href={dashboardHref}
                    className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                    >
                    <Stethoscope className="h-5 w-5 transition-all group-hover:scale-110" />
                    <span className="sr-only">MediSchedule Pro</span>
                </Link>
            </SheetTitle>
            <SheetDescription>A sidebar navigation for MediSchedule Pro.</SheetDescription>
          </SheetHeader>
          <nav className="grid gap-6 text-lg font-medium mt-4">
            {mobileNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground',
                  { 'text-foreground': pathname === item.href }
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={dashboardHref}>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {pathParts.slice(1).map((part, index) => (
             <React.Fragment key={index}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="capitalize">{part}</BreadcrumbPage>
                </BreadcrumbItem>
              </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-muted pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
             <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ProfileIcon className="h-5 w-5" />
             </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link href="/dashboard/settings">Settings</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href="/dashboard/support">Support</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
