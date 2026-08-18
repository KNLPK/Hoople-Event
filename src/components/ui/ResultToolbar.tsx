import { Calendar, ChevronDown, Grid } from '@/components/ui/icons';

export type ResultView = 'grid' | 'calendar';

interface ResultToolbarProps {
  count: number;
  noun: string;
  location: string;
  sort: string;
  sortOptions: readonly string[];
  onSortChange: (next: string) => void;
  view: ResultView;
  onViewChange: (next: ResultView) => void;
}

/** Result counter on the left, sort control and grid/calendar toggle on the right. */
export function ResultToolbar({
  count,
  noun,
  location,
  sort,
  sortOptions,
  onSortChange,
  view,
  onViewChange,
}: ResultToolbarProps) {
  return (
    <div className="result-toolbar">
      <div style={{ fontSize: 14, color: 'var(--color-grey)' }}>
        <strong style={{ color: 'var(--color-ink)', fontWeight: 600 }}>
          {count.toLocaleString('en-US')} {noun}
        </strong>{' '}
        found in {location}
      </div>

      <div className="flex items-center" style={{ gap: 14 }}>
        <label className="result-toolbar__sort">
          Sort by
          <select value={sort} onChange={(event) => onSortChange(event.target.value)}>
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown size={15} color="#8B8A99" />
        </label>

        <div className="view-toggle" role="group" aria-label="Result view">
          <button
            type="button"
            className={view === 'grid' ? 'is-on' : ''}
            onClick={() => onViewChange('grid')}
            aria-pressed={view === 'grid'}
          >
            <Grid size={14} color={view === 'grid' ? '#6D28FF' : 'currentColor'} strokeWidth={2} />
            Grid
          </button>
          <button
            type="button"
            className={view === 'calendar' ? 'is-on' : ''}
            onClick={() => onViewChange('calendar')}
            aria-pressed={view === 'calendar'}
          >
            <Calendar size={14} color={view === 'calendar' ? '#6D28FF' : 'currentColor'} strokeWidth={2} />
            Calendar
          </button>
        </div>
      </div>
    </div>
  );
}
