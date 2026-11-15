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
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import EventForm from './pages/EventForm';
import ManageWinners from './pages/ManageWinners';
import NotFound from './pages/NotFound';

const ORGANIZER_ROLES = ['admin', 'club', 'department'];

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
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* everything below needs a college account (student, organizer or admin) */}
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/clubs" element={<ProtectedRoute><Organizers role="club" /></ProtectedRoute>} />
          <Route path="/departments" element={<ProtectedRoute><Organizers role="department" /></ProtectedRoute>} />
          <Route path="/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['club', 'department']}>
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/new"
            element={
              <ProtectedRoute roles={ORGANIZER_ROLES}>
                <EventForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id/edit"
            element={
              <ProtectedRoute roles={ORGANIZER_ROLES}>
                <EventForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id/winners"
            element={
              <ProtectedRoute roles={ORGANIZER_ROLES}>
                <ManageWinners />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
