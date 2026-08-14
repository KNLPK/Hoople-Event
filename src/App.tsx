import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ToastProvider } from '@/components/ui/Toast';
import { BookingsProvider } from '@/store/bookings';
import { SavedProvider } from '@/store/saved';
import { SessionProvider } from '@/store/session';

import { Landing } from '@/pages/Landing';
import { Discover } from '@/pages/Discover';
import { Events } from '@/pages/Events';
import { EventDetail } from '@/pages/EventDetail';
import { Activities } from '@/pages/Activities';
import { ActivityDetail } from '@/pages/ActivityDetail';
import { Booking } from '@/pages/Booking';
import { MyBookings } from '@/pages/MyBookings';
import { ETicket } from '@/pages/ETicket';
import { Saved } from '@/pages/Saved';
import { Auth } from '@/pages/Auth';
import { Communities, CommunityDetail } from '@/pages/Communities';
import { Organizers } from '@/pages/Organizers';
import { HowItWorks } from '@/pages/HowItWorks';
import { Pricing } from '@/pages/Pricing';
import { Help } from '@/pages/Help';

import { OrgLayout } from '@/components/organizer/OrgLayout';
import { OrgDashboard } from '@/pages/organizer/Dashboard';
import { OrgExperiences } from '@/pages/organizer/Experiences';
import { OrgCreateExperience } from '@/pages/organizer/CreateExperience';
import { OrgCreateActivity } from '@/pages/organizer/CreateActivity';
import { OrgCreateEvent } from '@/pages/organizer/CreateEvent';
import { OrgSessions } from '@/pages/organizer/Sessions';
import { OrgRegistrations } from '@/pages/organizer/Registrations';
import { OrgCheckIn } from '@/pages/organizer/CheckIn';
import { OrgAnalytics } from '@/pages/organizer/Analytics';
import { OrgPayouts, OrgTransactions } from '@/pages/organizer/Payments';
import { OrgSettings } from '@/pages/organizer/Settings';

export function App() {
  return (
    <SessionProvider>
      <SavedProvider>
        <BookingsProvider>
          <ToastProvider>
            <Routes>
              {/* Authentication has its own minimal chrome — no nav, no footer. */}
              <Route path="/auth" element={<Auth />} />

              {/* The organizer console — the other half of the platform. */}
              <Route path="/organizer" element={<OrgLayout />}>
                <Route index element={<OrgDashboard />} />
                <Route path="experiences" element={<OrgExperiences scope="all" />} />
                <Route path="create" element={<OrgCreateExperience />} />
                <Route path="create/activity" element={<OrgCreateActivity />} />
                <Route path="create/event" element={<OrgCreateEvent />} />
                <Route path="events" element={<OrgExperiences scope="events" />} />
                <Route path="activities" element={<OrgExperiences scope="activities" />} />
                <Route path="drafts" element={<OrgExperiences scope="drafts" />} />
                <Route path="sessions" element={<OrgSessions />} />
                <Route path="registrations" element={<OrgRegistrations />} />
                <Route path="check-in" element={<OrgCheckIn />} />
                <Route path="analytics" element={<OrgAnalytics />} />
                <Route path="payments" element={<OrgPayouts />} />
                <Route path="payments/transactions" element={<OrgTransactions />} />
                <Route path="settings" element={<OrgSettings />} />
              </Route>

              <Route element={<Layout />}>
                <Route index element={<Landing />} />
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
                <Route path="communities/:slug" element={<CommunityDetail />} />

                <Route path="organizers" element={<Organizers />} />
                <Route path="how-it-works" element={<HowItWorks />} />
                <Route path="pricing" element={<Pricing />} />
                <Route path="help" element={<Help />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </ToastProvider>
        </BookingsProvider>
      </SavedProvider>
    </SessionProvider>
  );
}
