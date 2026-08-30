import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-slate-900 p-12 lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-amber-400 p-1.5">
              <Sparkles className="h-5 w-5 text-slate-900" />
            </div>
            <span className="text-lg font-bold text-white">SalesPilot AI</span>
          </Link>
        </div>
        <div className="relative space-y-6">
          <h2 className="text-3xl font-bold leading-tight text-white">Never miss your next best sales action.</h2>
          <p className="max-w-md text-slate-300">
            Analyze sales conversations, detect buying intent, identify risks and objections, and let AI recommend the next best action — automatically.
          </p>
          <div className="space-y-3">
            {['AI conversation intelligence', 'Buying intent detection', 'Automated follow-up management'].map((f) => (
              <div key={f} className="flex items-center gap-3 text-slate-200">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-slate-400">© 2026 SalesPilot AI</p>
      </div>
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="rounded-lg bg-amber-400 p-1.5">
                <Sparkles className="h-5 w-5 text-slate-900" />
              </div>
              <span className="text-lg font-bold text-slate-900">SalesPilot AI</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-sm text-slate-600">{footer}</div>
        </div>
      </div>
    </div>
  );
}
