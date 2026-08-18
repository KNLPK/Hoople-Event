import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import {
  AppleMark,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Eye,
  EyeOff,
  GoogleMark,
  Heart,
  Lock,
  Logo,
  Mail,
  Shield,
  Ticket,
  User,
  Globe,
} from '@/components/ui/icons';
import { useToast } from '@/components/ui/Toast';
import { useSession } from '@/store/session';
import { safeReturnTo } from '@/lib/returnTo';

/**
 * A single card per step, in the order a new member meets them:
 * Register → Complete Profile → Login. Nothing is verified — this is a
 * clickable prototype, so every path lands you in the app.
 */

type AuthStep = 1 | 2 | 3;

const STEPS = [
  { title: 'Register', sub: 'Create your account' },
  { title: 'Complete Profile', sub: 'Tell us about yourself' },
  { title: 'Login', sub: 'Welcome back!' },
];

const INTERESTS = [
  ['Sports & Fitness', '🏃'],
  ['Art & Design', '🎨'],
  ['Music', '🎵'],
  ['Cooking & Food', '🍳'],
  ['Technology', '💻'],
  ['Business', '💼'],
  ['Personal Growth', '🌱'],
  ['Community', '🤝'],
  ['Travel', '✈️'],
] as const;

const LANGUAGES = ['English', 'Bahasa Indonesia'];
const TIMEZONES = ['(GMT+7) Jakarta, Indonesia', '(GMT+8) Makassar, Indonesia', '(GMT+9) Jayapura, Indonesia'];

export function Auth() {
  const [params] = useSearchParams();
  /*
   * Whoever sent us here says where to go back to; otherwise start browsing.
   * `next` comes off the URL bar, so it is the one untrusted value in this app
   * that reaches navigate() — see safeReturnTo for what it is allowed to be.
   */
  const returnTo = params.get('next') ? safeReturnTo(params.get('next'), '') : null;

  /*
   * Arriving with a `next` means a gate sent you: the console door, or the
   * payment step. That is a request to sign in, so open on Login. Landing on
   * a three-step registration wizard instead made people hunt for the small
   * "Login" link in the corner before they could get where they were going.
   */
  const [step, setStep] = useState<AuthStep>(returnTo ? 3 : 1);
  const [picked, setPicked] = useState<string[]>(['Sports & Fitness', 'Art & Design']);
  const [language, setLanguage] = useState(0);
  const [timezone, setTimezone] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [register, setRegister] = useState({ first: '', last: '', email: '', password: '' });
  const [login, setLogin] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const next = returnTo || '/activities';
  const toast = useToast();
  const { signIn } = useSession();

  /*
   * A step is finished once you have actually left it. Marking every lower
   * number done instead would tick Register and Complete Profile for someone
   * a gate dropped straight onto Login, who has filled in neither.
   */
  const [visited, setVisited] = useState<Set<AuthStep>>(new Set());

  function goTo(target: AuthStep) {
    window.scrollTo(0, 0);
    setVisited((seen) => new Set(seen).add(step));
    setStep(target);
  }

  const passwordStrong = register.password.length >= 8 && /[^A-Za-z]/.test(register.password);

  return (
    <div className="auth-page">
      <div className="auth-topbar">
        <Link to="/home" className="nav__brand" aria-label="Hoople home">
          <Logo size={26} color="#6D28FF" />
          <span>hoople</span>
        </Link>
        <div style={{ fontSize: 13.5, color: 'var(--color-ink-muted)' }}>
          {step === 3 ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => goTo(step === 3 ? 1 : 3)}
            style={{
              border: 0,
              background: 'none',
              padding: 0,
              fontFamily: 'inherit',
              fontSize: 'inherit',
              fontWeight: 600,
              color: 'var(--color-brand)',
              cursor: 'pointer',
            }}
          >
            {step === 3 ? 'Register now' : 'Login'}
          </button>
        </div>
      </div>

      <div className="auth-intro">
        <h1>
          Welcome to <span style={{ color: 'var(--color-brand)' }}>Hoople!</span>
        </h1>
        <p style={{ fontSize: 14.5, color: 'var(--color-ink-muted)' }}>
          Join a community of people discovering and creating amazing experiences.
        </p>
      </div>

      <div className="auth-steps">
        {STEPS.map((item, index) => {
          const number = (index + 1) as AuthStep;
          return (
            <div key={item.title} style={{ display: 'flex', alignItems: 'center' }}>
              <button
                type="button"
                className={`stepper__item auth-steps__item ${number === step ? 'is-on' : ''} ${
                  visited.has(number) && number !== step ? 'is-done' : ''
                }`.trim()}
                onClick={() => goTo(number)}
              >
                <span className="auth-steps__dot">{number}</span>
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: number === step ? 'var(--color-brand)' : 'var(--color-ink)',
                    }}
                  >
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--color-grey)', marginTop: 2 }}>{item.sub}</div>
                </div>
              </button>
              {number < 3 ? <span className="auth-steps__line" /> : null}
            </div>
          );
        })}
      </div>

      <div className="auth-card-wrap">
        {step === 1 ? (
          <form
            className="auth-card"
            onSubmit={(event) => {
              event.preventDefault();
              goTo(2);
            }}
          >
            <div className="auth-card__head">
              <div className="auth-card__title">Create your account</div>
              <div className="auth-card__sub">Let's get you started with Hoople.</div>
            </div>

            <div className="grid grid--2" style={{ gap: 16, marginBottom: 18 }}>
              <IconField
                label="First Name"
                icon={<User size={17} color="#A9A7B6" strokeWidth={1.8} />}
                placeholder="Enter your first name"
                value={register.first}
                onChange={(value) => setRegister({ ...register, first: value })}
              />
              <IconField
                label="Last Name"
                icon={<User size={17} color="#A9A7B6" strokeWidth={1.8} />}
                placeholder="Enter your last name"
                value={register.last}
                onChange={(value) => setRegister({ ...register, last: value })}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <IconField
                label="Email Address"
                type="email"
                icon={<Mail size={17} color="#A9A7B6" strokeWidth={1.8} />}
                placeholder="Enter your email"
                value={register.email}
                onChange={(value) => setRegister({ ...register, email: value })}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <IconField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={<Lock size={17} color="#A9A7B6" strokeWidth={1.8} />}
                placeholder="Create a password"
                value={register.password}
                onChange={(value) => setRegister({ ...register, password: value })}
                trailing={
                  <button
                    type="button"
                    className="input-group__eye"
                    onClick={() => setShowPassword((on) => !on)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff size={17} color="#A9A7B6" strokeWidth={1.8} />
                    ) : (
                      <Eye size={17} color="#A9A7B6" strokeWidth={1.8} />
                    )}
                  </button>
                }
              />
            </div>
            <div
              style={{
                fontSize: 12,
                color: passwordStrong ? 'var(--color-green)' : 'var(--color-grey-soft)',
                marginBottom: 22,
              }}
            >
              {passwordStrong
                ? 'Looks good — that password is strong enough.'
                : 'Must be at least 8 characters with a mix of letters, numbers & symbols.'}
            </div>

            <Button as="button" type="submit" variant="primary" size="lg" block halo>
              Create Account
            </Button>

            <SocialBlock onPick={(provider) => toast(`${provider} sign-in is stubbed in this prototype`)} />

            <div style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--color-ink-muted)', margin: '22px 0' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => goTo(3)}
                style={{ border: 0, background: 'none', padding: 0, fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 600, color: 'var(--color-brand)', cursor: 'pointer' }}
              >
                Login
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--color-line-faint)', paddingTop: 20, display: 'flex', gap: 13 }}>
              <span className="icon-tile" style={{ width: 30, height: 30, borderRadius: 9 }}>
                <Shield size={16} color="#6D28FF" strokeWidth={1.8} />
              </span>
              <div style={{ fontSize: 12.5, color: 'var(--color-ink-muted)', lineHeight: 1.7 }}>
                By signing up, you agree to Hoople's <Link to="/help">Terms of Service</Link> and{' '}
                <Link to="/help">Privacy Policy</Link>.
              </div>
            </div>
          </form>
        ) : null}

        {step === 2 ? (
          <form
            className="auth-card auth-card--wide"
            onSubmit={(event) => {
              event.preventDefault();
              goTo(3);
            }}
          >
            <div
              className="grid grid--split"
              style={{ gap: 18, alignItems: 'start', marginBottom: 26 }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 23, fontWeight: 700, letterSpacing: '-0.02em' }}>
                  Almost there! 🎉
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--color-ink-muted)', lineHeight: 1.65, marginTop: 8 }}>
                  Tell us about your interests so we can recommend the best experiences for you.
                </div>
              </div>
              <div style={{ height: 110 }} className="float">
                <ImageSlot id="auth-art" shape="rounded" radius={12} placeholder="Illustration" />
              </div>
            </div>

            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>1. What are you interested in?</div>
            <div style={{ fontSize: 12.5, color: 'var(--color-grey)', marginBottom: 14 }}>Select all that apply</div>
            <div className="interest-grid">
              {INTERESTS.map(([name, icon]) => {
                const on = picked.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    className={`interest ${on ? 'is-on' : ''}`.trim()}
                    aria-pressed={on}
                    onClick={() =>
                      setPicked((list) =>
                        list.includes(name) ? list.filter((item) => item !== name) : [...list, name],
                      )
                    }
                  >
                    <span style={{ fontSize: 15 }}>{icon}</span>
                    <span className="interest__name">{name}</span>
                    {on ? (
                      <span className="interest__check">
                        <Check size={10} color="#fff" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>2. Preferred language</div>
            <div style={{ fontSize: 12.5, color: 'var(--color-grey)', marginBottom: 12 }}>
              This helps us show content in your preferred language.
            </div>
            <button
              type="button"
              className="select-row"
              style={{ marginBottom: 24 }}
              onClick={() => setLanguage((index) => (index + 1) % LANGUAGES.length)}
            >
              <Globe size={17} color="#5C5B6B" strokeWidth={1.8} />
              <span>{LANGUAGES[language]}</span>
              <ChevronDown size={16} color="#8B8A99" />
            </button>

            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>3. Timezone</div>
            <div style={{ fontSize: 12.5, color: 'var(--color-grey)', marginBottom: 12 }}>
              We'll use this to show event times in your local time.
            </div>
            <button
              type="button"
              className="select-row"
              style={{ marginBottom: 26 }}
              onClick={() => setTimezone((index) => (index + 1) % TIMEZONES.length)}
            >
              <Clock size={17} color="#5C5B6B" strokeWidth={1.8} />
              <span>{TIMEZONES[timezone]}</span>
              <ChevronDown size={16} color="#8B8A99" />
            </button>

            <Button as="button" type="submit" variant="primary" size="xl" block halo>
              Complete Profile
              <ArrowRight size={17} strokeWidth={2.2} />
            </Button>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                type="button"
                onClick={() => goTo(3)}
                style={{ border: 0, background: 'none', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, color: 'var(--color-brand)', cursor: 'pointer' }}
              >
                Skip for now
              </button>
            </div>
          </form>
        ) : null}

        {step === 3 ? (
          <form
            className="auth-card"
            onSubmit={(event) => {
              event.preventDefault();
              signIn(login.email.trim() ? { email: login.email.trim() } : undefined);
              navigate(next, { replace: true });
            }}
          >
            <div className="auth-card__head">
              <div className="auth-card__title">Welcome back! 👋</div>
              <div className="auth-card__sub">Login to continue your Hoople journey.</div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <IconField
                label="Email Address"
                type="email"
                icon={<Mail size={17} color="#A9A7B6" strokeWidth={1.8} />}
                placeholder="Enter your email"
                value={login.email}
                onChange={(value) => setLogin({ ...login, email: value })}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <div className="row row--between" style={{ marginBottom: 8 }}>
                <span className="field__label" style={{ marginBottom: 0 }}>
                  Password
                </span>
                <button
                  type="button"
                  onClick={() => toast('Password reset link sent — check your inbox')}
                  style={{ border: 0, background: 'none', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, color: 'var(--color-brand)', cursor: 'pointer' }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-group">
                <Lock size={17} color="#A9A7B6" strokeWidth={1.8} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={login.password}
                  onChange={(event) => setLogin({ ...login, password: event.target.value })}
                  placeholder="Enter your password"
                  aria-label="Password"
                />
                <button
                  type="button"
                  className="input-group__eye"
                  onClick={() => setShowPassword((on) => !on)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={17} color="#A9A7B6" strokeWidth={1.8} />
                  ) : (
                    <Eye size={17} color="#A9A7B6" strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </div>

            <Button as="button" type="submit" variant="primary" size="lg" block halo>
              Login
            </Button>

            <SocialBlock onPick={(provider) => toast(`${provider} sign-in is stubbed in this prototype`)} />

            <div style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--color-ink-muted)', margin: '22px 0' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => goTo(1)}
                style={{ border: 0, background: 'none', padding: 0, fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 600, color: 'var(--color-brand)', cursor: 'pointer' }}
              >
                Register now
              </button>
            </div>

            <div style={{ height: 130, marginBottom: 22 }} className="float">
              <ImageSlot id="login-art" shape="rounded" radius={12} placeholder="Illustration" />
            </div>

            <div className="auth-trust">
              {[
                {
                  Icon: Shield,
                  title: 'Secure & Trusted',
                  body: 'Your data is protected with industry-standard security.',
                },
                {
                  Icon: Ticket,
                  title: 'Your Ticket, Anytime',
                  body: 'Access your booking and e-ticket easily in one place.',
                },
                {
                  Icon: Heart,
                  title: 'Experiences for You',
                  body: 'Discover events and activities tailored to your interests.',
                },
              ].map(({ Icon, title, body }) => (
                <div key={title}>
                  <span className="auth-trust__icon">
                    <Icon size={17} color="#6D28FF" strokeWidth={1.8} />
                  </span>
                  <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>{title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-grey)', lineHeight: 1.6 }}>{body}</div>
                </div>
              ))}
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function SocialBlock({ onPick }: { onPick: (provider: string) => void }) {
  return (
    <>
      <div className="auth-divider">
        <span />
        or continue with
        <span />
      </div>
      <div className="stack" style={{ gap: 12 }}>
        <Button as="button" variant="neutral" block style={{ height: 48, borderRadius: 11 }} onClick={() => onPick('Google')}>
          <GoogleMark size={17} />
          Continue with Google
        </Button>
        <Button as="button" variant="neutral" block style={{ height: 48, borderRadius: 11 }} onClick={() => onPick('Apple')}>
          <AppleMark size={16} />
          Continue with Apple
        </Button>
      </div>
    </>
  );
}

function IconField({
  label,
  icon,
  placeholder,
  value,
  onChange,
  type = 'text',
  trailing,
}: {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <span className="input-group">
        {icon}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
        {trailing}
      </span>
    </label>
  );
}
