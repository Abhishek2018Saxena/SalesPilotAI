import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MessagesSquare,
  CalendarClock,
  BarChart3,
  Plug,
  CreditCard,
  Settings,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/hooks/useData';
import { DEMO_NOTIFICATIONS } from '@/lib/demoData';
import { initials, cn } from '@/lib/utils';
import type { SearchResult } from '@/types';

const NAV = [
  {
    section: 'WORKSPACE',
    items: [
      { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { to: '/leads', label: 'Leads', icon: Users },
      { to: '/conversations', label: 'Conversations', icon: MessagesSquare },
      { to: '/follow-ups', label: 'Follow-ups', icon: CalendarClock },
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    section: 'TOOLS',
    items: [
      { to: '/integrations', label: 'Integrations', icon: Plug },
      { to: '/billing', label: 'Billing', icon: CreditCard },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { profile, signOut, isDemo } = useAuth();
  const { leads, conversations } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const displayName = profile?.full_name || 'Sales Rep';
  const email = profile?.email || 'demo@salespilot.ai';

  const searchResults: SearchResult[] = search.trim()
    ? [
        ...leads
          .filter((l) => l.name.toLowerCase().includes(search.toLowerCase()))
          .slice(0, 4)
          .map((l) => ({
            id: l.id,
            type: 'lead' as const,
            label: l.name,
            subtitle: l.company,
            href: `/leads/${l.id}`,
          })),
        ...leads
          .filter((l) => l.company.toLowerCase().includes(search.toLowerCase()))
          .slice(0, 3)
          .map((l) => ({
            id: `c-${l.id}`,
            type: 'company' as const,
            label: l.company,
            subtitle: l.name,
            href: `/leads/${l.id}`,
          })),
        ...conversations
          .filter((c) => c.conversation_text.toLowerCase().includes(search.toLowerCase()))
          .slice(0, 3)
          .map((c) => ({
            id: c.id,
            type: 'conversation' as const,
            label: c.conversation_text.slice(0, 40) + '...',
            subtitle: 'Conversation',
            href: c.lead_id ? `/leads/${c.lead_id}` : '/conversations',
          })),
      ]
    : [];

  const notifications = DEMO_NOTIFICATIONS;

  function handleSearchClick(href: string) {
    setSearch('');
    setSearchOpen(false);
    navigate(href);
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="rounded-lg bg-amber-400 p-1.5">
          <Sparkles className="h-5 w-5 text-slate-900" />
        </div>
        <span className="text-lg font-bold text-slate-900">SalesPilot AI</span>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        {NAV.map((group) => (
          <div key={group.section}>
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {group.section}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      {isDemo && (
        <div className="mx-3 mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Demo Mode active
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        {SidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                placeholder="Search leads, companies, conversations..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30"
              />
            </div>
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                {searchResults.map((r) => (
                  <button
                    key={r.id}
                    onMouseDown={() => handleSearchClick(r.href)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50"
                  >
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-500">
                      {r.type}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{r.label}</p>
                      <p className="truncate text-xs text-slate-500">{r.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1" />

          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              <Bell className="h-5 w-5" />
              {notifications.some((n) => !n.read) && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-400" />
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-1 w-80 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase text-slate-400">
                  Notifications
                </div>
                {notifications.map((n) => (
                  <div key={n.id} className="border-b border-slate-50 px-4 py-3 last:border-0">
                    <p className="text-sm font-medium text-slate-900">{n.title}</p>
                    <p className="text-xs text-slate-500">{n.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{displayName}</p>
              <p className="text-xs text-slate-500">{email}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {initials(displayName)}
            </div>
            <button
              onClick={handleSignOut}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              title="Log out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8">
          <div key={location.pathname}>{children}</div>
        </main>
      </div>
    </div>
  );
}
