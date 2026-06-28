'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { SignOutButton } from './SignOutButton'
import {
  LayoutDashboard,
  Calendar,
  Search,
  Star,
  Heart,
  Users,
  Briefcase,
  ShieldCheck,
  BarChart2,
  Zap,
  User,
  Settings2,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

type UserRole = 'customer' | 'business' | 'admin'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  customer: [
    { label: 'Overview', href: '/dashboard/customer', icon: LayoutDashboard },
    { label: 'My Bookings', href: '/dashboard/customer/bookings', icon: Calendar },
    { label: 'Find Services', href: '/search', icon: Search },
    { label: 'My Reviews', href: '/dashboard/customer/reviews', icon: Star },
    { label: 'Favorites', href: '/dashboard/customer/favorites', icon: Heart },
  ],
  business: [
    { label: 'Overview', href: '/dashboard/business', icon: LayoutDashboard },
    { label: 'Appointments', href: '/dashboard/business/appointments', icon: Calendar },
    { label: 'Analytics', href: '/dashboard/business/analytics', icon: BarChart2 },
    { label: 'Business Settings', href: '/dashboard/business/settings', icon: Settings2 },
    { label: 'Subscription', href: '/dashboard/business/subscription', icon: Zap },
  ],
  admin: [
    { label: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
    { label: 'Users', href: '/dashboard/admin/users', icon: Users },
    { label: 'Businesses', href: '/dashboard/admin/businesses', icon: Briefcase },
    { label: 'Verifications', href: '/dashboard/admin/verifications', icon: ShieldCheck },
    { label: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart2 },
  ],
}

const roleLabel: Record<UserRole, string> = {
  customer: 'Customer',
  business: 'Business Owner',
  admin: 'Administrator',
}

const roleBadgeColor: Record<UserRole, string> = {
  customer: 'bg-primary/10 text-primary',
  business: 'bg-warning/10 text-warning',
  admin: 'bg-destructive/10 text-destructive',
}

interface SidebarProps {
  role: UserRole
  displayName: string
  email: string
  avatarUrl?: string | null
}

export function Sidebar({ role, displayName, email, avatarUrl }: SidebarProps) {
  const pathname = usePathname()
  // Default: NOT collapsed — safer default, avoids flash of wrong layout
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored !== null) setCollapsed(stored === 'true')
  }, [])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('sidebar-collapsed', String(next))
      return next
    })
  }

  const navItems = NAV_ITEMS[role]

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  // Use mounted to avoid hydration mismatch with localStorage
  const isCollapsed = mounted && collapsed

  const NavContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const showLabels = isMobile || !isCollapsed

    return (
      <div
        className={cn(
          'flex flex-col h-full bg-white border-r border-border transition-all duration-300 ease-in-out overflow-hidden',
          !isMobile && (isCollapsed ? 'w-[68px]' : 'w-[240px]'),
          isMobile && 'w-[260px]'
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-border shrink-0',
          !showLabels ? 'justify-center' : 'justify-between'
        )}>
          {showLabels && (
            <Link href="/" className="flex items-center gap-2 min-w-0">
              <span className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs shrink-0">P</span>
              <span className="font-heading font-bold text-foreground text-sm truncate">Pesanaja.Lab</span>
            </Link>
          )}
          {!isMobile ? (
            <button
              onClick={toggleCollapse}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          ) : (
            <button
              onClick={() => setMobileOpen(false)}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* User info */}
        <div className={cn('border-b border-border shrink-0 py-3', showLabels ? 'px-3' : 'px-2')}>
          {showLabels ? (
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <div className="h-9 w-9 shrink-0 relative rounded-full overflow-hidden border border-border">
                  <img src={avatarUrl} alt={displayName} className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{email}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              {avatarUrl ? (
                <div className="h-9 w-9 shrink-0 relative rounded-full overflow-hidden border border-border">
                  <img src={avatarUrl} alt={displayName} className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {initials}
                </div>
              )}
            </div>
          )}
          {showLabels && (
            <div className="mt-2">
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', roleBadgeColor[role])}>
                {roleLabel[role]}
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5" style={{ padding: showLabels ? '12px 8px' : '12px 4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon
            // Active if exact match OR starts with href (for nested routes, but NOT root)
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg text-sm font-medium transition-colors group',
                  showLabels ? 'gap-3 px-2 py-2.5' : 'justify-center p-2.5',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                title={!showLabels ? item.label : undefined}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : '')} />
                {showLabels && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {isActive && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className={cn('border-t border-border shrink-0 py-3 space-y-0.5', showLabels ? 'px-2' : 'px-1')}>
          <Link
            href="/dashboard/profile"
            className={cn(
              'flex items-center rounded-lg text-sm font-medium transition-colors',
              showLabels ? 'gap-3 px-2 py-2.5' : 'justify-center p-2.5',
              pathname === '/dashboard/profile'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            title={!showLabels ? 'Profile Settings' : undefined}
          >
            <User className="h-4 w-4 shrink-0" />
            {showLabels && <span>Profile Settings</span>}
          </Link>
          <SignOutButton collapsed={!showLabels} />
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col h-screen sticky top-0 shrink-0">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-border flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-white font-bold text-xs">P</span>
          <span className="font-heading font-bold text-foreground text-sm">Pesanaja.Lab</span>
        </Link>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          'md:hidden fixed top-0 left-0 z-50 h-full shadow-xl transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <NavContent isMobile />
      </div>
    </>
  )
}
