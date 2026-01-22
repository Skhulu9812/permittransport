
import React, { useState } from 'react';
import { Permit } from '../types';
import { UserPlus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface RegistrationProps {
  permits: Permit[];
  onAddPermit: (permit: Permit) => Promise<void>;
}

const Registration: React.FC<RegistrationProps> = ({ permits, onAddPermit }) => {
  const [formData, setFormData] = useState({
    operatorName: '',
    companyId: '',
    vehicleReg: '',
    route: '',
    expiryDate: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.operatorName || !formData.vehicleReg || !formData.expiryDate) {
      setError('Please fill in all required fields.');
      return;
    }

    const isDuplicate = permits.some(p => p.vehicleReg.toUpperCase() === formData.vehicleReg.toUpperCase() && p.status === 'ACTIVE');
    if (isDuplicate) {
      setError('This vehicle registration already has an active permit.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newPermit: Permit = {
        id: crypto.randomUUID(),
        permitNumber: `PTA-${new Date().getFullYear()}-${String(permits.length + 1).padStart(4, '0')}`,
        operatorName: formData.operatorName,
        companyId: formData.companyId,
        vehicleReg: formData.vehicleReg.toUpperCase(),
        route: formData.route,
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: formData.expiryDate,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };

      await onAddPermit(newPermit);
      setSuccess(true);
      setFormData({
        operatorName: '',
        companyId: '',
        vehicleReg: '',
        route: '',
        expiryDate: ''
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to sync with Supabase. Verify connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl border border-emerald-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-emerald-50 bg-emerald-50/30">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-emerald-900 uppercase tracking-wider">
            <UserPlus className="w-6 h-6 text-emerald-700" />
            Registry & Vehicle Enrolment
          </h2>
          <p className="text-emerald-600/70 text-sm mt-1">Issue new digital operating licenses synchronized with Cloud Registry.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Operator Name *</label>
            <input
              type="text"
              disabled={isSubmitting}
              className="w-full bg-emerald-50/30 border border-emerald-100 rounded-lg p-3 text-emerald-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all placeholder:text-emerald-300 disabled:opacity-50"
              placeholder="Full Name or Business Entity"
              value={formData.operatorName}
              onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Corporate ID / Reg #</label>
            <input
              type="text"
              disabled={isSubmitting}
              className="w-full bg-emerald-50/30 border border-emerald-100 rounded-lg p-3 text-emerald-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all placeholder:text-emerald-300 disabled:opacity-50"
              placeholder="Enterprise Registration Number"
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Vehicle Plate *</label>
            <input
              type="text"
              disabled={isSubmitting}
              className="w-full bg-emerald-50/30 border border-emerald-100 rounded-lg p-3 text-emerald-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all placeholder:text-emerald-300 disabled:opacity-50"
              placeholder="e.g. ABC 123 GP"
              value={formData.vehicleReg}
              onChange={(e) => setFormData({ ...formData, vehicleReg: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Operational Route</label>
            <input
              type="text"
              disabled={isSubmitting}
              className="w-full bg-emerald-50/30 border border-emerald-100 rounded-lg p-3 text-emerald-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all placeholder:text-emerald-300 disabled:opacity-50"
              placeholder="Assigned operational zones"
              value={formData.route}
              onChange={(e) => setFormData({ ...formData, route: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Permit Expiry *</label>
            <input
              type="date"
              disabled={isSubmitting}
              className="w-full bg-emerald-50/30 border border-emerald-100 rounded-lg p-3 text-emerald-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all disabled:opacity-50"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            />
          </div>

          <div className="md:col-span-2 mt-4 space-y-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 flex items-center gap-3 text-emerald-700 text-sm">
                <CheckCircle2 className="w-5 h-5" />
                Permit synchronized with Cloud Registry successfully.
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-900 hover:bg-emerald-800 disabled:bg-emerald-300 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>SYNCHRONIZING...</span>
                </>
              ) : (
                'AUTHORIZE NEW PERMIT'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registration;
