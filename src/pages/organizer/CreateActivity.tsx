import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ActivityPreview } from '@/components/organizer/ActivityPreview';
import { WizardStepper } from '@/components/organizer/WizardStepper';
import { WizardAccordion, type AccordionPanel } from '@/components/organizer/WizardAccordion';
import { StepDetails } from '@/components/organizer/StepDetails';
import { StepIdentity } from '@/components/organizer/StepIdentity';
import { StepParticipant } from '@/components/organizer/StepParticipant';
import { StepSchedule } from '@/components/organizer/StepSchedule';
import { StepSessions } from '@/components/organizer/StepSessions';
import { StepVenue } from '@/components/organizer/StepVenue';
import { StepPricing } from '@/components/organizer/StepPricing';
import { StepHost } from '@/components/organizer/StepHost';
import { StepGallery } from '@/components/organizer/StepGallery';
import { StepFacilities } from '@/components/organizer/StepFacilities';
import { StepRules } from '@/components/organizer/StepRules';
import { StepSummary } from '@/components/organizer/StepSummary';
import { StepPreview } from '@/components/organizer/StepPreview';
import { StepPublish } from '@/components/organizer/StepPublish';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, ArrowRight, Send } from '@/components/ui/icons';
import { DRAFT_SEED, WIZARD_STEPS, type ActivityDraft } from '@/data/builder';
import { compactDate } from '@/lib/format';
import { fireConfetti } from '@/lib/motion';
import { useExperiences } from '@/store/experiences';

export type DraftSetter = <K extends keyof ActivityDraft>(
  key: K,
) => (value: ActivityDraft[K]) => void;

export interface SectionProps {
  draft: ActivityDraft;
  set: DraftSetter;
  /** Jumps back to 1.1 — the summary's "Edit" button. */
  onEdit: () => void;
}

/** Which component owns each sub-section, keyed `step.substep`. */
const SECTIONS: Record<string, (props: SectionProps) => JSX.Element> = {
  '1.0': StepIdentity,
  '1.1': StepDetails,
  '1.2': StepParticipant,
  '2.0': StepVenue,
  '2.1': StepSchedule,
  '2.2': StepSessions,
  '3.0': StepPricing,
  '4.0': StepHost,
  '4.1': StepGallery,
  '4.2': StepFacilities,
  '4.3': StepRules,
  '5.0': StepSummary,
  '5.1': StepPreview,
  '5.2': StepPublish,
};

/** The publish steps frame the participant app rather than a card. */
const PHONE_SECTIONS = new Set(['5.1', '5.2']);

/**
 * The activity builder. A step's parts are stacked on one page as an
 * accordion, one open at a time; the preview on the right follows whichever
 * part is expanded, so the participant's view is never more than a glance away.
 */
export function OrgCreateActivity() {
  const navigate = useNavigate();
  const toast = useToast();

  const [params] = useSearchParams();
  const { get, saveActivity } = useExperiences();

  /*
   * `?id=` reopens a saved draft. Reading it once as the initial state means
   * the form starts on the organizer's own work rather than flashing the seed
   * and replacing it a frame later.
   */
  const editingId = params.get('id') ?? undefined;
  const [draft, setDraft] = useState<ActivityDraft>(() => {
    const stored = editingId ? get(editingId) : undefined;
    return stored?.draft?.kind === 'activity' ? stored.draft.payload : DRAFT_SEED;
  });
  const [step, setStep] = useState(1);
  /* Which part of the open step is expanded, and which have been finished.
     Done is keyed `step.index` so progress survives moving between steps. */
  const [openSub, setOpenSub] = useState(0);
  const [done, setDone] = useState<ReadonlySet<string>>(new Set());

  /** One setter for every field, so each section stays declarative. */
  const set = useMemo<DraftSetter>(
    () => (key) => (value) => setDraft((current) => ({ ...current, [key]: value })),
    [],
  );

  /* Prev/Next in the footer move between steps; a step's parts all live on
     this page now, so there is nothing left for them to walk inside one. */
  const reachable = useMemo(() => WIZARD_STEPS.filter((item) => item.ready), []);
  const at = reachable.findIndex((item) => item.id === step);
  const previous = at > 0 ? reachable[at - 1] : undefined;
  const next = reachable[at + 1];

  const open = WIZARD_STEPS.find((item) => item.id === step);
  const parts = open?.substeps ?? [];

  function goTo(entry: { step: number; index: number }) {
    setStep(entry.step);
    setOpenSub(entry.index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goStep(id: number) {
    const target = WIZARD_STEPS[id - 1];
    if (!target.ready) {
      toast(`${target.label} is the next part of the builder we're making`);
      return;
    }
    goTo({ step: id, index: 0 });
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
        /** `2.3`, or just `3` when a step has no parts. */
        number: parts.length ? `${step}.${index + 1}` : `${step}`,
        label: part.label,
        body: Section ? (
          <Section draft={draft} set={set} onEdit={() => goTo({ step: 1, index: 0 })} />
        ) : null,
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

  function publish(event: React.MouseEvent<HTMLButtonElement>) {
    saveActivity(draft, {
      id: editingId,
      lifecycle: draft.publishWhen === 'now' ? 'Upcoming' : 'Draft',
    });
    fireConfetti(event.currentTarget);
    toast(
      draft.publishWhen === 'now'
        ? `${draft.title || 'Your activity'} is live`
        : `${draft.title || 'Your activity'} is scheduled for ${compactDate(draft.publishDate)}`,
    );
    navigate('/organizer/experiences');
  }

  return (
    <div className="wiz">
      <WizardStepper
        steps={WIZARD_STEPS}
        step={step}
        onStep={goStep}
        action={
          <Button
            as="button"
            variant="outline"
            onClick={() => {
              saveActivity(draft, { id: editingId, lifecycle: 'Draft' });
              toast('Draft saved — pick it up any time from Experiences → Drafts');
              navigate('/organizer/drafts');
            }}
          >
            Save as Draft
          </Button>
        }
      />

      <div className="wiz-grid">
        <div className="wiz-form">
          <Reveal className="wiz-section" key={String(step)}>
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
              <Button as="button" variant="neutral" onClick={() => goTo({ step: previous.id, index: 0 })}>
                <ArrowLeft size={15} strokeWidth={2} />
                Previous: {previous.label}
              </Button>
            ) : (
              <Button as="link" to="/organizer/create" variant="neutral">
                Cancel
              </Button>
            )}

            {next ? (
              <Button as="button" variant="primary" size="lg" onClick={() => goTo({ step: next.id, index: 0 })}>
                Next: {next.label}
                <ArrowRight size={16} strokeWidth={2} />
              </Button>
            ) : (
              /* End of the trail — the only thing left is to ship it. */
              <Button as="button" variant="primary" size="lg" halo onClick={publish}>
                Publish Activity
                <Send size={16} strokeWidth={1.9} />
              </Button>
            )}
          </div>
        </div>

        <ActivityPreview
          draft={draft}
          onCover={set('cover')}
          variant={PHONE_SECTIONS.has(key) ? 'phone' : 'card'}
        />
      </div>
    </div>
  );
}
