import {
  lazy,
  Suspense,
  useEffect,
  type ComponentType,
  type LazyExoticComponent,
} from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ToastProvider } from "@/components/ui/Toast";
import { BookingsProvider } from "@/store/bookings";
import { SavedProvider } from "@/store/saved";
import { SessionProvider } from "@/store/session";
import { ExperiencesProvider } from "@/store/experiences";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { titleForPath } from "@/lib/title";

import { Entry } from "@/pages/Entry";
import { Landing } from "@/pages/Landing";
import { Discover } from "@/pages/Discover";
import { Events } from "@/pages/Events";
import { EventDetail } from "@/pages/EventDetail";
import { Activities } from "@/pages/Activities";
import { ActivityDetail } from "@/pages/ActivityDetail";
import { Booking } from "@/pages/Booking";
import { MyBookings } from "@/pages/MyBookings";
import { ETicket } from "@/pages/ETicket";
import { Saved } from "@/pages/Saved";
import { Auth } from "@/pages/Auth";
import { Communities, CommunityDetail } from "@/pages/Communities";
import { Organizers } from "@/pages/Organizers";
import { HowItWorks } from "@/pages/HowItWorks";
import { Pricing } from "@/pages/Pricing";
import { Help } from "@/pages/Help";

/*
 * The two consoles load on demand.
 *
 * Everything used to ship in one 800 kB file, so somebody opening the
 * participant site on a phone paid for the organizer wizard and the internal
 * events console before the home page could paint — and most visitors never
 * open either. Splitting here means each surface downloads only itself.
 * `lazy` wants a default export and these are all named, hence the unwrap.
 */
type Loaded<M, K extends keyof M> =
  M[K] extends ComponentType<infer P> ? LazyExoticComponent<ComponentType<P>> : never;

/* The props are erased inside and restored by `Loaded` on the way out, which
   is the whole reason this helper exists rather than 24 inline casts. */
type AnyComponent = ComponentType<any>;

function load<M, K extends keyof M>(importer: () => Promise<M>, name: K): Loaded<M, K> {
  return lazy<AnyComponent>(() =>
    importer().then((module) => ({ default: module[name] as AnyComponent })),
  ) as Loaded<M, K>;
}

const OrgLayout = load(() => import("@/components/organizer/OrgLayout"), "OrgLayout");
const OrgDashboard = load(() => import("@/pages/organizer/Dashboard"), "OrgDashboard");
const OrgExperiences = load(() => import("@/pages/organizer/Experiences"), "OrgExperiences");
const OrgCreateExperience = load(() => import("@/pages/organizer/CreateExperience"), "OrgCreateExperience");
const OrgCreateActivity = load(() => import("@/pages/organizer/CreateActivity"), "OrgCreateActivity");
const OrgCreateEvent = load(() => import("@/pages/organizer/CreateEvent"), "OrgCreateEvent");
const OrgSessions = load(() => import("@/pages/organizer/Sessions"), "OrgSessions");
const OrgRegistrations = load(() => import("@/pages/organizer/Registrations"), "OrgRegistrations");
const OrgCheckIn = load(() => import("@/pages/organizer/CheckIn"), "OrgCheckIn");
const OrgAnalytics = load(() => import("@/pages/organizer/Analytics"), "OrgAnalytics");
const OrgPayouts = load(() => import("@/pages/organizer/Payments"), "OrgPayouts");
const OrgTransactions = load(() => import("@/pages/organizer/Payments"), "OrgTransactions");
const OrgSettings = load(() => import("@/pages/organizer/Settings"), "OrgSettings");

const TeamsLayout = load(() => import("@/components/teams/TeamsLayout"), "TeamsLayout");
const TeamsDashboard = load(() => import("@/pages/teams/Dashboard"), "TeamsDashboard");
const TeamsExperiences = load(() => import("@/pages/teams/Experiences"), "TeamsExperiences");
const TeamsRegistrations = load(() => import("@/pages/teams/Registrations"), "TeamsRegistrations");
const TeamsSessions = load(() => import("@/pages/teams/Sessions"), "TeamsSessions");
const TeamsCheckIn = load(() => import("@/pages/teams/CheckIn"), "TeamsCheckIn");
const TeamsAnalytics = load(() => import("@/pages/teams/Analytics"), "TeamsAnalytics");
const TeamsOrders = load(() => import("@/pages/teams/Orders"), "TeamsOrders");
const TeamsPayments = load(() => import("@/pages/teams/Payments"), "TeamsPayments");
const TeamsSettings = load(() => import("@/pages/teams/Settings"), "TeamsSettings");
const TeamsProfile = load(() => import("@/pages/teams/Profile"), "TeamsProfile");

/** Name the tab after the page, so three open tabs are tellable apart. */
function DocumentTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = titleForPath(pathname);
  }, [pathname]);
  return null;
}

/** Shown only while a console chunk is in flight — a few hundred ms at most. */
function RouteFallback() {
  return (
    <div className="route-loading" role="status" aria-label="Loading">
      <span className="route-loading__dot" />
      <span className="route-loading__dot" />
      <span className="route-loading__dot" />
    </div>
  );
}

export function App() {
  return (
    <SessionProvider>
      <SavedProvider>
        <BookingsProvider>
          <ExperiencesProvider>
            <ToastProvider>
              <DocumentTitle />
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  {/* Authentication has its own minimal chrome — no nav, no footer. */}
                  <Route path="/auth" element={<Auth />} />

                  {/* The front door. Hoople is three surfaces, and which one you
                      want is the first question — not a link in a footer. */}
                  <Route path="/" element={<Entry />} />

                  {/* Hoople for Teams — internal events, members only. Signed in
                      at the door like the organizer console: there is nothing
                      here a non-member is allowed to see. */}
                  <Route
                    path="/teams"
                    element={
                      <RequireAuth>
                        <TeamsLayout />
                      </RequireAuth>
                    }
                  >
                    <Route index element={<TeamsDashboard />} />
                    <Route path="experiences" element={<TeamsExperiences />} />
                    <Route path="registrations" element={<TeamsRegistrations />} />
                    <Route path="sessions" element={<TeamsSessions />} />
                    <Route path="check-in" element={<TeamsCheckIn />} />
                    <Route path="analytics" element={<TeamsAnalytics />} />
                    <Route path="orders" element={<TeamsOrders />} />
                    <Route path="payments" element={<TeamsPayments />} />
                    <Route path="settings" element={<TeamsSettings />} />
                    <Route path="profile" element={<TeamsProfile />} />
                  </Route>

                  {/* The organizer console — the other half of the platform. */}
                  <Route
                    path="/organizer"
                    element={
                      <RequireAuth>
                        <OrgLayout />
                      </RequireAuth>
                    }
                  >
                    <Route index element={<OrgDashboard />} />
                    <Route
                      path="experiences"
                      element={<OrgExperiences scope="all" />}
                    />
                    <Route path="create" element={<OrgCreateExperience />} />
                    <Route
                      path="create/activity"
                      element={<OrgCreateActivity />}
                    />
                    <Route path="create/event" element={<OrgCreateEvent />} />
                    <Route
                      path="events"
                      element={<OrgExperiences scope="events" />}
                    />
                    <Route
                      path="activities"
                      element={<OrgExperiences scope="activities" />}
                    />
                    <Route
                      path="drafts"
                      element={<OrgExperiences scope="drafts" />}
                    />
                    <Route path="sessions" element={<OrgSessions />} />
                    <Route path="registrations" element={<OrgRegistrations />} />
                    <Route path="check-in" element={<OrgCheckIn />} />
                    <Route path="analytics" element={<OrgAnalytics />} />
                    <Route path="payments" element={<OrgPayouts />} />
                    <Route
                      path="payments/transactions"
                      element={<OrgTransactions />}
                    />
                    <Route path="settings" element={<OrgSettings />} />
                  </Route>

                  <Route element={<Layout />}>
                    {/* The participant site now starts at /home, since / is the
                        chooser. Its nav and footer link here. */}
                    <Route path="home" element={<Landing />} />
                    <Route path="discover" element={<Discover />} />

                    <Route path="events" element={<Events />} />
                    <Route path="events/:slug" element={<EventDetail />} />

                    <Route path="activities" element={<Activities />} />
                    <Route path="activities/:slug" element={<ActivityDetail />} />

                    <Route path="booking" element={<Booking />} />
                    <Route path="bookings" element={<MyBookings />} />
                    <Route path="bookings/:id" element={<ETicket />} />
                    <Route path="saved" element={<Saved />} />

                    <Route path="communities" element={<Communities />} />
                    <Route
                      path="communities/:slug"
                      element={<CommunityDetail />}
                    />

                    <Route path="organizers" element={<Organizers />} />
                    <Route path="how-it-works" element={<HowItWorks />} />
                    <Route path="pricing" element={<Pricing />} />
                    <Route path="help" element={<Help />} />

                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </Route>
                </Routes>
              </Suspense>
            </ToastProvider>
          </ExperiencesProvider>
        </BookingsProvider>
      </SavedProvider>
    </SessionProvider>
  );
}
