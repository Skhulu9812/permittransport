
import React from 'react';
import { User, UserRole } from '../types';
import { LayoutDashboard, FilePlus, Search, BarChart3, Printer, LogOut, ShieldCheck, Users } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.CLERK, UserRole.VIEWER] },
    { id: 'registration', label: 'Registration', icon: FilePlus, roles: [UserRole.ADMIN, UserRole.CLERK] },
    { id: 'search', label: 'Search & Verify', icon: Search, roles: [UserRole.ADMIN, UserRole.CLERK, UserRole.VIEWER] },
    { id: 'printing', label: 'Print Permits', icon: Printer, roles: [UserRole.ADMIN, UserRole.CLERK] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.VIEWER] },
    { id: 'users', label: 'User Management', icon: Users, roles: [UserRole.ADMIN] },
  ];

  return (
    <aside className="w-72 bg-emerald-950 border-r border-emerald-900 flex flex-col no-print z-20">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10 group cursor-default">
          <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center text-emerald-950 font-black shadow-lg shadow-yellow-600/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <span className="block font-black text-lg text-white tracking-tight leading-none">PTA PORTAL</span>
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Government Official</span>
          </div>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            if (!item.roles.includes(user.role)) return null;
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-white text-emerald-950 shadow-lg' 
                    : 'text-emerald-100/60 hover:text-white hover:bg-emerald-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-700' : 'text-emerald-500/50 group-hover:text-yellow-600'}`} />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 bg-emerald-900/30">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-emerald-300 hover:text-white hover:bg-red-500/20 transition-all font-bold text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>Exit System</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
