import { Link } from 'react-router-dom';
import {
  AppleMark,
  Instagram,
  LinkedIn,
  Logo,
  PlayStoreMark,
  TikTok,
  YouTube,
} from '@/components/ui/icons';

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { label: 'Discover', to: '/discover' },
      { label: 'Events', to: '/events' },
      { label: 'Activities', to: '/activities' },
      { label: 'Communities', to: '/communities' },
    ],
  },
  {
    title: 'For Organizers',
    links: [
      { label: 'Create Experience', to: '/organizers' },
      { label: 'Organizer Guide', to: '/how-it-works' },
      { label: 'Resources', to: '/how-it-works' },
      { label: 'Pricing', to: '/pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Hoople', to: '/how-it-works' },
      { label: 'Blog', to: '/discover' },
      { label: 'Careers', to: '/organizers' },
      { label: 'Press Kit', to: '/how-it-works' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', to: '/help' },
      { label: 'Contact Us', to: '/help' },
      { label: 'Terms of Service', to: '/help' },
      { label: 'Privacy Policy', to: '/help' },
    ],
  },
];

const SOCIALS = [
  { label: 'Instagram', Icon: Instagram },
  { label: 'TikTok', Icon: TikTok },
  { label: 'YouTube', Icon: YouTube },
  { label: 'LinkedIn', Icon: LinkedIn },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="mx-auto w-full max-w-page px-gutter footer__grid">
        <div>
          <Link to="/home" className="footer__brand" aria-label="Hoople home">
            <Logo size={24} color="#5B21F5" />
            <span>hoople</span>
          </Link>
          <p className="footer__blurb">
            All-in-one platform for events, activities, and communities to discover, connect, and grow
            together.
          </p>
          <div className="flex gap-3">
            {SOCIALS.map(({ label, Icon }) => (
              <a
                key={label}
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer noopener"
                className="footer__social"
                aria-label={`Hoople on ${label}`}
              >
                <Icon size={16} color="#5B21F5" />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <div className="font-heading text-[14px] font-semibold mb-[15px]">{column.title}</div>
            <div className="footer__links">
              {column.links.map((link) => (
                <Link key={link.label} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div className="footer__app">
          <div className="font-heading text-[14px] font-semibold mb-[15px]">Get the Hoople App</div>
          <p className="footer__blurb">Discover, join, and manage experiences on the go.</p>
          <div className="flex gap-2.5 flex-wrap">
            <span className="store-badge">
              <AppleMark size={17} color="#fff" />
              <span>
                <small>Download on the</small>
                <strong>App Store</strong>
              </span>
            </span>
            <span className="store-badge">
              <PlayStoreMark size={17} />
              <span>
                <small>GET IT ON</small>
                <strong>Google Play</strong>
              </span>
            </span>
          </div>
        </div>
      </div>
      <div className="footer__legal">© 2026 Hoople. All rights reserved.</div>
    </footer>
  );
}
