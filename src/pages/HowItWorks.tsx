import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';
import { Bolt, Calendar, Compass, Ticket, Users, Wallet } from '@/components/ui/icons';

const PARTICIPANT_STEPS = [
  { step: '01', title: 'Discover', body: 'Search by location, date, category and price — events and activities side by side.' },
  { step: '02', title: 'Book a session', body: 'Pick a date, pick a slot, add up to five participants, and pay in Rupiah.' },
  { step: '03', title: 'Get your e-ticket', body: 'A QR e-ticket lands in your email and in My Bookings straight after payment.' },
  { step: '04', title: 'Show up', body: 'Scan at the door. Your host sees you checked in, and your history stays in one place.' },
];

const ORGANIZER_FLOW = [
  { Icon: Calendar, phase: 'Organize', module: 'Event', body: 'Set up a microsite, open registration, sell tickets and check people in with QR.' },
  { Icon: Compass, phase: 'Engage', module: 'Quest', body: 'Run a scavenger hunt or booth missions so the whole venue gets visited.' },
  { Icon: Bolt, phase: 'Capture', module: 'Play', body: 'Games, a leaderboard and a lucky draw that collect real, opted-in contacts.' },
  { Icon: Users, phase: 'Retain', module: 'Connect', body: 'WhatsApp CRM and retargeting turn one-off attendees into a returning community.' },
];

export function HowItWorks() {
  return (
    <>
      <div className="mx-auto w-full max-w-page to-900:px-gutter page-header">
        <h1>How Hoople works</h1>
        <p>
          One platform for the whole arc of an experience — from the first search to the message that brings
          someone back next month.
        </p>
      </div>

      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <SectionHead
          title="If you're joining"
          subtitle="Four steps from finding something to walking through the door"
          moreTo="/discover"
          moreLabel="Start exploring →"
        />
        <div className="flow-grid">
          {PARTICIPANT_STEPS.map((item, index) => (
            <Reveal key={item.step} delay={index * 60} className="flow-card lift">
              <div className="text-[11px] font-bold tracking-[0.1em] text-brand mb-3">{item.step}</div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </Reveal>
          ))}
        </div>
      </Reveal>

      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <SectionHead
          title="If you're organizing"
          subtitle="Organize → Engage → Capture → Retain, with a module behind each stage"
          moreTo="/organizers"
          moreLabel="Create an experience →"
        />
        <div className="flow-grid">
          {ORGANIZER_FLOW.map(({ Icon, phase, module, body }, index) => (
            <Reveal key={phase} delay={index * 60} className="flow-card lift">
              <div className="text-[11px] font-bold tracking-[0.1em] text-brand mb-3">{phase}</div>
              <span className="w-11 h-11 rounded-lg bg-brand-tint-strong flex items-center justify-center mb-4">
                <Icon size={22} color="#6D28FF" strokeWidth={1.8} />
              </span>
              <h3>{module}</h3>
              <p>{body}</p>
            </Reveal>
          ))}
        </div>
      </Reveal>

      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <div className="split-panels">
          <div className="panel panel--lg">
            <h2 style={{ fontSize: 21, fontWeight: 600, marginBottom: 16 }}>Two product types, one checkout</h2>
            <div className="flex flex-col" style={{ gap: 20 }}>
              <div className="flex gap-[13px]">
                <span className="icon-tile">
                  <Ticket size={17} color="#6D28FF" strokeWidth={1.8} />
                </span>
                <div>
                  <div className="text-[13.5px] font-semibold mb-[5px]">
                    <span className="badge" style={{ marginRight: 8 }}>
                      EVENT
                    </span>
                    One-time
                  </div>
                  <div className="text-[12.5px] text-grey leading-[1.6]">
                    A concert, seminar, workshop or market fest. Sold as a ticket to a single date.
                  </div>
                </div>
              </div>
              <div className="flex gap-[13px]">
                <span className="icon-tile icon-tile--green">
                  <Calendar size={17} color="#16A34A" strokeWidth={1.8} />
                </span>
                <div>
                  <div className="text-[13.5px] font-semibold mb-[5px]">
                    <span className="badge badge--green" style={{ marginRight: 8 }}>
                      ACTIVITY
                    </span>
                    Recurring
                  </div>
                  <div className="text-[12.5px] text-grey leading-[1.6]">
                    A yoga class, running club or coffee class. Sold per session, so people can dip in and out.
                  </div>
                </div>
              </div>
            </div>
            <div className="divider" />
            <div className="flex gap-[13px]">
              <span className="icon-tile">
                <Wallet size={17} color="#6D28FF" strokeWidth={1.8} />
              </span>
              <div>
                <div className="text-[13.5px] font-semibold mb-[5px]">Fees you can explain to a buyer</div>
                <div className="text-[12.5px] text-grey leading-[1.6]">
                  A 3% platform fee and the payment gateway fee are itemised at checkout — no surprise line at
                  the end. Payout reaches the organizer H+1.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-tint-strong rounded-3xl py-[26px] px-[30px]" style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: 21, fontWeight: 600, marginBottom: 10 }}>See it end to end</h2>
            <p style={{ fontSize: 13.5, color: 'var(--color-ink-3)', lineHeight: 1.7, marginBottom: 20 }}>
              The fastest way to understand Hoople is to book something. Pick an activity, choose a session,
              pay, and open the e-ticket that comes out the other side.
            </p>
            <div style={{ height: 190, marginBottom: 22 }} className="float">
              <ImageSlot id="how-art" shape="rounded" radius={14} placeholder="Flow 3D illustration" />
            </div>
            <div className="flex items-center" style={{ gap: 12, marginTop: 'auto', flexWrap: 'wrap' }}>
              <Button as="link" to="/activities" variant="white">
                Try the booking flow
              </Button>
              <Button as="link" to="/pricing" variant="outline">
                See pricing
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </>
  );
}
