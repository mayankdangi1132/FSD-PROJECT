import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import CalendarPage from './pages/CalendarPage';
import Organizers from './pages/Organizers';
import Login from './pages/Login';
import Settings from './pages/Settings';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import EventForm from './pages/EventForm';
import ManageWinners from './pages/ManageWinners';
import NotFound from './pages/NotFound';

const ORGANIZER_ROLES = ['admin', 'club', 'department'];

// shorter way to write a protected route
const only = (roles, page) => <ProtectedRoute roles={roles}>{page}</ProtectedRoute>;

function App() {
  const { pathname } = useLocation();

  // go back to top when the page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/clubs" element={<Organizers role="club" />} />
          <Route path="/departments" element={<Organizers role="department" />} />

          {/* any logged in college account */}
          <Route path="/events" element={only(null, <Events />)} />
          <Route path="/events/:id" element={only(null, <EventDetails />)} />
          <Route path="/calendar" element={only(null, <CalendarPage />)} />
          <Route path="/settings" element={only(null, <Settings />)} />

          {/* one dashboard per role - the backend checks the role again on every request */}
          <Route path="/student" element={only(['student'], <StudentDashboard />)} />
          <Route path="/admin/:section?" element={only(['admin'], <AdminDashboard />)} />
          <Route path="/dashboard/:section?" element={only(['club', 'department'], <OrganizerDashboard />)} />

          {/* event management (admin, clubs, departments) */}
          <Route path="/events/new" element={only(ORGANIZER_ROLES, <EventForm />)} />
          <Route path="/events/:id/edit" element={only(ORGANIZER_ROLES, <EventForm />)} />
          <Route path="/events/:id/winners" element={only(ORGANIZER_ROLES, <ManageWinners />)} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
