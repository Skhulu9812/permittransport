
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Users, UserPlus, Trash2, Edit2, ShieldAlert, Key, X, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserManagementProps {
  users: User[];
  onUpdateUsers: (users: User[]) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onUpdateUsers }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [pendingDelete, setPendingDelete] = useState<User | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: UserRole.VIEWER
  });

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.name) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('users').insert([{
        id: crypto.randomUUID(),
        ...formData
      }]);
      
      if (error) throw error;
      
      setIsAdding(false);
      setFormData({ name: '', username: '', password: '', role: UserRole.VIEWER });
      triggerToast(`Account provisioned for ${formData.name}`);
      onUpdateUsers([]); // Trigger refresh in parent
    } catch (err) {
      console.error(err);
      triggerToast("Failed to create user in database.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);
    try {
      const updatePayload: any = {
        name: formData.name,
        username: formData.username,
        role: formData.role
      };
      
      if (formData.password) {
        updatePayload.password = formData.password;
      }

      const { error } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', editingUser.id);
      
      if (error) throw error;
      
      setEditingUser(null);
      triggerToast(`Updated profile for ${formData.name}`);
      onUpdateUsers([]); // Trigger refresh in parent
    } catch (err) {
      console.error(err);
      triggerToast("Failed to update cloud record.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', pendingDelete.id);
      
      if (error) throw error;
      
      setPendingDelete(null);
      triggerToast("User account permanently revoked.");
      onUpdateUsers([]); // Trigger refresh
    } catch (err) {
      console.error(err);
      triggerToast("Failed to delete cloud record.");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      password: '',
      role: user.role
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-8 right-8 z-50 bg-emerald-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <p className="text-xs font-black uppercase tracking-widest">{showToast}</p>
        </div>
      )}

      {/* Confirmation Modal */}
      {pendingDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 animate-in zoom-in-95">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-black text-emerald-950 uppercase tracking-tight mb-2">Revoke Access?</h3>
              <p className="text-sm text-emerald-600/80 leading-relaxed mb-6 px-4">
                Permanently delete <span className="font-black text-emerald-950">{pendingDelete.name}</span> from the cloud registry.
              </p>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3 border-t border-slate-100">
              <button disabled={loading} onClick={() => setPendingDelete(null)} className="flex-1 bg-white hover:bg-slate-100 text-slate-900 font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-widest border border-slate-200">Cancel</button>
              <button disabled={loading} onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-widest shadow-lg shadow-red-900/20 flex items-center justify-center">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(isAdding || editingUser) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8">
            <div className="p-8 border-b border-emerald-50 bg-emerald-50/30 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tight">
                  {isAdding ? 'Provision New Account' : 'Edit Official Profile'}
                </h3>
                <p className="text-xs text-emerald-500 font-bold uppercase mt-1">Supabase Authority Control</p>
              </div>
              <button onClick={() => { setIsAdding(false); setEditingUser(null); }} className="p-2 hover:bg-white rounded-xl text-emerald-300 hover:text-red-500 transition-all"><X /></button>
            </div>
            <form onSubmit={isAdding ? handleAdd : handleEdit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-2">Full Legal Name</label>
                  <input type="text" required className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 text-emerald-950 focus:border-emerald-600 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-2">System Username</label>
                  <input type="text" required className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 text-emerald-950 focus:border-emerald-600 outline-none" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-2">Access PIN / Password {editingUser && '(Leave blank to keep current)'}</label>
                  <input type="password" required={isAdding} className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 text-emerald-950 focus:border-emerald-600 outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-2">Security Role</label>
                  <select className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 text-emerald-950 focus:border-emerald-600 outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                    <option value={UserRole.VIEWER}>Viewer (Read-Only)</option>
                    <option value={UserRole.CLERK}>Clerk (Operational)</option>
                    <option value={UserRole.ADMIN}>Administrator (Full Authority)</option>
                  </select>
                </div>
              </div>
              <button disabled={loading} type="submit" className="w-full bg-emerald-950 hover:bg-emerald-900 text-white font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-widest shadow-xl shadow-emerald-950/20 flex items-center justify-center">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isAdding ? 'Issue New Credentials' : 'Commit Profile Changes')}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-emerald-950 uppercase tracking-tight">Identity Management</h2>
          <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mt-1 opacity-70">Control cloud system access levels.</p>
        </div>
        <button onClick={() => { setIsAdding(true); setFormData({name:'', username:'', password:'', role:UserRole.VIEWER}); }} className="bg-yellow-600 hover:bg-yellow-500 text-emerald-950 font-black px-8 py-4 rounded-2xl flex items-center gap-3 text-[10px] uppercase tracking-widest shadow-xl shadow-yellow-600/20 transition-all">
          <UserPlus className="w-4 h-4" /> Provision User
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-emerald-50 bg-emerald-50/10 flex items-center justify-between">
           <h3 className="text-sm font-black text-emerald-950 uppercase tracking-[0.2em]">Authorized Personnel Registry</h3>
           <div className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">{users.length} LIVE ACCOUNTS</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-emerald-950 text-emerald-100 font-black uppercase text-[9px] tracking-[0.2em]">
              <tr>
                <th className="p-6">NAME</th>
                <th className="p-6">USERNAME</th>
                <th className="p-6">SECURITY ROLE</th>
                <th className="p-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-emerald-50/50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-black">{u.name.charAt(0)}</div>
                      <span className="font-bold text-emerald-950">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-6 font-mono text-emerald-600 text-xs">{u.username}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                      u.role === UserRole.CLERK ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(u)} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all" title="Reset Password / Edit Profile"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setPendingDelete(u)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all" title="Revoke Access"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
