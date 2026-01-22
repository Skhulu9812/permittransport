import React, { useState } from 'react';
import { Permit } from '../types';
import { Printer, Eye, ArrowLeft, ClipboardList, BadgeCheck, FileText, Calendar, Hash, MapPin, Building2, User, Layout, ShieldCheck } from 'lucide-react';
import Barcode from 'react-barcode';

interface PrintingProps {
  permits: Permit[];
}

const Printing: React.FC<PrintingProps> = ({ permits }) => {
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [view, setView] = useState<'grid' | 'details'>('grid');

  const handlePrint = () => {
    window.print();
  };

  const handleSelect = (permit: Permit) => {
    setSelectedPermit(permit);
    setView('details');
  };

  const handleBack = () => {
    setView('grid');
    setSelectedPermit(null);
  };

  if (view === 'details' && selectedPermit) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
        <style>
          {`
            @media print {
              @page { margin: 0; size: auto; }
              .no-print { display: none !important; }
              .print-only { display: block !important; }
              
              .disc-print-container {
                width: 90mm !important;
                height: 90mm !important;
                margin: 20mm auto;
                padding: 0;
                border: 0.1mm solid #ccc !important;
                border-radius: 50%;
                page-break-after: avoid;
                page-break-inside: avoid;
                display: flex !important;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            .print-only { display: none; }
          `}
        </style>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border border-emerald-100 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Return to List
          </button>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100/30 border border-emerald-100 rounded-xl">
               <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Active Output:</span>
               <span className="text-[10px] font-black text-emerald-950 bg-white px-3 py-1 rounded-lg border border-emerald-100 uppercase">90mm Round Disc</span>
            </div>
            <button 
              onClick={handlePrint}
              className="bg-emerald-950 hover:bg-emerald-900 text-white font-black px-10 py-3.5 rounded-xl flex items-center gap-3 text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-950/20 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" /> EXECUTE PRINT
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl overflow-hidden">
              <div className="p-6 bg-emerald-950 text-white flex items-center gap-3">
                <div className="p-2 bg-emerald-800 rounded-lg">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] block leading-tight">Regulatory Record</span>
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Metadata Listing</span>
                </div>
              </div>
              <div className="p-2">
                <DetailRow icon={Hash} label="Record UUID" value={selectedPermit.id} mono />
                <DetailRow icon={FileText} label="Permit Reference" value={selectedPermit.permitNumber} highlight />
                <DetailRow icon={User} label="Authorized Holder" value={selectedPermit.operatorName} />
                <DetailRow icon={Building2} label="Entity Registration" value={selectedPermit.companyId || "N/A"} />
                <DetailRow icon={Hash} label="Vehicle Plate" value={selectedPermit.vehicleReg} highlight />
                <DetailRow icon={MapPin} label="Route Allocation" value={selectedPermit.route || "Global Permission"} />
                <DetailRow icon={Calendar} label="Date of Activation" value={selectedPermit.issueDate} />
                <DetailRow icon={Calendar} label="Threshold Expiry" value={selectedPermit.expiryDate} color="text-red-600" />
                <DetailRow icon={BadgeCheck} label="Operational Status" value={selectedPermit.status} isStatus />
                <DetailRow icon={Calendar} label="System Timestamp" value={new Date(selectedPermit.createdAt).toLocaleString()} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col items-center bg-slate-100 rounded-3xl p-10 border-2 border-dashed border-slate-200 shadow-inner min-h-[700px] justify-center overflow-auto scrollbar-hide relative">
             <div className="absolute top-6 left-6 flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
               <Layout className="w-3.5 h-3.5" /> Security Disc Preview (90x90mm)
             </div>
             
             <div className="bg-white shadow-2xl p-0 rounded-none transform scale-75 md:scale-110 origin-center">
                <DiscPreview permit={selectedPermit} />
             </div>
          </div>
        </div>

        <div className="print-only">
           <DiscPreview permit={selectedPermit} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-emerald-950 uppercase tracking-wider">Permit Distribution Hub</h2>
          <div className="text-xs text-emerald-600 font-bold uppercase tracking-widest mt-1 opacity-70">Generate security-grade transit credentials.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
        {permits.filter(p => p.status === 'ACTIVE').map((permit) => (
          <div key={permit.id} className="bg-white border-2 border-emerald-50 rounded-3xl overflow-hidden hover:border-emerald-600 transition-all group shadow-sm hover:shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[9px] font-black bg-yellow-500 text-emerald-950 px-3 py-1.5 rounded-xl uppercase tracking-[0.1em]">{permit.permitNumber}</span>
                <span className="text-xs font-black text-emerald-900 tracking-tighter bg-emerald-50 px-3 py-1.5 rounded-xl">{permit.vehicleReg}</span>
              </div>
              <p className="font-black text-emerald-950 text-xl mb-1 truncate uppercase">{permit.operatorName}</p>
              <button 
                onClick={() => handleSelect(permit)}
                className="w-full bg-emerald-950 hover:bg-emerald-900 text-white text-[10px] font-black uppercase py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
              >
                <Eye className="w-4 h-4" /> CONFIGURE DISC PRINT
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DetailRow = ({ icon: Icon, label, value, highlight, color, isStatus, mono }: any) => (
  <div className="flex items-center gap-4 p-4 border-b border-emerald-50 last:border-0 hover:bg-emerald-50 transition-colors cursor-default">
    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
      <Icon className="w-5 h-5 text-emerald-700" />
    </div>
    <div className="flex-1 overflow-hidden">
      <p className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-0.5 leading-none">{label}</p>
      {isStatus ? (
        <span className="text-[9px] font-black uppercase bg-emerald-950 text-white px-3 py-1 rounded-lg inline-block mt-1">
          {value}
        </span>
      ) : (
        <p className={`${highlight ? 'text-emerald-950 font-black text-sm' : 'text-emerald-800 text-xs font-bold'} ${color || ''} ${mono ? 'font-mono break-all opacity-50' : ''} truncate leading-tight mt-1`}>
          {value}
        </p>
      )}
    </div>
  </div>
);

const DiscPreview = ({ permit }: { permit: Permit }) => (
  <div className="flex flex-col items-center justify-center p-12 bg-white min-w-[400px]">
    <div className="disc-print-container bg-white w-[90mm] h-[90mm] rounded-full border-[3mm] border-emerald-950 flex flex-col items-center justify-between text-center overflow-hidden relative p-8">
      <div className="pt-3 z-10">
        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-900 leading-none mb-1.5">PTA National Authority</div>
        <div className="text-[7px] font-black text-emerald-500 uppercase tracking-[0.4em] leading-none">OPERATING CREDENTIAL</div>
      </div>
      <div className="z-10 flex flex-col items-center py-4">
        <div className="text-[38px] font-black text-emerald-950 leading-none tracking-tighter mb-1.5">{permit.vehicleReg}</div>
        <div className="text-[8px] font-black uppercase text-emerald-600 truncate max-w-[65mm] px-4">{permit.operatorName}</div>
      </div>
      <div className="bg-emerald-950 text-white px-7 py-3 rounded-full z-10 border-2 border-emerald-800">
         <span className="text-[7px] font-black uppercase tracking-[0.3em] mr-3 text-emerald-400">EXPIRING</span>
         <span className="text-[14px] font-black tracking-tight">{permit.expiryDate}</span>
      </div>
      <div className="mb-4 z-10 flex flex-col items-center bg-white p-2 rounded-xl">
         <Barcode 
          value={permit.permitNumber} 
          width={1.2} 
          height={32} 
          fontSize={8} 
          background="transparent" 
          font="monospace"
          displayValue={false}
        />
        <div className="text-[10px] font-black text-emerald-950 mt-1 uppercase tracking-widest leading-none">{permit.permitNumber}</div>
      </div>
      <div className="absolute bottom-4 text-[6px] font-black text-emerald-200 uppercase tracking-[0.4em] z-10">Security Disc Format 90x90mm</div>
    </div>
  </div>
);

export default Printing;