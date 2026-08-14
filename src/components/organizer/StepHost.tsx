import { CounterArea, FieldHead, TokenList } from './WizardFields';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { useToast } from '@/components/ui/Toast';
import { Globe, Grip, Instagram, LinkChain, Plus, Trash, YouTube } from '@/components/ui/icons';
import {
  EXPERTISE_SUGGESTIONS,
  HOST_BIO_LIMIT,
  INSTRUCTOR_BIO_LIMIT,
  nextId,
  type ActivityDraft,
  type Instructor,
} from '@/data/builder';
import { WORKSPACE_INITIALS } from '@/data/organizer';

const LINKS = [
  { key: 'website', label: 'Website', placeholder: 'https://', Icon: Globe },
  { key: 'instagram', label: 'Instagram', placeholder: '@waktuluang', Icon: Instagram },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://', Icon: YouTube },
  { key: 'otherLink', label: 'Other (e.g. TikTok, LinkedIn)', placeholder: 'https://', Icon: LinkChain },
] as const;

/** 4.1 — the people behind the activity. */
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
      <h2 className="wiz-section__title">4.1 Host / Instructor</h2>
      <p className="wiz-section__lede">Introduce the people behind your activity.</p>

      <div className="wiz-stack">
        <section className="org-card wiz-panel">
          <FieldHead
            label="Host / Organizer (Displayed to participants)"
            hint="This is the organizer or entity running the activity."
          />
          <div className="wiz-host">
            <div className="wiz-host__avatar">
              <span className="wiz-host__initials">{WORKSPACE_INITIALS}</span>
              <ImageSlot id="builder-host-avatar" shape="rounded" radius={12} placeholder="" />
            </div>

            <div className="wiz-host__fields">
              <div>
                <span className="wiz-field__label">
                  Host Name<span className="field__req"> *</span>
                </span>
                <input
                  className="wiz-input"
                  value={draft.hostName}
                  aria-label="Host name"
                  onChange={(event) => set('hostName')(event.target.value)}
                />
              </div>
              <div>
                <span className="wiz-field__label">
                  Short Bio<span className="field__req"> *</span>
                </span>
                <CounterArea
                  ariaLabel="Host short bio"
                  value={draft.hostBio}
                  onChange={set('hostBio')}
                  limit={HOST_BIO_LIMIT}
                  placeholder="What does your community stand for?"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="org-card wiz-panel">
          <div className="wiz-panel__head">
            <FieldHead
              label="Instructor / Facilitator"
              hint="Add the instructors or facilitators for this activity."
            />
            <button type="button" className="wiz-addsession" onClick={add}>
              <Plus size={14} color="#6D28FF" strokeWidth={2} />
              Add Instructor
            </button>
          </div>

          {draft.instructors.length === 0 ? (
            <p className="wiz-sessions__empty">
              No instructor yet. Participants like knowing who will teach them.
            </p>
          ) : (
            draft.instructors.map((person) => (
              <div key={person.id} className="wiz-person">
                <span className="wiz-person__grip" aria-hidden="true">
                  <Grip size={15} color="#C3C1CE" />
                </span>

                <div className="wiz-person__photo">
                  <ImageSlot
                    id={`builder-instructor-${person.id}`}
                    shape="circle"
                    placeholder="Photo"
                  />
                </div>

                <div className="wiz-person__body">
                  <div className="wiz-pair">
                    <div>
                      <span className="wiz-field__label">
                        Name<span className="field__req"> *</span>
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
                      <span className="wiz-field__label">
                        Role / Title<span className="field__req"> *</span>
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
                    <span className="wiz-field__label">
                      Bio<span className="field__req"> *</span>
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
                    <span className="wiz-field__label">Expertise / Specialization</span>
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
                <span className="wiz-linklabel">
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
