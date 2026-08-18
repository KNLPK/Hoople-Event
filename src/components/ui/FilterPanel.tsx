import { Button } from '@/components/ui/Button';

/** The expandable "More filters" panel shared by Discover and Activities. */

export interface FilterState {
  experienceType: string;
  price: string;
  timeOfDay: string;
  language: string;
  organizer: string;
  accessibility: string;
}

export const DEFAULT_FILTERS: FilterState = {
  experienceType: 'Any',
  price: 'Any',
  timeOfDay: 'Any',
  language: 'Any',
  organizer: 'Any',
  accessibility: 'Any',
};

const GROUPS: { key: keyof FilterState; label: string; options: string[] }[] = [
  { key: 'experienceType', label: 'Experience type', options: ['Any', 'Event', 'Activity'] },
  { key: 'price', label: 'Price', options: ['Any', 'Free', 'Under Rp150k', 'Rp150k – Rp300k', 'Rp300k+'] },
  { key: 'timeOfDay', label: 'Time of day', options: ['Any', 'Morning', 'Afternoon', 'Evening'] },
  { key: 'language', label: 'Language', options: ['Any', 'Bahasa Indonesia', 'English'] },
  {
    key: 'organizer',
    label: 'Organizer',
    options: ['Any', 'Waktu Luang', 'Flow with Me', 'Kopi Karya', 'Strive Gym SCBD'],
  },
  {
    key: 'accessibility',
    label: 'Accessibility',
    options: ['Any', 'Wheelchair friendly', 'Step-free entrance', 'Lift access'],
  },
];

interface FilterPanelProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onApply: () => void;
  onReset: () => void;
}

export function FilterPanel({ filters, onChange, onApply, onReset }: FilterPanelProps) {
  return (
    <div className="filter-panel">
      <div className="filter-panel__grid">
        {GROUPS.map((group) => (
          <fieldset key={group.key} className="filter-panel__group">
            <legend>{group.label}</legend>
            <div className="filter-panel__options">
              {group.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`chip chip-motion ${filters[group.key] === option ? 'is-active' : ''}`.trim()}
                  onClick={() => onChange({ ...filters, [group.key]: option })}
                  aria-pressed={filters[group.key] === option}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-t-line-faint">
        <Button as="button" variant="neutral" onClick={onReset}>
          Reset
        </Button>
        <Button as="button" variant="primary" onClick={onApply}>
          Apply filters
        </Button>
      </div>
    </div>
  );
}

/** Count of facets narrowed away from "Any" — drives the toolbar summary. */
export function activeFilterCount(filters: FilterState): number {
  return Object.values(filters).filter((value) => value !== 'Any').length;
}
