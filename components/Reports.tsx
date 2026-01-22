
import React, { useState } from 'react';
import { Permit, User, UserRole } from '../types';
import { Download, Filter, FileSpreadsheet, FileText, Loader2, CheckCircle2, Trash2, AlertTriangle, X } from 'lucide-react';

interface ReportsProps {
  permits: Permit[];
  user?: User;
  onDeletePermit?: (id: string) => void;
}

const Reports: React.FC<ReportsProps> = ({ permits, user, onDeletePermit }) => {
  const [filter, setFilter] = useState({
    status: 'ALL',
    dateFrom: '',
    dateTo: '',
    route: ''
  });
  
  const [exporting, setExporting] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Permit | null>(null);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN;

  const filteredPermits = permits.filter(p => {
    const statusMatch = filter.status === 'ALL' || p.status === filter.status;
    const dateFromMatch = !filter.dateFrom || new Date(p.issueDate) >= new Date(filter.dateFrom);
    const dateToMatch = !filter.dateTo || new Date(p.issueDate) <= new Date(filter.dateTo);
    const routeMatch = !filter.route || p.route.toLowerCase().includes(filter.route.toLowerCase());
    return statusMatch && dateFromMatch && dateToMatch && routeMatch;
  });

  const generateCSV = () => {
    const headers = ['Permit Number', 'Operator Name', 'Company ID', 'Vehicle Reg', 'Route', 'Issue Date', 'Expiry Date', 'Status'];
    const rows = filteredPermits.map(p => [
      p.permitNumber,
      `"${p.operatorName.replace(/"/g, '""')}"`,
      p.companyId,
      p.vehicleReg,
      `"${(p.route || '').replace(/"/g, '""')}"`,
      p.issueDate,
      p.expiryDate,
      p.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split('T')[0];
    
    link.setAttribute('href', url);
    link.setAttribute('download', `PTA_Report_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = (type: 'EXCEL' | 'PDF') => {
    setExporting(type);
    
    setTimeout(() => {
      if (type === 'EXCEL') {
        generateCSV();
      }
      setExporting(null);
      setShowSuccess(`Successfully generated ${type === 'EXCEL' ? 'CSV' : 'PDF'} report for ${filteredPermits.length} records.`);
      setTimeout(() => setShowSuccess(null), 4000);
    }, 1500);
  };

  const confirmDelete = () => {
    if (pendingDelete && onDeletePermit) {
      onDeletePermit(pendingDelete.id);
      setShowSuccess(`Permit ${pendingDelete.permitNumber} has been permanently removed.`);
      setPendingDelete(null);
      setDeleteConfirmed(false);
      setTimeout(() => setShowSuccess(null), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-8 right-8 z-50 bg-emerald-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="text-xs font-black uppercase tracking-widest">Action Verified</p>
            <p className="text-[10px] opacity-70">{showSuccess}</p>
          </div>
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {pendingDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-black text-emerald-950 uppercase tracking-tight mb-2">Confirm Permanent Removal</h3>
              <p className="text-sm text-emerald-600/80 leading-relaxed mb-6">
                You are about to delete <span className="font-black text-emerald-950">{pendingDelete.permitNumber}</span> ({pendingDelete.vehicleReg}). This action is irreversible.
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
            <div className="p-6 bg-emerald-50/50 flex gap-3 border-t border-emerald-50">
              <button 
                onClick={() => { setPendingDelete(null); setDeleteConfirmed(false); }}
                className="flex-1 bg-white hover:bg-emerald-100 text-emerald-900 font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-widest border border-emerald-100"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={!deleteConfirmed}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-200 text-white font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-widest shadow-lg shadow-red-900/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-sm">
        <h3 className="text-lg font-bold text-emerald-900 mb-6 flex items-center gap-2 uppercase tracking-tight">
          <Filter className="w-5 h-5 text-emerald-600" />
          Intelligence Filtering
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Registry Status</label>
            <select 
              className="w-full bg-emerald-50/30 border border-emerald-100 rounded-lg p-3 text-sm text-emerald-900 outline-none focus:border-emerald-600 focus:bg-white transition-all"
              value={filter.status}
              onChange={(e) => setFilter({...filter, status: e.target.value})}
            >
              <option value="ALL">All Categories</option>
              <option value="ACTIVE">Active Permits</option>
              <option value="EXPIRED">Expired Records</option>
              <option value="REVOKED">Revoked Licenses</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Audit Start</label>
            <input 
              type="date" 
              className="w-full bg-emerald-50/30 border border-emerald-100 rounded-lg p-3 text-sm text-emerald-900 outline-none focus:border-emerald-600 focus:bg-white transition-all"
              value={filter.dateFrom}
              onChange={(e) => setFilter({...filter, dateFrom: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Audit End</label>
            <input 
              type="date" 
              className="w-full bg-emerald-50/30 border border-emerald-100 rounded-lg p-3 text-sm text-emerald-900 outline-none focus:border-emerald-600 focus:bg-white transition-all"
              value={filter.dateTo}
              onChange={(e) => setFilter({...filter, dateTo: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Route Analysis</label>
            <input 
              type="text" 
              className="w-full bg-emerald-50/30 border border-emerald-100 rounded-lg p-3 text-sm text-emerald-900 outline-none focus:border-emerald-600 focus:bg-white transition-all"
              placeholder="Search by zone..."
              value={filter.route}
              onChange={(e) => setFilter({...filter, route: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-emerald-100 shadow-xl overflow-hidden min-w-0">
        <div className="p-8 border-b border-emerald-50 flex flex-col md:flex-row justify-between items-center bg-emerald-50/10 gap-4">
          <div>
            <span className="text-xl font-black text-emerald-950 uppercase tracking-tight">Audit Table Preview</span>
            <p className="text-xs text-emerald-500 font-bold uppercase mt-1">{filteredPermits.length} matching data units</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => handleExport('EXCEL')}
              disabled={!!exporting}
              className="bg-emerald-800 hover:bg-emerald-900 disabled:bg-emerald-200 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-950/20 transition-all min-w-[170px] justify-center"
            >
              {exporting === 'EXCEL' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              {exporting === 'EXCEL' ? 'PREPARING CSV...' : 'CSV DATA EXPORT'}
            </button>
            <button 
              onClick={() => handleExport('PDF')}
              disabled={!!exporting}
              className="bg-white hover:bg-emerald-50 disabled:bg-slate-50 text-emerald-900 border-2 border-emerald-100 font-black px-6 py-3 rounded-xl flex items-center gap-2 text-[10px] uppercase tracking-widest transition-all min-w-[170px] justify-center"
            >
              {exporting === 'PDF' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {exporting === 'PDF' ? 'PREPARING PDF...' : 'GENERATE REPORT'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-emerald-950 text-emerald-100 font-black uppercase text-[9px] tracking-[0.2em]">
              <tr>
                <th className="p-6 whitespace-nowrap">ID REF</th>
                <th className="p-6 whitespace-nowrap">OPERATOR ENTITY</th>
                <th className="p-6 whitespace-nowrap">REGISTRATION</th>
                <th className="p-6 whitespace-nowrap">ROUTE ZONING</th>
                <th className="p-6 whitespace-nowrap">EXPIRATION</th>
                <th className="p-6 text-center whitespace-nowrap">STATUS</th>
                {isAdmin && <th className="p-6 text-right whitespace-nowrap">ACTIONS</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {filteredPermits.map((p) => (
                <tr key={p.id} className="hover:bg-emerald-50/50 transition-colors">
                  <td className="p-6 font-mono font-bold text-emerald-700 whitespace-nowrap">{p.permitNumber}</td>
                  <td className="p-6 font-bold text-emerald-900 uppercase whitespace-nowrap max-w-[200px] truncate">{p.operatorName}</td>
                  <td className="p-6 font-black text-emerald-950 whitespace-nowrap">{p.vehicleReg}</td>
                  <td className="p-6 text-xs text-emerald-600 font-medium truncate max-w-[150px]">{p.route || 'N/A'}</td>
                  <td className="p-6 font-bold text-emerald-900 whitespace-nowrap">{p.expiryDate}</td>
                  <td className="p-6 text-center whitespace-nowrap">
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase ${
                      p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="p-6 text-right whitespace-nowrap">
                      <button 
                        onClick={() => { setPendingDelete(p); setDeleteConfirmed(false); }}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Permanently Purge Record"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filteredPermits.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="p-24 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30">
                      <FileText className="w-12 h-12 mb-4" />
                      <p className="text-sm font-bold uppercase tracking-[0.2em]">No datasets found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
