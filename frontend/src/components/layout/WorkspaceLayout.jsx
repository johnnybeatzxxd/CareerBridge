import {
  Bell,
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
} from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Avatar } from '../ui/index.js';
import { useAuth } from '../../features/auth/index.js';

const roleNavigation = {
  JOB_SEEKER: [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/jobs', label: 'Find jobs', icon: Search },
    { to: '/applications', label: 'Applications', icon: BriefcaseBusiness },
    { to: '/wallet', label: 'Wallet', icon: WalletCards },
    { to: '/resume', label: 'Resume', icon: FileText },
    { to: '/alerts', label: 'Job alerts', icon: Bell },
  ],
  EMPLOYER: [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/employer/jobs', label: 'Job posts', icon: BriefcaseBusiness },
    { to: '/employer/candidates', label: 'Candidates', icon: Users },
  ],
  ADMIN: [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin', label: 'Administration', icon: ShieldCheck },
  ],
};

const routeTitles = {
  '/dashboard': 'Overview',
  '/applications': 'Applications',
  '/wallet': 'Wallet',
  '/resume': 'Resume',
  '/alerts': 'Job alerts',
  '/employer/jobs': 'Job posts',
  '/employer/candidates': 'Candidates',
  '/admin': 'Administration',
  '/account': 'Account settings',
};

export default function WorkspaceLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navigation = roleNavigation[user.role] || [];

  async function signOut() {
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <div className="grid min-h-screen grid-cols-[244px_minmax(0,1fr)] bg-[#f4f6f4]">
      <aside className="sticky top-0 flex h-screen flex-col border-r border-[#d8dfda] bg-white">
        <div className="flex h-16 items-center border-b border-[#dfe4e0] px-5">
          <Link className="flex items-center gap-3" to="/dashboard">
            <span className="grid h-9 w-9 place-items-center bg-[#172a23] text-white">
              <BriefcaseBusiness size={18} />
            </span>
            <span className="font-bold text-[#17211e]">CareerBridge</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-6">
          <p className="px-3 pb-3 text-[11px] font-bold uppercase text-[#93a09a]">Workspace</p>
          <div className="space-y-1">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 px-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#e7f3ed] text-[#12664f]'
                      : 'text-[#58645f] hover:bg-[#f4f7f5] hover:text-[#17211e]'
                  }`
                }
                to={to}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </div>

          <p className="px-3 pb-3 pt-8 text-[11px] font-bold uppercase text-[#93a09a]">Settings</p>
          <NavLink
            className={({ isActive }) =>
              `flex min-h-11 items-center gap-3 px-3 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-[#e7f3ed] text-[#12664f]'
                  : 'text-[#58645f] hover:bg-[#f4f7f5] hover:text-[#17211e]'
              }`
            }
            to="/account"
          >
            <Settings size={18} />
            Account
          </NavLink>
        </nav>

        <div className="border-t border-[#dfe4e0] p-4">
          <div className="flex items-center gap-3 px-2">
            <Avatar name={user.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#17211e]">{user.name}</p>
              <p className="truncate text-xs text-[#74807a]">{formatRole(user.role)}</p>
            </div>
          </div>
          <button
            className="mt-4 flex min-h-10 w-full items-center gap-3 px-2 text-sm font-semibold text-[#66736d] hover:bg-[#f4f7f5] hover:text-[#17211e]"
            onClick={signOut}
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#dfe4e0] bg-white px-8">
          <div>
            <p className="text-sm font-bold text-[#17211e]">{routeTitles[location.pathname] || 'Workspace'}</p>
            <p className="mt-0.5 text-xs text-[#7a8580]">{user.companyName || user.email}</p>
          </div>
          <Link className="flex items-center gap-3" to="/account">
            <div className="text-right">
              <p className="text-sm font-bold text-[#17211e]">{user.name}</p>
              <p className="text-xs text-[#7a8580]">{formatRole(user.role)}</p>
            </div>
            <Avatar name={user.name} size="sm" />
          </Link>
        </header>
        <div className="mx-auto max-w-[1400px] px-8 py-8 lg:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function formatRole(role) {
  return role
    .toLowerCase()
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}
