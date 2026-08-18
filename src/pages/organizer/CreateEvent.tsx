import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EventPreview } from '@/components/organizer/EventPreview';
import { WizardStepper } from '@/components/organizer/WizardStepper';
import { WizardAccordion, type AccordionPanel } from '@/components/organizer/WizardAccordion';
import { EventBenefits } from '@/components/organizer/event/Benefits';
import { EventDateLocation } from '@/components/organizer/event/DateLocation';
import { EventExperience } from '@/components/organizer/event/Experience';
import { EventIdentity } from '@/components/organizer/event/Identity';
import { EventPlace } from '@/components/organizer/event/Place';
import { EventSchedule } from '@/components/organizer/event/Schedule';
import { EventTickets } from '@/components/organizer/event/Tickets';
import { EventBrand } from '@/components/organizer/event/Brand';
import { EventReview } from '@/components/organizer/event/Review';
import { EventPublish } from '@/components/organizer/event/Publish';
import { EventFinalPublish } from '@/components/organizer/event/FinalPublish';
import type { EventSectionProps } from '@/components/organizer/event/shared';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, ArrowRight, Rocket } from '@/components/ui/icons';
import { EVENT_DRAFT_SEED, eventSteps, type EventDraft } from '@/data/eventBuilder';
import { fireConfetti } from '@/lib/motion';
import { useExperiences } from '@/store/experiences';

/** Which component owns each part, keyed `step.index`. */
const SECTIONS: Record<string, (props: EventSectionProps) => JSX.Element> = {
  '1.0': EventIdentity,
  '1.1': EventBrand,
  '1.2': EventExperience,
  '1.3': EventBenefits,
  '2.0': EventDateLocation,
  '2.1': EventPlace,
  '2.2': EventSchedule,
  '3.0': EventTickets,
  '4.0': EventReview,
  '4.1': EventPublish,
  '4.2': EventFinalPublish,
};

/** The last two parts swap the live page preview for listing and share previews. */
const PREVIEW_VARIANT: Record<string, 'discover' | 'final'> = {
  '4.1': 'discover',
  '4.2': 'final',
};

/**
 * The event builder. Step 2 reshapes itself around the event type — offline
 * asks for a venue, online for a meeting link, hybrid for both — so the step
 * map is derived from the draft rather than declared once.
 */
export function OrgCreateEvent() {
  const navigate = useNavigate();
  const toast = useToast();

  const [params] = useSearchParams();
  const { get, saveEvent } = useExperiences();

  /* `?id=` reopens a saved draft — see the activity builder for the reasoning. */
  const editingId = params.get('id') ?? undefined;
  const [draft, setDraft] = useState<EventDraft>(() => {
    const stored = editingId ? get(editingId) : undefined;
    return stored?.draft?.kind === 'event' ? stored.draft.payload : EVENT_DRAFT_SEED;
  });
  const [step, setStep] = useState(1);
  /* Which part of the open step is expanded, and which have been finished.
     Done is keyed `step.index` so progress survives moving between steps. */
  const [openSub, setOpenSub] = useState(0);
  const [done, setDone] = useState<ReadonlySet<string>>(new Set());

  const set = useMemo(
    () =>
      <K extends keyof EventDraft>(key: K) =>
        (value: EventDraft[K]) =>
          setDraft((current) => ({ ...current, [key]: value })),
    [],
  );

  const steps = useMemo(() => eventSteps(draft.eventType), [draft.eventType]);

  /* Prev/Next in the footer move between steps now; the parts of a step are
     all on this page, so walking them one page-load at a time made no sense. */
  const reachable = useMemo(() => steps.filter((item) => item.ready), [steps]);
  const at = reachable.findIndex((item) => item.id === step);
  const previous = at > 0 ? reachable[at - 1] : undefined;
  const next = reachable[at + 1];

  const open = steps.find((item) => item.id === step);
  const parts = open?.substeps ?? [];

  /** `1.2`, or just `3` when a step has no parts. */
  const numberFor = (index: number) => (parts.length ? `${step}.${index + 1}` : `${step}`);

  function goTo(nextStep: number, nextSub: number) {
    setStep(nextStep);
    setOpenSub(nextSub);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goStep(id: number) {
    const target = steps[id - 1];
    if (!target.ready) {
      toast(`${target.label} is the next part of the builder we're making`);
      return;
    }
    goTo(id, 0);
  }

  /** Finishing a part closes it and opens the one after — the point of this. */
  function continueFrom(index: number) {
    setDone((current) => new Set(current).add(`${step}.${index}`));
    setOpenSub(index + 1);
  }

  const panels: AccordionPanel[] = (parts.length ? parts : [{ id: 'only', label: open?.label ?? '' }]).map(
    (part, index) => {
      const Section = SECTIONS[`${step}.${index}`];
      return {
        id: part.id,
        number: numberFor(index),
        label: part.label,
        body: Section ? <Section draft={draft} set={set} goTo={goTo} /> : null,
      };
    },
  );

  const doneHere = useMemo(() => {
    const local = new Set<number>();
    panels.forEach((_, index) => {
      if (done.has(`${step}.${index}`)) local.add(index);
    });
    return local;
  }, [done, step, panels.length]);

  const key = `${step}.${openSub}`;

  function saveDraft() {
    saveEvent(draft, { id: editingId, lifecycle: 'Draft' });
    toast('Draft saved \u2014 pick it up any time from Experiences \u2192 Drafts');
    navigate('/organizer/drafts');
  }

  function publish(event: React.MouseEvent<HTMLButtonElement>) {
    saveEvent(draft, {
      id: editingId,
      lifecycle: draft.registrationStatus === 'draft' ? 'Draft' : 'Upcoming',
    });
    fireConfetti(event.currentTarget);
    toast(
      draft.registrationStatus === 'scheduled'
        ? `${draft.title || 'Your event'} is scheduled for ${draft.publishDate}`
        : `${draft.title || 'Your event'} is live`,
    );
    navigate('/organizer/experiences');
  }

  return (
    <div className="wiz">
      <WizardStepper steps={steps} step={step} onStep={goStep} />

      <div className="wiz-grid">
        <div className="wiz-form">
          <Reveal className="wiz-section" key={`${step}.${draft.eventType}`}>
            <WizardAccordion
              panels={panels}
              open={openSub}
              done={doneHere}
              onOpen={setOpenSub}
              onContinue={continueFrom}
            />
          </Reveal>

          <div className="wiz-foot">
            {previous ? (
              <Button as="button" variant="neutral" onClick={() => goTo(previous.id, 0)}>
                <ArrowLeft size={15} strokeWidth={2} />
                Previous: {previous.label}
              </Button>
            ) : (
              <Button as="link" to="/organizer/create" variant="neutral">
                Cancel
              </Button>
            )}

            <Button as="button" variant="outline" onClick={saveDraft}>
              Save Draft
            </Button>

            {next ? (
              <Button as="button" variant="primary" size="lg" onClick={() => goTo(next.id, 0)}>
                Next: {next.label}
                <ArrowRight size={16} strokeWidth={2} />
              </Button>
            ) : (
              /* End of the trail — the only thing left is to ship it. */
              <Button as="button" variant="primary" size="lg" halo onClick={publish}>
                <Rocket size={16} strokeWidth={1.9} />
                <span className="evt-publish__btn">
                  Publish Event Now
                  <em>Your event will be live and visible to everyone!</em>
                </span>
              </Button>
            )}
          </div>
        </div>

        <EventPreview draft={draft} onCover={set('cover')} variant={PREVIEW_VARIANT[key]} />
      </div>
    </div>
  );
}
