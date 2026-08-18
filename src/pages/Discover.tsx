import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ActivityCard } from '@/components/cards/ActivityCard';
import { CommunityCard } from '@/components/cards/CommunityCard';
import { EventCard } from '@/components/cards/EventCard';
import { Button } from '@/components/ui/Button';
import { FilterBar, type Facet } from '@/components/ui/FilterBar';
import { DEFAULT_FILTERS, FilterPanel, type FilterState } from '@/components/ui/FilterPanel';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Newsletter } from '@/components/ui/Newsletter';
import { Rail } from '@/components/ui/Rail';
import { ResultToolbar, type ResultView } from '@/components/ui/ResultToolbar';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHead } from '@/components/ui/SectionHead';
import { ArrowRight, Dice, Grid, MapPin } from '@/components/ui/icons';
import { ACTIVITIES, ACTIVITY_CATEGORIES, SORT_OPTIONS } from '@/data/activities';
import { COMMUNITIES, DISCOVER_CATEGORIES, EVENTS } from '@/data/events';
import { nextSession, weekendActivities } from '@/data/schedule';
import { longDate } from '@/lib/format';

const LOCATIONS = ['Jakarta', 'Bandung', 'Bali', 'Anywhere'];
const DATES = ['Any date', 'Today', 'This weekend', 'Next 7 days'];
const CATEGORY_FACETS = ['All categories', ...ACTIVITY_CATEGORIES.slice(1)];

const QUICK_CHIPS = ['All', 'Free', 'This weekend', 'Near me', 'Beginner friendly', 'Indoor', 'Under Rp150k'];

const CATALOGUE_SIZE = 3128;

export function Discover() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState(0);
  const [dateFacet, setDateFacet] = useState(0);
  const [categoryFacet, setCategoryFacet] = useState(0);
  const [chip, setChip] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [draftFilters, setDraftFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<string>(SORT_OPTIONS[0]);
  const [view, setView] = useState<ResultView>('grid');

  const facets: Facet[] = [
    { key: 'location', label: 'Location', value: LOCATIONS[location], icon: 'location' },
    { key: 'date', label: 'Date', value: DATES[dateFacet], icon: 'date' },
    { key: 'category', label: 'Category', value: CATEGORY_FACETS[categoryFacet], icon: 'category' },
  ];

  function cycleFacet(key: string) {
    if (key === 'location') setLocation((index) => (index + 1) % LOCATIONS.length);
    if (key === 'date') setDateFacet((index) => (index + 1) % DATES.length);
    if (key === 'category') setCategoryFacet((index) => (index + 1) % CATEGORY_FACETS.length);
  }

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matched = ACTIVITIES.filter((activity) => {
      if (needle && !`${activity.title} ${activity.host} ${activity.category}`.toLowerCase().includes(needle))
        return false;
      if (categoryFacet > 0 && activity.category !== CATEGORY_FACETS[categoryFacet]) return false;
      if (chip === 'Free' && activity.priceFrom !== 0) return false;
      if (chip === 'Under Rp150k' && activity.priceFrom >= 150_000) return false;
      if (chip === 'Beginner friendly' && !activity.level.toLowerCase().includes('beginner')) return false;
      if (chip === 'Near me' && activity.venue.city !== 'Jakarta Selatan') return false;
      if (chip === 'This weekend' && !weekendActivities().some((item) => item.slug === activity.slug))
        return false;
      if (filters.price === 'Free' && activity.priceFrom !== 0) return false;
      if (filters.organizer !== 'Any' && activity.host !== filters.organizer) return false;
      if (filters.language !== 'Any' && !activity.language.includes(filters.language)) return false;
      return true;
    });

    const sorted = [...matched];
    if (sort === 'Price: low to high') sorted.sort((a, b) => a.priceFrom - b.priceFrom);
    if (sort === 'Top rated') sorted.sort((a, b) => b.rating - a.rating);
    if (sort === 'Soonest session') {
      sorted.sort((a, b) =>
        (nextSession(a)?.date ?? '9999').localeCompare(nextSession(b)?.date ?? '9999'),
      );
    }
    return sorted;
  }, [query, categoryFacet, chip, filters, sort]);

  const isNarrowed =
    query.trim() !== '' ||
    chip !== 'All' ||
    categoryFacet > 0 ||
    Object.values(filters).some((value) => value !== 'Any');

  function surpriseMe() {
    const pick = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
    navigate(`/activities/${pick.slug}`);
  }

  return (
    <>
      <div className="mx-auto w-full max-w-page max-[900px]:px-gutter page-header">
        <h1>Discover experiences</h1>
        <p>
          Everything happening around you — one-time events and recurring activities from communities across
          Indonesia.
        </p>
      </div>

      <div className="mx-auto w-full max-w-page px-gutter" style={{ paddingTop: 24 }}>
        <FilterBar
          query={query}
          onQueryChange={setQuery}
          placeholder="Search events, activities, hosts, or keywords"
          facets={facets}
          onFacetClick={cycleFacet}
          onMoreFilters={() => setShowFilters((open) => !open)}
          moreFiltersActive={showFilters}
        />

        <div className="chip-row" style={{ marginTop: 22 }}>
          {QUICK_CHIPS.map((option) => (
            <button
              key={option}
              type="button"
              className={`chip chip-motion ${chip === option ? 'is-active' : ''}`.trim()}
              onClick={() => setChip(option)}
              aria-pressed={chip === option}
            >
              {option}
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

      <div className="mx-auto w-full max-w-page px-gutter" style={{ paddingTop: 20 }}>
        <ResultToolbar
          count={isNarrowed ? results.length : CATALOGUE_SIZE}
          noun="experiences"
          location={LOCATIONS[location].split(',')[0]}
          sort={sort}
          sortOptions={SORT_OPTIONS}
          onSortChange={setSort}
          view={view}
          onViewChange={setView}
        />
      </div>

      <Reveal className="mx-auto w-full max-w-page px-gutter section--tight">
        <div className="surprise">
          <div className="surprise__art float">
            <ImageSlot id="surprise-art" shape="rounded" radius={12} placeholder="Dice 3D illustration" />
          </div>
          <div>
            <h3>Surprise me</h3>
            <p>Can't decide? We'll pick something open near you and take you straight to it.</p>
          </div>
          <Button as="button" variant="primary" size="lg" onClick={surpriseMe}>
            <Dice size={17} strokeWidth={1.8} />
            Surprise me
          </Button>
        </div>
      </Reveal>

      {isNarrowed || view === 'calendar' ? (
        <Reveal className="mx-auto w-full max-w-page px-gutter section">
          <SectionHead
            title={results.length ? 'Matching experiences' : 'No matches yet'}
            subtitle={
              results.length
                ? `${results.length} ${results.length === 1 ? 'experience' : 'experiences'} match your filters`
                : 'Try clearing a filter or widening your search'
            }
          />
          {results.length ? (
            view === 'calendar' ? (
              <div className="calendar-view">
                {results.map((activity) => {
                  const upcoming = nextSession(activity);
                  return (
                    <div key={activity.slug} className="calendar-view__day">
                      <div>
                        <div className="calendar-view__date">
                          {upcoming ? longDate(upcoming.date) : 'Dates coming soon'}
                        </div>
                        <div className="calendar-view__weekday">{activity.recurrence}</div>
                      </div>
                      <div className="calendar-view__slots">
                        <Link to={`/activities/${activity.slug}`} className="calendar-slot">
                          <span className="calendar-slot__time">
                            {upcoming ? upcoming.start.replace(':', '.') : '—'}
                          </span>
                          <span>
                            <span className="calendar-slot__title">{activity.title}</span>
                            <span className="calendar-slot__host">
                              {activity.host} · {activity.venue.area}
                            </span>
                          </span>
                          <span className="calendar-slot__slots">
                            {upcoming ? `${upcoming.slotsLeft} slots left` : 'Follow for dates'}
                          </span>
                          <span style={{ fontSize: 13.5, fontWeight: 700 }}>
                            {activity.priceFrom === 0
                              ? 'Free'
                              : `Rp${activity.priceFrom.toLocaleString('id-ID')}`}
                          </span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid--4">
                {results.map((activity) => (
                  <ActivityCard key={activity.slug} activity={activity} />
                ))}
              </div>
            )
          ) : (
            <div className="empty">
              <div className="empty__title">Nothing matches those filters</div>
              <p className="empty__body">Reset and browse everything happening in Jakarta this month.</p>
              <Button
                as="button"
                variant="primary"
                onClick={() => {
                  setQuery('');
                  setChip('All');
                  setCategoryFacet(0);
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
          <Reveal className="mx-auto w-full max-w-page px-gutter section">
            <SectionHead
              title="Recommended for you"
              subtitle="Based on the interests you picked"
              moreTo="/activities"
            />
            <Rail perView={4} label="Recommended for you">
              {ACTIVITIES.slice(0, 6).map((activity) => (
                <ActivityCard key={activity.slug} activity={activity} />
              ))}
            </Rail>
          </Reveal>

          <Reveal className="mx-auto w-full max-w-page px-gutter section" delay={60}>
            <SectionHead title="Trending this week" subtitle="Filling up fast in Jakarta" moreTo="/activities" />
            <Rail perView={4} label="Trending this week">
              {ACTIVITIES.filter((activity) => activity.badge).map((activity) => (
                <ActivityCard key={activity.slug} activity={activity} />
              ))}
            </Rail>
          </Reveal>

          <Reveal className="mx-auto w-full max-w-page px-gutter section" delay={120}>
            <SectionHead
              title="Happening this weekend"
              subtitle="Saturday and Sunday, ready to book"
              moreTo="/events"
            />
            <Rail perView={4} label="Happening this weekend">
              {weekendActivities().map((activity) => (
                <ActivityCard key={activity.slug} activity={activity} />
              ))}
            </Rail>
          </Reveal>

          <Reveal className="mx-auto w-full max-w-page px-gutter section">
            <div className="section-head">
              <div>
                <h2>Near you</h2>
                <p>Within 5 km of {LOCATIONS[location].split(',')[0]}</p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  LOCATIONS[location],
                )}`}
                target="_blank"
                rel="noreferrer noopener"
                className="link-more"
              >
                <MapPin size={15} strokeWidth={2} />
                View on map
              </a>
            </div>
            <Rail perView={4} label="Near you">
              {ACTIVITIES.filter((activity) => activity.venue.city === 'Jakarta Selatan').map((activity) => (
                <ActivityCard key={activity.slug} activity={activity} />
              ))}
            </Rail>
          </Reveal>

          <Reveal className="mx-auto w-full max-w-page px-gutter section">
            <SectionHead title="Explore by category" subtitle="Pick a lane and go deep" />
            <div className="category-grid">
              {DISCOVER_CATEGORIES.map((category) => (
                <Link
                  key={category.name}
                  to="/activities"
                  className="category-tile chip-motion"
                  onClick={() => setChip('All')}
                >
                  <span className="icon-tile">
                    <Grid size={17} color="#6D28FF" strokeWidth={1.8} />
                  </span>
                  <span>
                    <span className="category-tile__name">{category.name}</span>
                    <span className="category-tile__count">{category.count}</span>
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>

          <Reveal className="mx-auto w-full max-w-page px-gutter section">
            <SectionHead title="New on Hoople" subtitle="Just listed by our communities" moreTo="/events" />
            <div className="grid grid--4">
              {EVENTS.slice(0, 4).map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          </Reveal>

          <Reveal className="mx-auto w-full max-w-page px-gutter section">
            <SectionHead
              title="Communities you may like"
              subtitle="Follow a host and never miss their next session"
              moreTo="/communities"
            />
            <div className="grid grid--5">
              {COMMUNITIES.slice(0, 5).map((community) => (
                <CommunityCard key={community.slug} community={community} />
              ))}
            </div>
          </Reveal>
        </>
      )}

      <Reveal className="mx-auto w-full max-w-page px-gutter section">
        <Newsletter
          slotId="discover-mail"
          title="Never miss what's next"
          body={`New experiences land every week — get the ${LOCATIONS[location].split(',')[0]} shortlist in your inbox.`}
        />
      </Reveal>

      <div className="mx-auto w-full max-w-page px-gutter section--tight" style={{ paddingBottom: 8 }}>
        <Link to="/events" className="link-more">
          Browse one-time events instead
          <ArrowRight size={15} strokeWidth={2} />
        </Link>
      </div>
    </>
  );
}
