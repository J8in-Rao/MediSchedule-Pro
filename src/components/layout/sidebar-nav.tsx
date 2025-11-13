'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Stethoscope,
  LayoutGrid,
  CalendarDays,
  Users,
  BarChart,
  Settings,
  Hospital,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const allNavItems = [
  { href: '/dashboard/admin', icon: LayoutGrid, label: 'Dashboard', roles: ['admin'] },
  { href: '/dashboard/doctor', icon: LayoutGrid, label: 'Dashboard', roles: ['doctor'] },
  { href: '/dashboard/schedule', icon: CalendarDays, label: 'Schedule', roles: ['admin'] },
  { href: '/dashboard/staff', icon: Stethoscope, label: 'Staff', roles: ['admin'] },
  { href: '/dashboard/patients', icon: Users, label: 'Patients', roles: ['admin'] },
  { href: '/dashboard/ots', icon: Hospital, label: 'OTs', roles: ['admin'] },
  { href: '/dashboard/resources', icon: Package, label: 'Resources', roles: ['admin'] },
  { href: '/dashboard/reports', icon: BarChart, label: 'Reports', roles: ['admin'] },
];

type SidebarNavProps = {
  userRole?: 'admin' | 'doctor';
};

export default function SidebarNav({ userRole }: SidebarNavProps) {
  const pathname = usePathname();

  const navItems = allNavItems.filter(item => userRole && item.roles.includes(userRole));
  const dashboardHref = userRole === 'admin' ? '/dashboard/admin' : '/dashboard/doctor';


  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href={dashboardHref}
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Stethoscope className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">MediSchedule Pro</span>
          </Link>

          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                    {
                      'bg-accent text-accent-foreground': pathname.startsWith(item.href),
                    }
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard/settings"
                className={cn('flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                  { 'bg-accent text-accent-foreground': pathname === '/dashboard/settings' }
                )}
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  );
}
