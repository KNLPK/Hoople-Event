import { FieldHead } from './WizardFields';
import { useToast } from '@/components/ui/Toast';
import {
  Accessible,
  Apron,
  Box,
  Cafe,
  Check,
  Dots,
  Locker,
  Minus,
  Parking,
  Plus,
  Prayer,
  Restroom,
  Smoking,
  Snowflake,
  Tools,
  Trash,
  Wifi,
} from '@/components/ui/icons';
import {
  EQUIPMENT_UNITS,
  FACILITY_OPTIONS,
  nextId,
  type ActivityDraft,
  type EquipmentItem,
} from '@/data/builder';

const FACILITY_ICON: Record<string, typeof Parking> = {
  Parking,
  Restroom,
  'Wi-Fi': Wifi,
  Accessible,
  'Air Conditioning': Snowflake,
  Locker,
  'Prayer Room': Prayer,
  'Cafe / F&B': Cafe,
  'Smoking Area': Smoking,
  Other: Dots,
};

/** Equipment rows get an icon from their name, so new rows still look at home. */
function equipmentIcon(name: string): typeof Box {
  const text = name.toLowerCase();
  if (text.includes('apron') || text.includes('cloth')) return Apron;
  if (text.includes('tool') || text.includes('set') || text.includes('clay')) return Tools;
  return Box;
}

/** 4.3 — what the venue offers and what the organizer provides. */
export function StepFacilities({
  draft,
  set,
}: {
  draft: ActivityDraft;
  set: <K extends keyof ActivityDraft>(key: K) => (value: ActivityDraft[K]) => void;
}) {
  const toast = useToast();

  function update(id: string, patch: Partial<EquipmentItem>) {
    set('equipment')(draft.equipment.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  return (
    <>
      <p className="wiz-section__lede">List the facilities and equipment available for your activity.</p>

      <div className="wiz-stack">
        <section className="org-card wiz-panel">
          <FieldHead label="Facilities" hint="Select all facilities that are available at the venue." />
          <div className="wiz-facilities">
            {FACILITY_OPTIONS.map((option) => {
              const Icon = FACILITY_ICON[option];
              const on = draft.facilities.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  className={`wiz-facility ${on ? 'is-on' : ''}`.trim()}
                  aria-pressed={on}
                  onClick={() =>
                    set('facilities')(
                      on
                        ? draft.facilities.filter((item) => item !== option)
                        : FACILITY_OPTIONS.filter(
                            (item) => item === option || draft.facilities.includes(item),
                          ),
                    )
                  }
                >
                  <Icon size={17} color={on ? '#6D28FF' : '#5C5B6B'} strokeWidth={1.8} />
                  {option}
                  <span className="wiz-facility__mark">
                    {on ? <Check size={10} color="#fff" strokeWidth={3} /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="org-card wiz-panel">
          <div className="wiz-panel__head">
            <FieldHead
              label="Equipment"
              hint="Add equipment that will be used or provided during the activity."
            />
            <button
              type="button"
              className="wiz-addsession"
              onClick={() =>
                set('equipment')([
                  ...draft.equipment,
                  {
                    id: nextId('e', draft.equipment),
                    name: '',
                    quantity: 1,
                    unit: EQUIPMENT_UNITS[0],
                  },
                ])
              }
            >
              <Plus size={14} color="#6D28FF" strokeWidth={2} />
              Add Equipment
            </button>
          </div>

          {draft.equipment.length === 0 ? (
            <p className="text-[13px] text-grey py-[18px] px-0">
              Nothing listed yet. Participants like knowing what they do not need to bring.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5 mt-4">
              {draft.equipment.map((item) => {
                const Icon = equipmentIcon(item.name);
                return (
                  <div key={item.id} className="wiz-equip">
                    <span className="w-10 h-10 rounded-md bg-brand-tint-strong flex items-center justify-center">
                      <Icon size={17} color="#6D28FF" strokeWidth={1.8} />
                    </span>

                    <input
                      className="wiz-equip__name"
                      value={item.name}
                      placeholder="e.g., Pottery Wheel"
                      aria-label="Equipment name"
                      onChange={(event) => update(item.id, { name: event.target.value })}
                    />

                    <div className="wiz-stepper">
                      <button
                        type="button"
                        onClick={() => update(item.id, { quantity: Math.max(0, item.quantity - 1) })}
                        disabled={item.quantity === 0}
                        aria-label={`Fewer ${item.name || 'items'}`}
                      >
                        <Minus size={13} color="#3C3A4A" />
                      </button>
                      <input
                        value={item.quantity}
                        inputMode="numeric"
                        aria-label="Quantity"
                        onChange={(event) =>
                          update(item.id, { quantity: Number(event.target.value.replace(/\D/g, '')) || 0 })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => update(item.id, { quantity: item.quantity + 1 })}
                        aria-label={`More ${item.name || 'items'}`}
                      >
                        <Plus size={13} color="#3C3A4A" />
                      </button>
                    </div>

                    <select
                      className="wiz-equip__unit"
                      value={item.unit}
                      aria-label="Unit"
                      onChange={(event) => update(item.id, { unit: event.target.value })}
                    >
                      {EQUIPMENT_UNITS.map((unit) => (
                        <option key={unit}>{unit}</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="wiz-iconbtn wiz-iconbtn--danger"
                      onClick={() => {
                        set('equipment')(draft.equipment.filter((row) => row.id !== item.id));
                        toast(`${item.name || 'Equipment'} removed`);
                      }}
                      aria-label={`Remove ${item.name || 'equipment'}`}
                    >
                      <Trash size={15} color="#E11D48" strokeWidth={1.9} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
