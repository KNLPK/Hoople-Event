import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ActivityPreview } from '@/components/organizer/ActivityPreview';
import { WizardStepper } from '@/components/organizer/WizardStepper';
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
 * The activity builder. Each step is split into sub-sections shown one at a
 * time; the preview on the right follows the scroll so the participant's view
 * is never more than a glance away.
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
  const [substep, setSubstep] = useState(0);

  /** One setter for every field, so each section stays declarative. */
  const set = useMemo<DraftSetter>(
    () => (key) => (value) => setDraft((current) => ({ ...current, [key]: value })),
    [],
  );

  /**
   * Every sub-section of every built step, in order. Prev/Next walk this so
   * they cross step boundaries without either end knowing about the other.
   */
  const trail = useMemo(
    () =>
      WIZARD_STEPS.filter((item) => item.ready).flatMap((item) =>
        /* A step with no sub-sections is one screen — it still gets one entry. */
        item.substeps.length === 0
          ? [{ step: item.id, stepLabel: item.label, index: 0, label: item.label }]
          : item.substeps.map((sub, index) => ({
              step: item.id,
              stepLabel: item.label,
              index,
              label: sub.label,
            })),
      ),
    [],
  );

  const at = trail.findIndex((entry) => entry.step === step && entry.index === substep);
  const previous = at > 0 ? trail[at - 1] : undefined;
  const next = trail[at + 1];
  const lockedNext = WIZARD_STEPS[step];

  function goTo(entry: { step: number; index: number }) {
    setStep(entry.step);
    setSubstep(entry.index);
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

  /** Crossing into another step names the step; moving inside one names the part. */
  const previousLabel = previous
    ? previous.step === step
      ? previous.label
      : previous.stepLabel
    : '';

  const key = `${step}.${substep}`;
  const Section = SECTIONS[key];

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
        substep={substep}
        onStep={goStep}
        onSubstep={(index) => goTo({ step, index })}
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
          <Reveal className="wiz-section" key={key}>
            <Section draft={draft} set={set} onEdit={() => goTo(trail[0])} />
          </Reveal>

          <div className="wiz-foot">
            {previous ? (
              <Button as="button" variant="neutral" onClick={() => goTo(previous)}>
                <ArrowLeft size={15} strokeWidth={2} />
                Previous: {previousLabel}
              </Button>
            ) : (
              <Button as="link" to="/organizer/create" variant="neutral">
                Cancel
              </Button>
            )}

            {next ? (
              <Button as="button" variant="primary" size="lg" onClick={() => goTo(next)}>
                Next: {next.step === step ? next.label : next.stepLabel}
                <ArrowRight size={16} strokeWidth={2} />
              </Button>
            ) : lockedNext ? (
              <Button as="button" variant="primary" size="lg" onClick={() => goStep(step + 1)}>
                Next: {lockedNext.label}
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
