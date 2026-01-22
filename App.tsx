import React, { useState, useEffect } from 'react';
import { User, UserRole, Permit } from './types';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Registration from './components/Registration';
import SearchVerify from './components/SearchVerify';
import Reports from './components/Reports';
import Printing from './components/Printing';
import UserManagement from './components/UserManagement';
import { supabase } from './lib/supabase';
import { Shield, Loader2, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [permits, setPermits] = useState<Permit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: permitsData, error: permitsError } = await supabase
        .from('permits')
        .select('*')
        .order('createdAt', { ascending: false });

      if (permitsError) throw permitsError;
      setPermits(permitsData || []);

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');

      if (usersError) throw usersError;
      setUsers(usersData || []);
      
      if (!usersData || usersData.length === 0) {
        const defaultUsers = [
          { username: 'admin', password: 'pta123', role: UserRole.ADMIN, name: 'Arthur Admin' },
        ];
        await supabase.from('users').insert(defaultUsers);
        const { data: refreshedUsers } = await supabase.from('users').select('*');
        setUsers(refreshedUsers || []);
      }
    } catch (err: any) {
      console.error('Data sync error:', err);
      setError('Database connection interrupted. Check your cloud configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddPermit = async (newPermit: Permit) => {
    try {
      const { error } = await supabase.from('permits').insert([newPermit]);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleDeletePermit = async (id: string) => {
    try {
      const { error } = await supabase.from('permits').delete().eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Deletion failed:', err);
    }
  };

  const handleUpdateUsers = async () => {
    await fetchData();
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading && !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-emerald-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-yellow-600 animate-spin mx-auto mb-4" />
          <p className="text-emerald-100 font-bold uppercase tracking-widest text-xs">Connecting to Registry...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-red-50 p-6">
        <div className="max-w-md text-center bg-white p-10 rounded-3xl shadow-xl border border-red-100">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-xl font-black text-emerald-950 uppercase mb-2">Cloud Sync Failed</h2>
          <p className="text-emerald-700/60 text-sm mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="w-full bg-emerald-900 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest">Retry Connection</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} users={users} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard permits={permits} user={user} />;
      case 'registration':
        return user.role !== UserRole.VIEWER ? (
          <Registration permits={permits} onAddPermit={handleAddPermit} />
        ) : (
          <AccessDenied />
        );
      case 'search':
        return <SearchVerify permits={permits} user={user} onDeletePermit={handleDeletePermit} />;
      case 'reports':
        return <Reports permits={permits} user={user} onDeletePermit={handleDeletePermit} />;
      case 'printing':
        return user.role !== UserRole.VIEWER ? (
          <Printing permits={permits} />
        ) : (
          <AccessDenied />
        );
      case 'users':
        return user.role === UserRole.ADMIN ? (
          <UserManagement users={users} onUpdateUsers={handleUpdateUsers} />
        ) : (
          <AccessDenied />
        );
      default:
        return <Dashboard permits={permits} user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-emerald-50/30 text-emerald-950 overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />

      <main className="flex-1 overflow-y-auto p-8 relative">
        <header className="mb-8 flex justify-between items-center border-b border-emerald-100 pb-6">
          <div>
            <h1 className="text-2xl font-black text-emerald-950 uppercase tracking-tight">
              Permit Control Center
            </h1>
            <p className="text-emerald-600 text-xs font-medium uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Supabase Connection
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-emerald-100">
            <div className="text-right">
              <p className="text-sm font-bold text-emerald-950">{user.name}</p>
              <p className="text-[10px] font-black text-yellow-600 uppercase tracking-wider">{user.role} ACCESS</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-900 flex items-center justify-center text-white font-bold shadow-md">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const AccessDenied = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-3xl border border-emerald-100 shadow-sm">
    <Shield className="w-20 h-20 text-red-500 mb-4 opacity-20" />
    <h2 className="text-2xl font-bold text-emerald-900">Security Restriction</h2>
    <p className="text-emerald-600 mt-2">Your current profile does not have clearance for this module.</p>
  </div>
);

export default App;