import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Mail, Phone, Github, Linkedin, Check, X, Loader2, ShieldCheck, GitBranch, Download } from 'lucide-react'
import SectionHeader from './SectionHeader'
import { Reveal } from '../lib/motion'
import { PROFILE } from '../lib/data'

type Status = 'idle' | 'signing' | 'confirmed'
type Errors = Partial<Record<'name' | 'email' | 'message', string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const STEPS = ['validating payload', 'signing message', 'broadcasting to inbox', 'confirmed']

function hexHash(len: number) {
  const c = '0123456789abcdef'
  let s = ''
  for (let i = 0; i < len; i++) s += c[Math.floor(Math.random() * 16)]
  return s
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [step, setStep] = useState(0)
  const [hash, setHash] = useState('')

  const validate = (): Errors => {
    const e: Errors = {}
    if (form.name.trim().length < 2) e.name = 'handle must be at least 2 chars'
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'invalid email address'
    if (form.message.trim().length < 10) e.message = 'message must be at least 10 chars'
    return e
  }

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return
    setStatus('signing')
    setStep(0)
  }

  // drive the fake broadcast sequence
  useEffect(() => {
    if (status !== 'signing') return
    if (step >= STEPS.length - 1) {
      setHash(hexHash(40))
      const t = setTimeout(() => {
        setStatus('confirmed')
        toast.success('commit pushed', { description: `message delivered to ${PROFILE.email}` })
      }, 450)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setStep((s) => s + 1), 650)
    return () => clearTimeout(t)
  }, [status, step])

  const reset = () => {
    setStatus('idle')
    setStep(0)
    setForm({ name: '', email: '', message: '' })
  }

  const fieldCls = (k: keyof Errors) =>
    `w-full bg-[var(--panel-2)] px-3 py-2.5 text-[13px] text-zinc-100 outline-none transition-all placeholder:text-zinc-600 focus:ring-1 ${
      errors[k] ? 'border border-rose-500/60 focus:ring-rose-500' : 'border border-[var(--line)] focus:ring-[var(--accent)] focus:border-[color:var(--accent)]'
    }`

  return (
    <Reveal as="section" id="contact" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
      <SectionHeader index="07" command="./contact.sh --secure" title="Open a Channel">
        Drop a message — it's submitted like a signed commit. I read everything; expect a reply within a day.
      </SectionHeader>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-[1.3fr_1fr]">
        {/* FORM / COMMIT */}
        <div className="corner-frame panel overflow-hidden">
          {/* commit header */}
          <div className="flex items-center gap-2 border-b border-[var(--line)] bg-[var(--panel-2)] px-4 py-2.5 text-[12px]">
            <GitBranch className="h-3.5 w-3.5 text-accent" />
            <span className="text-zinc-400">commit to</span>
            <span className="text-zinc-200">rishit:main</span>
            <span className="ml-auto flex items-center gap-1.5 text-[11px] text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" /> e2e · signed
            </span>
          </div>

          {status === 'confirmed' ? (
            <Confirmed hash={hash} name={form.name} onReset={reset} />
          ) : (
            <form onSubmit={submit} className="space-y-4 p-4 sm:p-5">
              <Field label="author.handle" error={errors.name}>
                <input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="satoshi"
                  className={fieldCls('name')}
                  disabled={status === 'signing'}
                />
              </Field>
              <Field label="author.email" error={errors.email}>
                <input
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="you@domain.com"
                  className={fieldCls('email')}
                  disabled={status === 'signing'}
                />
              </Field>
              <Field label="commit.message" error={errors.message}>
                <textarea
                  value={form.message}
                  onChange={(e) => set('message', e.target.value)}
                  placeholder="feat: let's build something fast…"
                  rows={4}
                  className={`${fieldCls('message')} resize-none`}
                  disabled={status === 'signing'}
                />
              </Field>

              {status === 'signing' ? (
                <BroadcastLog step={step} />
              ) : (
                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 border border-accent bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] py-3 text-[13px] font-semibold text-accent transition-all hover:glow-accent"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Sign &amp; submit commit
                </button>
              )}
            </form>
          )}
        </div>

        {/* DIRECT CHANNELS */}
        <div className="flex flex-col gap-3">
          <ContactCard icon={Mail} label="email" value={PROFILE.email} href={`mailto:${PROFILE.email}`} />
          <ContactCard icon={Phone} label="phone" value={`+91 ${PROFILE.phone}`} href={`tel:+91${PROFILE.phone}`} />
          <ContactCard icon={Github} label="github" value={`@${PROFILE.github}`} href={PROFILE.githubUrl} external />
          <ContactCard icon={Linkedin} label="linkedin" value={PROFILE.linkedin} href={PROFILE.linkedinUrl} external />
          <ContactCard icon={Download} label="résumé" value="Download PDF" href={PROFILE.resumeUrl} external />
          <div className="corner-frame panel-2 mt-auto flex items-center gap-2 p-3 text-[11px] text-zinc-500">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
            currently open to high-velocity realtime / systems roles
          </div>
        </div>
      </div>
    </Reveal>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] tracking-wide text-zinc-500">{label}</span>
        {error && (
          <span className="flex items-center gap-1 text-[11px] text-rose-400">
            <X className="h-3 w-3" /> {error}
          </span>
        )}
      </div>
      {children}
    </label>
  )
}

function BroadcastLog({ step }: { step: number }) {
  return (
    <div className="border border-[var(--line)] bg-[var(--panel-2)] p-3 font-mono text-[12px]">
      {STEPS.map((s, i) => {
        const done = i < step
        const active = i === step
        return (
          <div
            key={s}
            className={`flex items-center gap-2 py-0.5 ${done ? 'text-zinc-500' : active ? 'text-accent' : 'text-zinc-700'}`}
          >
            {done ? (
              <Check className="h-3.5 w-3.5 text-accent" />
            ) : active ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <span className="h-3.5 w-3.5" />
            )}
            <span>{s}</span>
            {active && <span className="cursor-blink ml-0.5 inline-block h-3 w-1.5 bg-accent" />}
          </div>
        )
      })}
    </div>
  )
}

function Confirmed({ hash, name, onReset }: { hash: string; name: string; onReset: () => void }) {
  return (
    <div className="p-6 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-accent text-accent glow-accent">
        <Check className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-zinc-100">Commit confirmed</h3>
      <p className="mt-1 text-[13px] text-zinc-400">
        Thanks{name ? `, ${name.trim()}` : ''} — your message is on its way.
      </p>
      <div className="mx-auto mt-4 max-w-sm border border-[var(--line)] bg-[var(--panel-2)] p-3 text-left font-mono text-[11px]">
        <div className="flex justify-between text-zinc-500">
          <span>tx</span>
          <span className="text-emerald-400">SUCCESS</span>
        </div>
        <div className="mt-1 break-all text-accent">0x{hash}</div>
        <div className="mt-1 text-zinc-600">block #19,482,013 · 1 confirmation</div>
      </div>
      <button
        onClick={onReset}
        className="mt-4 border border-[var(--line)] px-4 py-2 text-[12px] text-zinc-400 transition-colors hover:border-accent hover:text-accent"
      >
        ← send another
      </button>
    </div>
  )
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
  external,
}: {
  icon: any
  label: string
  value: string
  href: string
  external?: boolean
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="group corner-frame panel flex items-center gap-3 p-3.5 transition-all hover:border-accent hover:glow-accent"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center border border-[var(--line)] bg-[var(--panel-2)] text-zinc-400 transition-colors group-hover:border-accent group-hover:text-accent">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-zinc-600">{label}</div>
        <div className="truncate text-[13px] text-zinc-200 group-hover:text-accent">{value}</div>
      </div>
    </a>
  )
}
