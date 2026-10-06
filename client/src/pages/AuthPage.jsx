import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Brand from '../components/Brand';
import Field from '../components/Field';
import { getApiErrorMessage, getFieldErrors } from '../utils/format';

// Used for BOTH /login and /register. The `mode` prop decides which one.
export default function AuthPage({ mode = 'login' }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // When the user types, save the value AND clear that field's error
  function update(field, value) {
    setValues({ ...values, [field]: value });
    setErrors({ ...errors, [field]: '' });
    setFormError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Validate the form
    const nextErrors = {};
    if (isRegister && !values.name.trim()) nextErrors.name = 'Enter your name.';
    if (isRegister && values.name.trim().length > 100) nextErrors.name = 'Name must be 100 characters or fewer.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (values.password.length < 8 || values.password.length > 72) nextErrors.password = 'Password must be 8–72 characters.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return; // stop if there are errors

    // Send to the server
    setSubmitting(true);
    try {
      const payload = { email: values.email.trim(), password: values.password };
      if (isRegister) payload.name = values.name.trim();
      if (isRegister) await register(payload); else await login(payload);
      // Go back to the page the user tried to open before, or the dashboard
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (error) {
      setErrors({ ...errors, ...getFieldErrors(error) });
      setFormError(getApiErrorMessage(error, isRegister ? 'Could not create your account.' : 'Could not sign you in.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
      {/* Left panel - only visible on large screens */}
      <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-28 top-20 size-96 rounded-full border border-emerald-400/10" />
        <div className="absolute -right-12 top-36 size-64 rounded-full border border-emerald-400/15" />
        <div className="absolute -bottom-40 -left-24 size-[30rem] rounded-full bg-emerald-500/10 blur-3xl" />
        <Brand light />
        <div className="relative z-10 max-w-xl py-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-medium text-emerald-200"><Sparkles size={14} /> A clearer view of your money</span>
          <h1 className="mt-7 text-4xl font-semibold leading-[1.12] tracking-tight xl:text-5xl">Make room for the things that <span className="text-emerald-300">matter most.</span></h1>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-300">A calm, simple place to track what comes in, understand what goes out, and stay in control.</p>
          <div className="mt-10 space-y-4">
            {['See your income and spending at a glance', 'Keep every transaction in one place', 'Build better habits with clear numbers'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-200"><CheckCircle2 size={18} className="text-emerald-300" />{item}</div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-slate-500">Your finances, organized around you.</p>
      </section>

      {/* Right panel - the actual form */}
      <section className="flex min-h-screen flex-col px-5 py-7 sm:px-10 lg:px-14 xl:px-20">
        <div className="lg:hidden"><Brand /></div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <div className="mb-8">
            <p className="text-sm font-semibold text-emerald-700">{isRegister ? 'GET STARTED' : 'WELCOME BACK'}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{isRegister ? 'Create your account' : 'Sign in to Pennywise'}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{isRegister ? 'Set up your account and start getting a clearer picture of your money.' : 'Your financial overview is just a sign-in away.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {isRegister && <Field label="Full name" name="name" type="text" autoComplete="name" placeholder="Alex Doe" value={values.name} onChange={(e) => update('name', e.target.value)} error={errors.name} maxLength={100} />}
            <Field label="Email address" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={values.email} onChange={(e) => update('email', e.target.value)} error={errors.email} />
            <Field label="Password" name="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder="At least 8 characters" value={values.password} onChange={(e) => update('password', e.target.value)} error={errors.password} hint={isRegister ? 'Use 8–72 characters.' : undefined} />

            {formError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div>}

            <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? 'Please wait…' : <>{isRegister ? 'Create account' : 'Sign in'}<ArrowRight size={17} /></>}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            {isRegister ? 'Already have an account?' : 'New to Pennywise?'}{' '}
            <Link className="font-semibold text-emerald-700 hover:text-emerald-800" to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Sign in' : 'Create an account'}
            </Link>
          </p>

          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-400"><ShieldCheck size={15} /> Your account is protected with secure authentication.</div>
        </div>
      </section>
    </main>
  );
}
