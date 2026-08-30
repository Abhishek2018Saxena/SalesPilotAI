import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  MessagesSquare,
  Brain,
  Target,
  AlertTriangle,
  CalendarClock,
  Mail,
  BarChart3,
  Check,
  Zap,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';

const STEPS = [
  { icon: MessagesSquare, title: 'Capture conversation', desc: 'Record calls, paste transcripts, or sync email threads.' },
  { icon: Brain, title: 'Analyze with AI', desc: 'AI reads every line to understand context and sentiment.' },
  { icon: Target, title: 'Detect buying intent', desc: 'Identify which prospects are actually ready to buy.' },
  { icon: AlertTriangle, title: 'Identify risks and objections', desc: 'Surface competitor mentions, hesitations, and blockers.' },
  { icon: Zap, title: 'Generate next best action', desc: 'Get a specific, prioritized recommendation for each lead.' },
  { icon: CalendarClock, title: 'Schedule follow-up', desc: 'Auto-create follow-ups with the right date and message.' },
];

const CAPABILITIES = [
  { icon: MessagesSquare, title: 'Conversation Intelligence', desc: 'Turn raw transcripts into structured sales insight.' },
  { icon: Target, title: 'Buying Intent Detection', desc: 'Score intent from language, not just clicks.' },
  { icon: Zap, title: 'AI Follow-up Recommendations', desc: 'Know exactly what to do next for every lead.' },
  { icon: TrendingUp, title: 'Lead Prioritization', desc: 'Focus on the leads most likely to close.' },
  { icon: AlertTriangle, title: 'Risk Detection', desc: 'Catch objections and churn signals early.' },
  { icon: BarChart3, title: 'CRM Workflow', desc: 'Keep your pipeline updated without manual data entry.' },
  { icon: Mail, title: 'Email Assistance', desc: 'Draft professional follow-ups in one click.' },
  { icon: BarChart3, title: 'Sales Analytics', desc: 'Track pipeline value, conversion, and team performance.' },
];

const PROBLEMS = [
  { title: 'Missed follow-ups', desc: 'Reps forget to follow up after calls, and leads go cold.' },
  { title: 'Leads going cold', desc: 'Without timely action, warm prospects lose interest.' },
  { title: 'Hidden buying signals', desc: 'Important intent is buried inside long conversations.' },
  { title: 'Manual CRM updates', desc: 'Hours lost to logging activities instead of selling.' },
  { title: 'Poor follow-up timing', desc: 'Following up too late — or too early — kills deals.' },
  { title: 'CRM admin overhead', desc: 'Reps spend too much time updating CRM instead of selling.' },
];

export function Landing() {
  const { isDemo } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-amber-400 p-1.5">
              <Sparkles className="h-5 w-5 text-slate-900" />
            </div>
            <span className="text-lg font-bold text-slate-900">SalesPilot AI</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#problem" className="text-sm font-medium text-slate-600 hover:text-slate-900">Problem</a>
            <a href="#how" className="text-sm font-medium text-slate-600 hover:text-slate-900">How it works</a>
            <a href="#capabilities" className="text-sm font-medium text-slate-600 hover:text-slate-900">AI</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Log in</Button>
            <Button size="sm" onClick={() => navigate('/signup')}>Sign up</Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered sales copilot
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 lg:text-6xl">
              Never miss your next best sales action.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              SalesPilot AI analyzes sales conversations, detects buying intent, identifies risks
              and objections, recommends the next best action, and automatically manages follow-ups.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={() => navigate('/signup')}>
                Start free <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
                {isDemo ? 'Open dashboard' : 'Try Demo Mode'}
              </Button>
            </div>
            <p className="mt-4 text-xs text-slate-400">No credit card required. Demo Mode works instantly.</p>
          </div>
        </div>
      </section>

      <section id="problem" className="scroll-mt-16 border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900">The problem SalesPilot solves</h2>
            <p className="mt-3 text-slate-600">Sales teams lose deals not because they can't sell, but because they can't keep up.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROBLEMS.map((p) => (
              <div key={p.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="mb-3 inline-flex rounded-lg bg-red-50 p-2 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">{p.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="scroll-mt-16 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900">How it works</h2>
            <p className="mt-3 text-slate-600">From raw conversation to next best action in six steps.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative rounded-xl border border-slate-200 bg-white p-6">
                <div className="absolute right-4 top-4 text-5xl font-bold text-slate-100">{i + 1}</div>
                <div className="mb-3 inline-flex rounded-lg bg-amber-50 p-2 text-amber-600">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="capabilities" className="scroll-mt-16 border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <Brain className="h-3.5 w-3.5" />
              AI capabilities
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Everything you need to close faster</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((c) => (
              <div key={c.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="mb-3 inline-flex rounded-lg bg-slate-900 p-2 text-amber-400">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{c.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-16 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900">Simple pricing</h2>
            <p className="mt-3 text-slate-600">Start free. Upgrade when you need more.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-lg font-bold text-slate-900">FREE</h3>
              <p className="mt-1 text-sm text-slate-500">For getting started</p>
              <p className="mt-6 text-4xl font-bold text-slate-900">$0</p>
              <p className="text-sm text-slate-500">forever</p>
              <ul className="mt-6 space-y-3">
                {['Demo Mode', 'Lead management', 'Conversation analysis', 'Follow-up management', 'Dashboard'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="h-4 w-4 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="mt-8 w-full" onClick={() => navigate('/signup')}>Get started</Button>
            </div>
            <div className="relative rounded-2xl border-2 border-amber-400 bg-white p-8 shadow-lg">
              <div className="absolute -top-3 right-6 rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-900">Popular</div>
              <h3 className="text-lg font-bold text-slate-900">PRO</h3>
              <p className="mt-1 text-sm text-slate-500">For growing sales teams</p>
              <p className="mt-6 text-4xl font-bold text-slate-900">$29</p>
              <p className="text-sm text-slate-500">per user / month</p>
              <ul className="mt-6 space-y-3">
                {['Advanced AI', 'Gmail integration', 'CRM integrations', 'Advanced analytics', 'More usage', 'Priority features'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="h-4 w-4 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-8 w-full" onClick={() => navigate('/signup')}>Upgrade to Pro</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-900 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <h2 className="text-3xl font-bold text-white">Ready to close more deals?</h2>
          <p className="mt-3 text-slate-300">Start analyzing conversations and never miss a follow-up again.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={() => navigate('/signup')}>
              Start free <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="border-slate-600 text-white hover:bg-slate-800" onClick={() => navigate('/login')}>
              Log in
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <div className="rounded bg-amber-400 p-1">
              <Sparkles className="h-4 w-4 text-slate-900" />
            </div>
            <span className="text-sm font-semibold text-slate-900">SalesPilot AI</span>
          </div>
          <p className="text-xs text-slate-400">© 2026 SalesPilot AI. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4" />
            Secure by design
          </div>
        </div>
      </footer>
    </div>
  );
}
