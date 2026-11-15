import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth, dashboardPath } from '../context/AuthContext';

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

        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? '✕' : '☰'}
        </button>

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
          <NavLink to={dashboardPath(user)} onClick={closeMenu}>
            Dashboard
          </NavLink>

          {user ? (
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" onClick={closeMenu}>
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
