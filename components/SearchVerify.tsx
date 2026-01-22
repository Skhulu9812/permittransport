
import React, { useState } from 'react';
import { Permit, User, UserRole } from '../types';
import { Search, ShieldCheck, ShieldX, Info, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SearchVerifyProps {
  permits: Permit[];
  user?: User;
  onDeletePermit?: (id: string) => void;
}

const SearchVerify: React.FC<SearchVerifyProps> = ({ permits, user, onDeletePermit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<Permit | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Permit | null>(null);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  const isAdmin = user?.role === UserRole.ADMIN;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;

    const term = searchTerm.toUpperCase();
    const result = permits.find(p => 
      p.permitNumber.toUpperCase() === term || 
      p.vehicleReg.toUpperCase() === term || 
      p.operatorName.toUpperCase().includes(term)
    );

    setSearchResult(result || null);
    setHasSearched(true);
  };

  const confirmDelete = () => {
    if (pendingDelete && onDeletePermit) {
      onDeletePermit(pendingDelete.id);
      setShowToast(`Record ${pendingDelete.permitNumber} has been purged.`);
      setPendingDelete(null);
      setSearchResult(null);
      setDeleteConfirmed(false);
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-8 right-8 z-50 bg-emerald-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <p className="text-xs font-black uppercase tracking-widest">{showToast}</p>
        </div>
      )}

      {/* Confirmation Modal */}
      {pendingDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-black text-emerald-950 uppercase tracking-tight mb-2">Confirm Permanent Removal</h3>
              <p className="text-sm text-emerald-600/80 leading-relaxed mb-6">
                You are about to delete <span className="font-black text-emerald-950">{pendingDelete.permitNumber}</span> for vehicle <span className="font-black text-emerald-950">{pendingDelete.vehicleReg}</span>.
              </p>
              
              <label className="flex items-center justify-center gap-3 p-4 bg-red-50/50 rounded-2xl cursor-pointer group hover:bg-red-50 transition-colors">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-red-200 text-red-600 focus:ring-red-500"
                  checked={deleteConfirmed}
                  onChange={(e) => setDeleteConfirmed(e.target.checked)}
                />
                <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">I confirm this deletion is explicit</span>
              </label>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3 border-t border-slate-100">
              <button 
                onClick={() => { setPendingDelete(null); setDeleteConfirmed(false); }}
                className="flex-1 bg-white hover:bg-slate-100 text-slate-900 font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-widest border border-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={!deleteConfirmed}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-200 text-white font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-widest shadow-lg shadow-red-900/20"
              >
                Execute Purge
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-10 rounded-3xl border border-emerald-100 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full opacity-50"></div>
        
        <h2 className="text-2xl font-bold text-emerald-900 mb-8 flex items-center gap-3">
          <Search className="w-7 h-7 text-emerald-700" />
          Regulatory Verification
        </h2>
        
        <form onSubmit={handleSearch} className="flex gap-4 relative z-10">
          <input
            type="text"
            className="flex-1 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl p-4 text-emerald-950 focus:border-emerald-600 focus:ring-0 outline-none placeholder:text-emerald-300"
            placeholder="Scan ID, Permit Ref, or Vehicle Registration..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="bg-emerald-900 hover:bg-emerald-800 text-white font-black px-10 rounded-2xl transition-all shadow-lg shadow-emerald-950/20 active:scale-95"
          >
            VALIDATE
          </button>
        </form>
      </div>

      {hasSearched && (
        <div className="animate-in slide-in-from-top-4 duration-500">
          {searchResult ? (
            <div className={`p-8 rounded-3xl border-2 ${
              searchResult.status === 'ACTIVE' 
                ? 'bg-white border-emerald-200' 
                : 'bg-white border-red-200'
            } shadow-lg shadow-emerald-900/5`}>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between border-b border-emerald-50 pb-6">
                    <div className="flex items-center gap-5">
                      {searchResult.status === 'ACTIVE' ? (
                        <div className="p-4 bg-emerald-50 rounded-2xl"><ShieldCheck className="w-10 h-10 text-emerald-600" /></div>
                      ) : (
                        <div className="p-4 bg-red-50 rounded-2xl"><ShieldX className="w-10 h-10 text-red-600" /></div>
                      )}
                      <div>
                        <h3 className="text-4xl font-black text-emerald-950 tracking-tighter">{searchResult.vehicleReg}</h3>
                        <p className={`text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full mt-1 inline-block ${
                          searchResult.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          LICENSE {searchResult.status}
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <button 
                        onClick={() => setPendingDelete(searchResult)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 p-4 rounded-2xl transition-all border border-red-100"
                        title="Purge Unauthorized Record"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                    <div>
                      <p className="text-emerald-300 uppercase font-black text-[9px] tracking-widest mb-1">Authorization Ref</p>
                      <p className="font-bold text-emerald-900 text-lg">{searchResult.permitNumber}</p>
                    </div>
                    <div>
                      <p className="text-emerald-300 uppercase font-black text-[9px] tracking-widest mb-1">Registered Operator</p>
                      <p className="font-bold text-emerald-900 text-lg">{searchResult.operatorName}</p>
                    </div>
                    <div>
                      <p className="text-emerald-300 uppercase font-black text-[9px] tracking-widest mb-1">Date of Issuance</p>
                      <p className="font-semibold text-emerald-950">{searchResult.issueDate}</p>
                    </div>
                    <div>
                      <p className="text-emerald-300 uppercase font-black text-[9px] tracking-widest mb-1">Validity Expiry</p>
                      <p className={`font-black text-lg ${
                        new Date(searchResult.expiryDate) < new Date() ? 'text-red-600' : 'text-emerald-600'
                      }`}>{searchResult.expiryDate}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-72 bg-emerald-50/50 p-8 rounded-3xl border border-emerald-100 flex flex-col justify-center items-center gap-4 text-center">
                   <div className="p-4 bg-white rounded-2xl shadow-inner">
                      <div className="w-32 h-32 flex items-center justify-center opacity-40">
                         <ShieldCheck className="w-20 h-20 text-emerald-900" />
                      </div>
                   </div>
                   <p className="text-[10px] font-bold text-emerald-800/50 uppercase leading-relaxed">System Signature Verified<br/>Central Transport Database</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border-2 border-red-100 p-16 rounded-3xl text-center shadow-xl">
              <ShieldX className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-red-950 mb-2">Unauthorized/Not Found</h3>
              <p className="text-red-700/60 text-sm">The credentials provided do not match any active or historical records in the PTA registry.</p>
            </div>
          )}
        </div>
      )}

      {!hasSearched && (
        <div className="bg-emerald-900 text-emerald-100 p-8 rounded-3xl flex gap-6 shadow-2xl shadow-emerald-950/20">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
            <Info className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold uppercase tracking-widest text-[10px] mb-2 opacity-60">Verification Protocol</p>
            <p className="text-sm leading-relaxed opacity-90">
              Regulatory officers must cross-reference digital discs against this live portal. 
              Always verify that the vehicle plate, operator name, and barcode match the physical hardware presented by the driver.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchVerify;
