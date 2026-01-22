
import React, { useState, useEffect } from 'react';
import { Permit, User, UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CheckCircle, XCircle, Clock, FileText, AlertTriangle, ArrowRight } from 'lucide-react';

interface DashboardProps {
  permits: Permit[];
  user?: User;
}

const Dashboard: React.FC<DashboardProps> = ({ permits, user }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const stats = {
    total: permits.length,
    active: permits.filter(p => p.status === 'ACTIVE').length,
    expired: permits.filter(p => p.status === 'EXPIRED').length,
    revoked: permits.filter(p => p.status === 'REVOKED').length
  };

  // Logic to identify permits nearing expiry (within 30 days)
  const nearingExpiry = permits.filter(p => {
    if (p.status !== 'ACTIVE') return false;
    const expiryDate = new Date(p.expiryDate);
    return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
  }).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  const chartData = [
    { name: 'Active', value: stats.active, color: '#059669' },
    { name: 'Expired', value: stats.expired, color: '#d97706' },
    { name: 'Revoked', value: stats.revoked, color: '#dc2626' }
  ];

  const recentPermits = [...permits].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  const isAdminOrClerk = user?.role === UserRole.ADMIN || user?.role === UserRole.CLERK;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Nearing Expiry Warning Banner (Visible to Admin/Clerk) */}
      {isAdminOrClerk && nearingExpiry.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-2xl shadow-sm flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">Critical Awareness</p>
              <p className="text-amber-950 font-bold">
                {nearingExpiry.length} {nearingExpiry.length === 1 ? 'Permit is' : 'Permits are'} nearing threshold expiry within 30 days.
              </p>
            </div>
          </div>
          <div className="hidden md:flex gap-2">
            {nearingExpiry.slice(0, 3).map(p => (
              <span key={p.id} className="bg-white px-3 py-1 rounded-lg text-[9px] font-black text-amber-700 border border-amber-200">
                {p.vehicleReg}
              </span>
            ))}
            {nearingExpiry.length > 3 && <span className="text-[9px] font-black text-amber-400">+{nearingExpiry.length - 3} MORE</span>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Registry" value={stats.total} icon={FileText} color="emerald" />
        <StatCard title="Active Permits" value={stats.active} icon={CheckCircle} color="green" />
        <StatCard title="Expired Records" value={stats.expired} icon={Clock} color="yellow" />
        <StatCard title="Revoked Permits" value={stats.revoked} icon={XCircle} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-visible">
        {/* Analytics Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-sm min-w-0">
            <h3 className="text-sm font-black mb-8 text-emerald-400 uppercase tracking-widest">Compliance Analytics</h3>
            <div className="w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0fdf4" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#10b981" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      fontWeight="700"
                    />
                    <YAxis 
                      stroke="#10b981" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      fontWeight="700"
                    />
                    <Tooltip 
                      cursor={{ fill: '#ecfdf5' }}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        borderRadius: '12px', 
                        border: '1px solid #d1fae5', 
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Critical Expiry Watch List (Visible to Admin/Clerk) */}
          {isAdminOrClerk && nearingExpiry.length > 0 && (
            <div className="bg-white p-8 rounded-3xl border border-amber-100 shadow-sm overflow-hidden">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest">Critical Expiry Watch</h3>
                  <div className="px-3 py-1 bg-amber-50 rounded-lg text-[9px] font-black text-amber-600">30-DAY WINDOW</div>
               </div>
               <div className="space-y-4">
                 {nearingExpiry.map((p) => {
                   const diffTime = Math.abs(new Date(p.expiryDate).getTime() - today.getTime());
                   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                   return (
                     <div key={p.id} className="flex items-center justify-between p-5 bg-amber-50/30 rounded-2xl border border-amber-50 hover:border-amber-200 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl border border-amber-100 flex items-center justify-center font-black text-emerald-950 shadow-sm">
                            {p.vehicleReg.substring(0,2)}
                          </div>
                          <div>
                            <p className="font-bold text-emerald-950 text-sm group-hover:text-amber-700 transition-colors">{p.vehicleReg}</p>
                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{p.operatorName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">Expires In</p>
                          <p className="text-lg font-black text-amber-600 leading-none">{diffDays} Days</p>
                          <p className="text-[8px] font-bold text-emerald-300 mt-1 uppercase tracking-tighter">{p.expiryDate}</p>
                        </div>
                     </div>
                   );
                 })}
               </div>
            </div>
          )}
        </div>

        {/* Live Feed Sidebar */}
        <div className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-sm overflow-hidden flex flex-col min-w-0">
          <h3 className="text-sm font-black mb-8 text-emerald-400 uppercase tracking-widest">Live Registry Feed</h3>
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {recentPermits.map((permit) => (
              <div key={permit.id} className="flex items-center justify-between p-4 bg-emerald-50/30 rounded-2xl border border-emerald-50 hover:border-emerald-200 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-emerald-950 truncate text-sm">{permit.vehicleReg}</p>
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-wider truncate">{permit.operatorName}</p>
                </div>
                <div className="text-right ml-3">
                  <span className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase whitespace-nowrap ${
                    permit.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {permit.status}
                  </span>
                </div>
              </div>
            ))}
            {recentPermits.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 opacity-20">
                <FileText className="w-8 h-8 mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">No Records</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => {
  const colors: any = {
    green: 'text-emerald-600 bg-emerald-50',
    yellow: 'text-amber-600 bg-amber-50',
    red: 'text-red-600 bg-red-50',
    emerald: 'text-emerald-800 bg-emerald-100'
  };

  return (
    <div className="p-6 bg-white rounded-3xl border border-emerald-100 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]">
      <div className={`p-4 rounded-2xl ${colors[color] || colors.emerald}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1.5">{title}</p>
        <p className="text-2xl font-black text-emerald-950 leading-none">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;
