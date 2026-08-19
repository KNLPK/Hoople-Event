import { CounterArea, FieldHead, TokenList } from './WizardFields';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { useToast } from '@/components/ui/Toast';
import { Globe, Grip, Instagram, LinkChain, Plus, Trash, YouTube } from '@/components/ui/icons';
import {
  EXPERTISE_SUGGESTIONS,
  INSTRUCTOR_BIO_LIMIT,
  nextId,
  type ActivityDraft,
  type Instructor,
} from '@/data/builder';

const LINKS = [
  { key: 'website', label: 'Website', placeholder: 'https://', Icon: Globe },
  { key: 'instagram', label: 'Instagram', placeholder: '@waktuluang', Icon: Instagram },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://', Icon: YouTube },
  { key: 'otherLink', label: 'Other (e.g. TikTok, LinkedIn)', placeholder: 'https://', Icon: LinkChain },
] as const;

/** 4.1 — who teaches the activity, and where to find you. */
export function StepHost({
  draft,
  set,
}: {
  draft: ActivityDraft;
  set: <K extends keyof ActivityDraft>(key: K) => (value: ActivityDraft[K]) => void;
}) {
  const toast = useToast();

  function update(id: string, patch: Partial<Instructor>) {
    set('instructors')(
      draft.instructors.map((person) => (person.id === id ? { ...person, ...patch } : person)),
    );
  }

  function add() {
    set('instructors')([
      ...draft.instructors,
      { id: nextId('i', draft.instructors), name: '', role: '', bio: '', expertise: [] },
    ]);
  }

  return (
    <>
      <p className="wiz-section__lede">
        Introduce whoever teaches this, and where people can find you.
      </p>

      <div className="wiz-stack">
        <section className="org-card wiz-panel">
          <div className="wiz-panel__head">
            <FieldHead
              label="Instructor / Facilitator (Optional)"
              hint="Add them if someone specific teaches this. Plenty of activities are run by the host alone."
            />
            <button type="button" className="wiz-addsession" onClick={add}>
              <Plus size={14} color="#6D28FF" strokeWidth={2} />
              Add Instructor
            </button>
          </div>

          {draft.instructors.length === 0 ? (
            <p className="text-[13px] text-grey py-[18px] px-0">
              No instructor listed. That is fine — the activity will show your host instead.
            </p>
          ) : (
            draft.instructors.map((person) => (
              <div key={person.id} className="wiz-person">
                <span className="flex mt-2.5 cursor-grab" aria-hidden="true">
                  <Grip size={15} color="#C3C1CE" />
                </span>

                <div className="w-[92px] h-[92px]">
                  <ImageSlot
                    id={`builder-instructor-${person.id}`}
                    shape="circle"
                    placeholder="Photo"
                  />
                </div>

                <div className="flex flex-col gap-3.5 min-w-0">
                  <div className="wiz-pair">
                    <div>
                      <span className="block text-[13.5px] font-semibold text-ink">
                        Name
                      </span>
                      <input
                        className="wiz-input"
                        value={person.name}
                        placeholder="e.g., Rani Putri"
                        aria-label="Instructor name"
                        onChange={(event) => update(person.id, { name: event.target.value })}
                      />
                    </div>
                    <div>
                      <span className="block text-[13.5px] font-semibold text-ink">
                        Role / Title
                      </span>
                      <input
                        className="wiz-input"
                        value={person.role}
                        placeholder="e.g., Pottery Instructor"
                        aria-label="Instructor role"
                        onChange={(event) => update(person.id, { role: event.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <span className="block text-[13.5px] font-semibold text-ink">
                      Bio
                    </span>
                    <CounterArea
                      ariaLabel="Instructor bio"
                      value={person.bio}
                      onChange={(value) => update(person.id, { bio: value })}
                      limit={INSTRUCTOR_BIO_LIMIT}
                      placeholder="What makes them good at this?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <span className="block text-[13.5px] font-semibold text-ink">Expertise / Specialization</span>
                    <TokenList
                      values={person.expertise}
                      onChange={(value) => update(person.id, { expertise: value })}
                      suggestions={EXPERTISE_SUGGESTIONS}
                      addLabel="Add expertise"
                      inputPlaceholder="Type a specialization and press Enter"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="wiz-iconbtn wiz-iconbtn--danger"
                  onClick={() => {
                    set('instructors')(draft.instructors.filter((item) => item.id !== person.id));
                    toast(`${person.name || 'Instructor'} removed`);
                  }}
                  aria-label={`Remove ${person.name || 'instructor'}`}
                >
                  <Trash size={15} color="#E11D48" strokeWidth={1.9} />
                </button>
              </div>
            ))
          )}
        </section>

        <section className="org-card wiz-panel">
          <FieldHead
            label="Social / Contact (Optional)"
            hint="Add links to let participants know more about you."
          />
          <div className="wiz-links">
            {LINKS.map(({ key, label, placeholder, Icon }) => (
              <label key={key} className="field">
                <span className="flex items-center gap-[7px] text-[12.5px] font-medium text-ink-2 mb-2">
                  <Icon size={14} color="#8B8A99" strokeWidth={1.9} />
                  {label}
                </span>
                <span className="wiz-select">
                  <LinkChain size={15} color="#8B8A99" strokeWidth={1.9} />
                  <input
                    className="wiz-linkinput"
                    value={draft[key]}
                    placeholder={placeholder}
                    aria-label={label}
                    onChange={(event) => set(key)(event.target.value)}
                  />
                </span>
              </label>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
