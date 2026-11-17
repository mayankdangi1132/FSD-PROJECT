import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  Users,
  Building2,
  GraduationCap,
  PlusCircle,
  Settings,
  Search,
  Shapes,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { initials } from '../utils/helpers';

// sidebar links for each role
const MENUS = {
  admin: [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/events', label: 'Events', icon: CalendarDays },
    { to: '/admin/clubs', label: 'Clubs', icon: Shapes },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/students', label: 'Students', icon: GraduationCap },
    { to: '/events/new', label: 'Create Event', icon: PlusCircle },
    { to: '/settings', label: 'Settings', icon: Settings },
  ],
  organizer: [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/events', label: 'My Events', icon: CalendarDays },
    { to: '/events/new', label: 'Create Event', icon: PlusCircle },
    { to: '/calendar', label: 'Calendar', icon: CalendarRange },
    { to: '/settings', label: 'Settings', icon: Settings },
  ],
  student: [
    { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/events', label: 'Browse Events', icon: Search },
    { to: '/calendar', label: 'Calendar', icon: CalendarRange },
    { to: '/clubs', label: 'Clubs', icon: Users },
    { to: '/departments', label: 'Departments', icon: Building2 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ],
};

const ROLE_NAMES = { admin: 'Administrator', club: 'Club organizer', department: 'Department organizer', student: 'Student' };

// page layout with a sidebar, used by all dashboards and the forms behind them
const DashboardLayout = ({ title, subtitle, actions, children }) => {
  const { user } = useAuth();
  const menu = MENUS[user.role === 'club' || user.role === 'department' ? 'organizer' : user.role] || [];

  return (
    <div className="container dash">
      <aside className="sidebar">
        <div className="sidebar-user">
          {user.logo ? <img src={user.logo} alt="" className="avatar" /> : <span className="avatar">{initials(user.name)}</span>}
          <div>
            <strong>{user.name}</strong>
            <small>{ROLE_NAMES[user.role]}</small>
          </div>
        </div>
        <nav className="side-nav">
          {menu.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="side-link">
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <section className="dash-main">
        <div className="dash-head">
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions && <div className="dash-actions">{actions}</div>}
        </div>
        {children}
      </section>
    </div>
  );
};

export default DashboardLayout;
