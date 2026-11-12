'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FileText, Layers, LogOut, Newspaper, Shield, Tags } from 'lucide-react';
import { api, clearToken, getCachedUser, getToken, setCachedUser } from '../lib/api';
import { Button } from './Button';

const publicPaths = ['/login', '/register'];

export function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (publicPaths.includes(pathname)) {
      setReady(true);
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    const cached = getCachedUser();
    if (cached) setUser(cached);
    api('/users/me')
      .then((me) => {
        setUser(me);
        setCachedUser(me);
        setReady(true);
      })
      .catch(() => {
        clearToken();
        router.replace('/login');
      });
  }, [pathname, router]);

  function logout() {
    clearToken();
    router.push('/login');
  }

  if (publicPaths.includes(pathname)) {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-brand-ink/60">
        Loading…
      </div>
    );
  }

  const nav = [
    { href: '/notes', label: 'My notes', icon: FileText },
    { href: '/posts', label: 'Post feed', icon: Newspaper },
    { href: '/interests', label: 'By interest', icon: Tags },
  ];

  if (user?.role === 'admin') {
    nav.push({ href: '/admin', label: 'Admin', icon: Shield });
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-brand-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/notes" className="flex items-center gap-2 font-bold text-brand-navy">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand-navy text-brand-cyan">
              <Layers size={18} strokeWidth={2.25} />
            </span>
            Noteapp
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium ${
                    active ? 'bg-brand-cyan/15 text-brand-navy' : 'text-brand-ink/80 hover:bg-brand-muted'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden text-brand-ink/70 sm:inline">{user?.name}</span>
            <Button variant="ghost" className="!px-2" onClick={logout} title="Log out">
              <LogOut size={16} />
            </Button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-brand-border px-4 py-2 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                pathname.startsWith(item.href) ? 'bg-brand-navy text-white' : 'bg-brand-muted text-brand-ink'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
