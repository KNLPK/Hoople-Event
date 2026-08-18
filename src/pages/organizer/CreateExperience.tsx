import { Button } from '@/components/ui/Button';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { ArrowRight, Calendar, Clock, Info, Recurring } from '@/components/ui/icons';

const CHOICES = [
  {
    key: 'event',
    Icon: Calendar,
    tone: 'org-choice__icon--violet',
    colour: '#6D28FF',
    title: 'Create an Event',
    sub: 'One-time experience',
    badge: 'One-time',
    photoHint: 'Concert crowd',
    body: 'Create a one-time event with a specific date and time.',
    perfectFor: ['Workshops', 'Seminars', 'Conferences', 'Concerts', 'and more'],
    cta: 'Create Event',
    to: '/organizer/create/event',
  },
  {
    key: 'activity',
    Icon: Recurring,
    tone: 'org-choice__icon--green',
    colour: '#16A34A',
    title: 'Create an Activity',
    sub: 'Recurring sessions',
    badge: 'Recurring',
    photoHint: 'Yoga class',
    body: 'Create a recurring activity with multiple sessions over time.',
    perfectFor: ['Yoga Classes', 'Training', 'Courses', 'Meetups', 'and more'],
    cta: 'Create Activity',
    to: '/organizer/create/activity',
  },
] as const;

/** The fork in the road: one-time event, or recurring activity. */
export function OrgCreateExperience() {
  return (
    <div className="org-create">
      <Reveal className="org-create__head">
        <div className="flex items-end justify-center gap-[26px] mb-[18px]">
          <span className="w-12 h-12 rounded-[50%] bg-[#fff] border border-line shadow-card flex items-center justify-center mb-[26px] org-create__chip--left">
            <Calendar size={19} color="#DB2777" strokeWidth={1.9} />
          </span>
          <span className="block w-[150px] h-[130px] float">
            <ImageSlot id="org-create-mascot" shape="rounded" radius={14} placeholder="Mascot" />
          </span>
          <span className="w-12 h-12 rounded-[50%] bg-[#fff] border border-line shadow-card flex items-center justify-center mb-[26px] org-create__chip--right">
            <Recurring size={19} color="#16A34A" strokeWidth={1.9} />
          </span>
        </div>
        <h1>What would you like to create?</h1>
        <p>
          Choose the type of experience you want to create.
          <br />
          You can always change the details later.
        </p>
      </Reveal>

      <div className="org-create__grid">
        {CHOICES.map((choice, index) => (
          <Reveal key={choice.key} className="org-choice" delay={index * 80}>
            <div className="flex items-center gap-3.5 mb-[18px]">
              <span className={`w-[46px] h-[46px] rounded-lg flex items-center justify-center flex-none ${choice.tone}`}>
                <choice.Icon size={22} color={choice.colour} strokeWidth={1.9} />
              </span>
              <div>
                <div className="font-heading text-[18px] font-bold tracking-[-0.02em]">{choice.title}</div>
                <div className="text-[13px] text-grey mt-[3px]">{choice.sub}</div>
              </div>
            </div>

            <div className="org-choice__media zoom">
              <ImageSlot
                id={`org-create-${choice.key}`}
                shape="rounded"
                radius={12}
                placeholder={choice.photoHint}
              />
              <span className="org-choice__badge">
                <Clock size={13} color={choice.colour} strokeWidth={2} />
                {choice.badge}
              </span>
            </div>

            <p className="text-[13.5px] leading-[1.7] text-ink-3 mb-[18px]">{choice.body}</p>

            <div className="text-[13px] font-semibold text-brand mb-2.5">Perfect for</div>
            <div className="flex flex-wrap gap-2 mb-[22px]">
              {choice.perfectFor.map((tag) => (
                <span key={tag} className="tag tag--neutral">
                  {tag}
                </span>
              ))}
            </div>

            <Button as="link" to={choice.to} variant="primary" size="lg" block>
              {choice.cta}
              <ArrowRight size={16} strokeWidth={2} />
            </Button>
          </Reveal>
        ))}
      </div>

      <Reveal className="org-create__note" delay={180}>
        <span className="w-11 h-11 rounded-lg bg-[#fff] flex items-center justify-center flex-none">
          <Info size={19} color="#6D28FF" strokeWidth={1.9} />
        </span>
        <div>
          <div className="text-[14.5px] font-semibold mb-1.5">Not sure which one?</div>
          <p>
            You can start with one type and convert it later.
            <br />
            All your settings and data will be safely kept.
          </p>
        </div>
        <div className="org-create__note-art float">
          <ImageSlot id="org-create-note-art" shape="rounded" radius={12} placeholder="Mascot waving" />
        </div>
      </Reveal>
    </div>
  );
}
