import { BriefcaseBusiness } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/index.js';

export default function PublicHeader() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f7f8f6]">
      <header className="sticky top-0 z-40 border-b border-[#dfe4e0] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link className="flex items-center gap-3" to="/">
            <span className="grid h-9 w-9 place-items-center bg-[#172a23] text-white">
              <BriefcaseBusiness size={18} aria-hidden="true" />
            </span>
            <span className="text-base font-bold text-[#17211e]">CareerBridge</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/jobs">Find jobs</NavItem>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  className="inline-flex min-h-10 items-center px-4 text-sm font-bold text-[#405049] hover:text-[#176b52]"
                  to="/dashboard"
                >
                  {user.name}
                </Link>
                <button
                  className="inline-flex min-h-10 items-center bg-[#172a23] px-4 text-sm font-bold text-white hover:bg-[#263c33]"
                  onClick={logout}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  className="hidden min-h-10 items-center px-4 text-sm font-bold text-[#405049] hover:text-[#176b52] sm:inline-flex"
                  to="/login"
                >
                  Sign in
                </Link>
                <Link
                  className="inline-flex min-h-10 items-center bg-[#176b52] px-4 text-sm font-bold text-white transition-colors hover:bg-[#115740]"
                  to="/register"
                >
                  Join CareerBridge
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      className={({ isActive }) =>
        `inline-flex min-h-16 items-center border-b-2 text-sm font-bold transition-colors ${
          isActive
            ? 'border-[#176b52] text-[#176b52]'
            : 'border-transparent text-[#56635d] hover:text-[#17211e]'
        }`
      }
      end={to === '/'}
      to={to}
    >
      {children}
    </NavLink>
  );
}
