import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DarkHero } from '@/components/layout/DarkHero';
import { ActivityCard } from '@/components/cards/ActivityCard';
import { SessionCard } from '@/components/cards/SessionCard';
import { RecurringRow } from '@/components/cards/RecurringRow';
import { Button } from '@/components/ui/Button';
import { FilterBar, type Facet } from '@/components/ui/FilterBar';
import { DEFAULT_FILTERS, FilterPanel, type FilterState } from '@/components/ui/FilterPanel';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Newsletter } from '@/components/ui/Newsletter';
import { Rail } from '@/components/ui/Rail';
import { ResultToolbar, type ResultView } from '@/components/ui/ResultToolbar';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';
import { Recurring } from '@/components/ui/icons';
import { ACTIVITIES, ACTIVITY_CATEGORIES, APP_TODAY, SORT_OPTIONS } from '@/data/activities';
import { dateStrip, nextSession, todaysSessions } from '@/data/schedule';
import { longDate, rupiah } from '@/lib/format';
import type { Activity } from '@/data/types';

const LOCATIONS = ['Jakarta', 'Bandung', 'Bali', 'Anywhere'];
const DATES = ['Any date', 'Today', 'This weekend', 'Next 7 days'];
const TIMES = ['Any time', 'Morning', 'Afternoon', 'Evening'];

/** Total catalogue size quoted in the result counter when nothing is narrowed. */
const CATALOGUE_SIZE = 1842;

function matchesFilters(activity: Activity, filters: FilterState): boolean {
  if (filters.experienceType === 'Event') return false;
  if (filters.price === 'Free' && activity.priceFrom !== 0) return false;
  if (filters.price === 'Under Rp150k' && activity.priceFrom >= 150_000) return false;
  if (filters.price === 'Rp150k – Rp300k' && (activity.priceFrom < 150_000 || activity.priceFrom > 300_000))
    return false;
  if (filters.price === 'Rp300k+' && activity.priceFrom <= 300_000) return false;
  if (filters.language !== 'Any' && !activity.language.includes(filters.language)) return false;
  if (filters.organizer !== 'Any' && activity.host !== filters.organizer) return false;
  if (
    filters.accessibility !== 'Any' &&
    !activity.venue.notes.some((note) => note.toLowerCase().includes(filters.accessibility.toLowerCase()))
  )
    return false;

  if (filters.timeOfDay !== 'Any') {
    const withinWindow = activity.sessions.some((session) => {
      const hour = Number(session.start.slice(0, 2));
      if (filters.timeOfDay === 'Morning') return hour < 12;
      if (filters.timeOfDay === 'Afternoon') return hour >= 12 && hour < 17;
      return hour >= 17;
    });
    if (!withinWindow) return false;
  }
  return true;
}

export function Activities() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState(0);
  const [dateFacet, setDateFacet] = useState(0);
  const [timeFacet, setTimeFacet] = useState(0);
  const [categoryFacet, setCategoryFacet] = useState(0);
  const [chip, setChip] = useState<string>('All activities');
  const [showFilters, setShowFilters] = useState(false);
  const [draftFilters, setDraftFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<string>(SORT_OPTIONS[0]);
  const [view, setView] = useState<ResultView>('grid');

  const facets: Facet[] = [
    { key: 'location', label: 'Location', value: LOCATIONS[location], icon: 'location' },
    { key: 'date', label: 'Date', value: DATES[dateFacet], icon: 'date' },
    { key: 'time', label: 'Time', value: TIMES[timeFacet], icon: 'time' },
    {
      key: 'category',
      label: 'Category',
      value: categoryFacet === 0 ? 'All categories' : ACTIVITY_CATEGORIES[categoryFacet],
      icon: 'category',
    },
  ];

  function cycleFacet(key: string) {
    if (key === 'location') setLocation((index) => (index + 1) % LOCATIONS.length);
    if (key === 'date') setDateFacet((index) => (index + 1) % DATES.length);
    if (key === 'time') setTimeFacet((index) => (index + 1) % TIMES.length);
    if (key === 'category') setCategoryFacet((index) => (index + 1) % ACTIVITY_CATEGORIES.length);
  }

  const activeCategory =
    chip !== 'All activities' ? chip : categoryFacet > 0 ? ACTIVITY_CATEGORIES[categoryFacet] : null;

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matched = ACTIVITIES.filter((activity) => {
      if (needle) {
        const haystack =
          `${activity.title} ${activity.host} ${activity.category} ${activity.tags.join(' ')}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      if (activeCategory === 'Free' && activity.priceFrom !== 0) return false;
      if (activeCategory && activeCategory !== 'Free' && activity.category !== activeCategory) return false;
      if (dateFacet === 1 && !nextSession(activity, APP_TODAY)) return false;
      return matchesFilters(activity, filters);
    });

    const sorted = [...matched];
    if (sort === 'Price: low to high') sorted.sort((a, b) => a.priceFrom - b.priceFrom);
    if (sort === 'Top rated') sorted.sort((a, b) => b.rating - a.rating);
    if (sort === 'Soonest session') {
      sorted.sort((a, b) => {
        const first = nextSession(a)?.date ?? '9999';
        const second = nextSession(b)?.date ?? '9999';
        return first.localeCompare(second);
      });
    }
    return sorted;
  }, [query, activeCategory, dateFacet, filters, sort]);

  const isNarrowed =
    query.trim() !== '' ||
    activeCategory !== null ||
    dateFacet !== 0 ||
    Object.values(filters).some((value) => value !== 'Any');

  const popular = ACTIVITIES.filter((activity) => activity.badge).slice(0, 6);
  const recurring = ACTIVITIES.filter((activity) => activity.sessions.length > 0).slice(0, 4);
  const today = todaysSessions(6);

  return (
    <>
      <DarkHero
        slotId="activities-hero"
        photoHint="Drop hero photo — yoga class / studio"
        overlap={
          <FilterBar
            query={query}
            onQueryChange={setQuery}
            placeholder="Search activities, classes, or keywords"
            facets={facets}
            onFacetClick={cycleFacet}
            onMoreFilters={() => setShowFilters((open) => !open)}
            moreFiltersActive={showFilters}
          />
        }
      >
        <div className="activities-hero__copy">
          <h1>Activities</h1>
          <p className="dark-hero__lede">
            Move, learn, create, and grow. Join recurring activities that{' '}
            <span className="script">fit your lifestyle.</span>
          </p>
          <div className="row" style={{ gap: 12 }}>
            <div className="avatar-stack">
              {[1, 2, 3, 4].map((index) => (
                <div key={index}>
                  <ImageSlot id={`activities-avatar-${index}`} shape="circle" placeholder="" />
                </div>
              ))}
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,.88)' }}>
              10,000+ people joined activities this week
            </span>
          </div>
        </div>
      </DarkHero>

      <div style={{ height: 66 }} />

      <div className="container" style={{ paddingTop: 26 }}>
        <div className="chip-row">
          {ACTIVITY_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className={`chip chip-motion ${chip === category ? 'is-active' : ''}`.trim()}
              onClick={() => setChip(category)}
              aria-pressed={chip === category}
            >
              {category}
            </button>
          ))}
        </div>

        {showFilters ? (
          <FilterPanel
            filters={draftFilters}
            onChange={setDraftFilters}
            onApply={() => {
              setFilters(draftFilters);
              setShowFilters(false);
            }}
            onReset={() => {
              setDraftFilters(DEFAULT_FILTERS);
              setFilters(DEFAULT_FILTERS);
            }}
          />
        ) : null}
      </div>

      <div className="container" style={{ paddingTop: 20 }}>
        <ResultToolbar
          count={isNarrowed ? results.length : CATALOGUE_SIZE}
          noun="activities"
          location={LOCATIONS[location].split(',')[0]}
          sort={sort}
          sortOptions={SORT_OPTIONS}
          onSortChange={setSort}
          view={view}
          onViewChange={setView}
        />
      </div>

      {view === 'calendar' ? (
        <Reveal className="container section">
          <SectionHead title="Next 7 days" subtitle="Every session in your filters, day by day" />
          <CalendarResults activities={results} />
        </Reveal>
      ) : isNarrowed ? (
        <Reveal className="container section">
          <SectionHead
            title={results.length ? 'Matching activities' : 'No matches yet'}
            subtitle={
              results.length
                ? `${results.length} ${results.length === 1 ? 'activity' : 'activities'} match your filters`
                : 'Try widening the filters or clearing your search'
            }
          />
          {results.length ? (
            <div className="grid grid--4">
              {results.map((activity) => (
                <ActivityCard key={activity.slug} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <div className="empty__title">Nothing matches those filters</div>
              <p className="empty__body">
                Reset the filters to see all {CATALOGUE_SIZE.toLocaleString('en-US')} activities in Jakarta.
              </p>
              <Button
                as="button"
                variant="primary"
                onClick={() => {
                  setQuery('');
                  setChip('All activities');
                  setCategoryFacet(0);
                  setDateFacet(0);
                  setFilters(DEFAULT_FILTERS);
                  setDraftFilters(DEFAULT_FILTERS);
                }}
              >
                Reset all filters
              </Button>
            </div>
          )}
        </Reveal>
      ) : (
        <>
          <Reveal className="container section">
            <SectionHead
              title="Popular Activities"
              subtitle="Handpicked activities you'll love"
              moreTo="/discover"
            />
            <Rail perView={4} label="Popular Activities" arrowTop={150}>
              {popular.map((activity) => (
                <ActivityCard key={activity.slug} activity={activity} />
              ))}
            </Rail>
          </Reveal>

          <Reveal className="container section" delay={60}>
            <SectionHead
              title="Today's Sessions"
              subtitle="Happening today, don't miss out!"
              moreTo="/discover"
            />
            <Rail perView={5} gap={20} label="Today's Sessions" arrowTop={110}>
              {today.map(({ activity, session }) => (
                <SessionCard key={`${activity.slug}-${session.id}`} activity={activity} session={session} />
              ))}
            </Rail>
          </Reveal>

          <Reveal className="container section--loose container" delay={120}>
            <SectionHead
              size="sm"
              icon={<Recurring size={22} color="#6D28FF" strokeWidth={2.2} />}
              title="Ongoing & Recurring Activities"
              subtitle="Join anytime and build a habit"
              moreTo="/discover"
            />
            <div className="recurring-layout">
              <div className="recurring-list">
                {recurring.map((activity) => (
                  <RecurringRow key={activity.slug} activity={activity} />
                ))}
              </div>

              <aside className="routine-panel">
                <h3>Build your routine</h3>
                <p>Consistency is the key. Find activities you love and show up for yourself.</p>
                <div className="routine-panel__art float">
                  <ImageSlot
                    id="routine-art"
                    shape="rounded"
                    radius={12}
                    placeholder="3D checklist illustration"
                  />
                </div>
                <Button
                  as="link"
                  to="/activities/hatha-yoga"
                  variant="white"
                  style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
                >
                  Explore recurring →
                </Button>
              </aside>
            </div>
          </Reveal>
        </>
      )}

      <Reveal className="container section">
        <Newsletter slotId="activities-mail" />
      </Reveal>
    </>
  );
}

/** Groups the filtered activities' sessions into the next seven days. */
function CalendarResults({ activities }: { activities: Activity[] }) {
  const days = useMemo(() => {
    const buckets = new Map<string, { activity: Activity; start: string; end: string; slots: number; id: string }[]>();
    for (const activity of activities) {
      for (const day of dateStrip(activity, APP_TODAY, 7)) {
        const list = buckets.get(day.iso) ?? [];
        for (const session of day.sessions) {
          list.push({
            activity,
            start: session.start,
            end: session.end,
            slots: session.slotsLeft,
            id: session.id,
          });
        }
        buckets.set(day.iso, list);
      }
    }
    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([iso, sessions]) => ({
        iso,
        sessions: sessions.sort((a, b) => a.start.localeCompare(b.start)),
      }));
  }, [activities]);

  const withSessions = days.filter((day) => day.sessions.length > 0);

  if (!withSessions.length) {
    return (
      <div className="empty">
        <div className="empty__title">No sessions in the next seven days</div>
        <p className="empty__body">Widen your filters, or switch back to the grid to browse everything.</p>
      </div>
    );
  }

  return (
    <div className="calendar-view">
      {withSessions.map((day) => (
        <div key={day.iso} className="calendar-view__day">
          <div>
            <div className="calendar-view__date">{longDate(day.iso)}</div>
            <div className="calendar-view__weekday">
              {day.sessions.length} {day.sessions.length === 1 ? 'session' : 'sessions'}
            </div>
          </div>
          <div className="calendar-view__slots">
            {day.sessions.map((session) => (
              <Link
                key={`${session.activity.slug}-${session.id}`}
                to={`/booking?activity=${session.activity.slug}&session=${session.id}&date=${day.iso}`}
                className="calendar-slot"
              >
                <span className="calendar-slot__time">
                  {session.start.replace(':', '.')} – {session.end.replace(':', '.')}
                </span>
                <span>
                  <span className="calendar-slot__title">{session.activity.title}</span>
                  <span className="calendar-slot__host">
                    {session.activity.host} · {session.activity.venue.area}
                  </span>
                </span>
                <span className="calendar-slot__slots">{session.slots} slots left</span>
                <span style={{ fontSize: 13.5, fontWeight: 700 }}>
                  {session.activity.priceFrom === 0 ? 'Free' : rupiah(session.activity.priceFrom)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
