import { Calendar, ChevronDown, Clock, Grid, MapPin, Search, Sliders } from '@/components/ui/icons';

/** One facet in the overlapping search bar: icon + label + current value. */
export interface Facet {
  key: string;
  label: string;
  value: string;
  icon: 'location' | 'date' | 'time' | 'category';
}

const FACET_ICONS = {
  location: MapPin,
  date: Calendar,
  time: Clock,
  category: Grid,
} as const;

interface FilterBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder: string;
  facets: Facet[];
  /** Cycles a facet to its next value. */
  onFacetClick: (key: string) => void;
  onMoreFilters: () => void;
  moreFiltersActive?: boolean;
}

/** The white search bar that overlaps the bottom edge of a dark hero. */
export function FilterBar({
  query,
  onQueryChange,
  placeholder,
  facets,
  onFacetClick,
  onMoreFilters,
  moreFiltersActive = false,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <label className="filter-bar__search">
        <Search size={19} color="#6D28FF" strokeWidth={2} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
      </label>

      {facets.map((facet) => {
        const Icon = FACET_ICONS[facet.icon];
        return (
          <button
            key={facet.key}
            type="button"
            className="filter-bar__facet"
            onClick={() => onFacetClick(facet.key)}
          >
            <Icon size={17} color="#6D28FF" strokeWidth={2} />
            <span className="filter-bar__facet-text">
              <span className="filter-bar__facet-label">{facet.label}</span>
              <span className="filter-bar__facet-value">{facet.value}</span>
            </span>
            <ChevronDown size={15} color="#8B8A99" />
          </button>
        );
      })}

      <button
        type="button"
        className={`filter-bar__more ${moreFiltersActive ? 'is-on' : ''}`.trim()}
        onClick={onMoreFilters}
        aria-expanded={moreFiltersActive}
      >
        <Sliders size={16} strokeWidth={2} />
        More filters
      </button>
    </div>
  );
}
