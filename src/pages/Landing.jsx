import { Link } from 'react-router-dom'

const features = [
  { title: 'Real-time sync', desc: 'Tasks, comments, moods, and shoutouts update instantly for everyone.', accent: 'from-emerald-500 to-green-400', icon: 'RT' },
  { title: 'Task board with DnD', desc: 'Move tasks across To Do, In Progress, Done with drag-and-drop and priorities.', accent: 'from-sky-500 to-cyan-400', icon: 'BRD' },
  { title: 'Team Pulse', desc: 'Shoutouts, moods, and cheers keep morale visible across projects.', accent: 'from-purple-500 to-fuchsia-500', icon: 'P' },
  { title: 'Comments & activity', desc: 'Threaded comments, edit/delete controls, and an activity feed for every project.', accent: 'from-amber-500 to-orange-400', icon: 'C' },
  { title: 'Project control', desc: 'Owners can edit or delete projects, manage members, and clean up data safely.', accent: 'from-rose-500 to-pink-500', icon: 'CTRL' },
  { title: 'Invites & roles', desc: 'Share invite codes or email invites so the right people join fast.', accent: 'from-indigo-500 to-blue-500', icon: 'INV' },
]

const steps = [
  { title: 'Create a project', text: 'Spin up a new project, set a description, and invite your crew.' },
  { title: 'Assign and track', text: 'Add tasks with assignees, priorities, deadlines, and move them across lanes.' },
  { title: 'Celebrate together', text: 'Share shoutouts, moods, and cheers while activity stays logged automatically.' },
]

const stats = [
  { label: 'Realtime updates', value: '<1s', detail: 'Snapshot listeners across tasks, comments, and pulse.' },
  { label: 'Teams onboarded', value: '120+', detail: 'Studios, pods, and product squads using GroupSync.' },
  { label: 'Tasks moved weekly', value: '15k', detail: 'Drag-and-drop events tracked across boards.' },
  { label: 'Availability', value: '99.9%', detail: 'Backed by Firebase infra and rules-tested.' },
]

const testimonials = [
  {
    quote: 'GroupSync replaced our sticky notes and made remote dailies painless. Tasks ship faster because everyone sees updates instantly.',
    name: 'Priya Raman',
    title: 'Producer, Indie Studio',
  },
  {
    quote: 'The Team Pulse panel is the morale bar we were missing. Shoutouts and cheers keep energy high during crunch.',
    name: 'Marcus Lee',
    title: 'PM, Product Crew',
  },
]

const faqs = [
  { q: 'Can I invite people who are not in my org?', a: 'Yes. Share an invite code or send an email invite so guests can join the project with the right role.' },
  { q: 'Do tasks, comments, and pulse stay per project?', a: 'Everything is scoped by projectId. Tasks, comments, shoutouts, moods, and activity feed are contained per project.' },
  { q: 'Who can delete a project?', a: 'Only the project owner. Deleting a project also cleans tasks, comments, activity, shoutouts, and moods safely.' },
  { q: 'How is access controlled?', a: 'Firestore rules check ownership or membership before any read/write. Unauthorized users cannot read or write data.' },
]

export default function Landing({ user }) {
  const primaryCta = user ? '/dashboard' : '/login?mode=signup'
  const secondaryCta = user ? '/dashboard' : '/login'

  return (
    <div className="space-y-16 text-slate-900">
      {/* Hero */}
      <section className="card cinematic-panel p-8 lg:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/60 via-white to-orange-100/50 blur-3xl" aria-hidden></div>
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.25em] text-purple-700">TeamOS for fast crews</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-slate-900">
              Ship together with realtime tasks, pulse, and shoutouts.
            </h1>
            <p className="text-lg text-slate-600">
              GroupSync keeps projects, people, and energy in one place. Assign work, track progress, cheer wins, and keep everyone connected.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to={primaryCta} className="btn-primary px-5 py-3 text-base">
                {user ? 'Go to dashboard' : 'Create your account'}
              </Link>
              <Link to={secondaryCta} className="btn-secondary px-5 py-3 text-base">
                {user ? 'Open dashboard' : 'Log in'}
              </Link>
              <a href="#features" className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-800 bg-white/80 rounded-lg border border-slate-200 hover:bg-white">
                Learn more
              </a>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2 bg-white/80 px-3 py-1 rounded-full border border-slate-200"> Realtime Firestore</span>
              <span className="inline-flex items-center gap-2 bg-white/80 px-3 py-1 rounded-full border border-slate-200"> Drag & drop board</span>
              <span className="inline-flex items-center gap-2 bg-white/80 px-3 py-1 rounded-full border border-slate-200"> Cheers & moods</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-br from-purple-200/60 via-pink-100/60 to-orange-100/60 blur-3xl" aria-hidden></div>
            <div className="relative rounded-2xl border border-slate-200 bg-white shadow-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-purple-600">Live board</p>
                  <h3 className="text-xl font-semibold">Sprint Studio</h3>
                  <p className="text-sm text-slate-500">Real-time updates across the team</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">Synced</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                {['To Do', 'In Progress', 'Done'].map((col) => (
                  <div key={col} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>{col}</span>
                      <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                    </div>
                    <div className="rounded-md bg-white border border-slate-200 p-2 shadow-sm text-slate-800">
                      <div className="font-semibold text-sm">Storyboard concepts</div>
                      <div className="text-xs text-slate-500">Alex  Due Thu</div>
                    </div>
                    <div className="rounded-md bg-white border border-slate-200 p-2 shadow-sm text-slate-800">
                      <div className="font-semibold text-sm">Shot list draft</div>
                      <div className="text-xs text-slate-500">Priya  Due Fri</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 via-white to-orange-50 border border-purple-100/70">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-orange-400 text-white font-semibold flex items-center justify-center"></div>
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-900">Team Pulse</div>
                  <div className="text-xs text-slate-600">"Shoutout to Sam for crushing the deadline!"</div>
                  <div className="text-xs text-emerald-600 font-semibold">+4 cheers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof bar */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="card cinematic-panel p-4 border border-slate-200">
            <p className="text-xs uppercase tracking-[0.2em] text-purple-700">{s.label}</p>
            <div className="text-2xl font-bold text-slate-900 mt-1">{s.value}</div>
            <p className="text-sm text-slate-600 mt-1">{s.detail}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-purple-700">Why teams choose GroupSync</p>
            <h2 className="text-3xl font-bold text-slate-900">Everything you need to run projects together.</h2>
            <p className="text-slate-600 mt-2">From planning to celebration, every part stays in sync.</p>
          </div>
          <Link to={primaryCta} className="btn-primary px-4 py-2">Start now</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="card cinematic-panel p-5 border border-slate-200 hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${f.accent} text-white flex items-center justify-center text-lg font-semibold mb-3`}>{f.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="card cinematic-panel p-6 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-purple-700">How it works</p>
          <h2 className="text-2xl font-bold text-slate-900">From zero to shipped in three steps.</h2>
          <p className="text-slate-600">No setup headaches; just create, assign, and sync.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((s, idx) => (
            <div key={s.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-700">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">{idx + 1}</span>
                Step {idx + 1}
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
              <p className="text-sm text-slate-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security & reliability */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{
          title: 'Access control',
          body: 'Only owners/members can read/write. Rules enforce project scoping on every document.',
          accent: 'from-purple-500 to-fuchsia-500',
          icon: '',
        }, {
          title: 'Safe deletes',
          body: 'Project deletions cascade tasks, comments, shoutouts, moods, and activity to avoid orphaned data.',
          accent: 'from-amber-500 to-orange-500',
          icon: '',
        }, {
          title: 'Indexes ready',
          body: 'Composite indexes ship preconfigured for tasks, comments, activity, shoutouts, and moods.',
          accent: 'from-emerald-500 to-green-500',
          icon: '',
        }].map((card) => (
          <div key={card.title} className="card cinematic-panel p-5 border border-slate-200">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.accent} text-white flex items-center justify-center text-lg font-semibold mb-3`}>
              {card.icon}
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{card.body}</p>
          </div>
        ))}
      </section>

      {/* Testimonials */}
      <section className="card cinematic-panel p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-purple-700">Teams that ship</p>
            <h2 className="text-2xl font-bold text-slate-900">Momentum that shows up in the work.</h2>
          </div>
          <Link to={primaryCta} className="btn-secondary px-4 py-2">See it live</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-lg font-semibold text-slate-900 leading-snug">{t.quote}</p>
              <div className="mt-3 text-sm text-slate-600 font-semibold">{t.name}</div>
              <div className="text-xs text-slate-500">{t.title}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="card cinematic-panel p-6 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-purple-700">FAQ</p>
          <h2 className="text-2xl font-bold text-slate-900">Details teams ask before they launch.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
              <h3 className="text-sm font-semibold text-slate-900">{f.q}</h3>
              <p className="text-sm text-slate-600">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="card cinematic-panel p-8 bg-gradient-to-r from-purple-100 via-white to-orange-100 border border-purple-100/60 text-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-purple-700">Ready to roll?</p>
            <h2 className="text-3xl font-bold">Launch your next project with GroupSync.</h2>
            <p className="text-slate-700">Real-time tasks, pulse, shoutouts, and comments already wired. Just invite your team.</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link to={primaryCta} className="btn-primary px-5 py-3 text-base">{user ? 'Open dashboard' : 'Get started free'}</Link>
            <Link to={secondaryCta} className="btn-secondary px-5 py-3 text-base">{user ? 'Go to dashboard' : 'Log in'}</Link>
            <a href="#features" className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-800 bg-white/80 rounded-lg border border-slate-200 hover:bg-white">See features</a>
          </div>
        </div>
      </section>
    </div>
  )
}
