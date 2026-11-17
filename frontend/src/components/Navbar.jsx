import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth, dashboardPath } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { initials } from '../utils/helpers';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="logo" onClick={closeMenu}>
          <img src="/favicon.svg" alt="" />
          <span>
            Campus <b>Connect</b>
          </span>
        </Link>

        <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
          <NavLink to="/" end onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/events" onClick={closeMenu}>
            Events
          </NavLink>
          <NavLink to="/calendar" onClick={closeMenu}>
            Calendar
          </NavLink>
          <NavLink to="/clubs" onClick={closeMenu}>
            Clubs
          </NavLink>
          <NavLink to="/departments" onClick={closeMenu}>
            Departments
          </NavLink>

          {user ? (
            <div className="nav-user">
              <Link to={dashboardPath(user)} className="nav-dashboard" onClick={closeMenu}>
                <span className="avatar sm">{initials(user.name)}</span>
                Dashboard
              </Link>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                <LogOut size={15} /> Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm nav-login" onClick={closeMenu}>
              Login
            </Link>
          )}
        </nav>

        <div className="nav-actions">
          <ThemeToggle />
          <button className="icon-btn menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
