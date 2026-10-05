import React from 'react';
import { FileText, Download, Eye, CheckCircle } from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';

export const ReportsPage: React.FC = () => {
  const { currentUser } = useAdminStore();

  const mockReports = [
    { id: 'rpt-1', patient: 'Rahul Patel', type: 'Blood Test', date: 'Oct 6, 2026', status: 'Ready for Review' },
    { id: 'rpt-2', patient: 'Meera Iyer', type: 'Ultrasound', date: 'Oct 5, 2026', status: 'Reviewed' },
    { id: 'rpt-3', patient: 'Suresh Chandra', type: 'X-Ray', date: 'Oct 4, 2026', status: 'Pending Lab' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-white font-newsreader">
            Medical Reports & Documents
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-[#7C9A92] mt-1">
            Review patient lab results, diagnostics, and prescriptions.
          </p>
        </div>
      </div>

      {currentUser?.role !== 'ADMIN' && currentUser?.role !== 'STAFF' && currentUser?.role !== 'DOCTOR' ? (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl border border-yellow-200">
          You do not have permission to view medical records.
        </div>
      ) : (
        <div className="bg-white dark:bg-[#091D19] border border-[#E5E7EB] dark:border-[#173D35] rounded-3xl overflow-hidden">
          <div className="p-5 border-b border-[#E5E7EB] dark:border-[#173D35]">
            <h2 className="text-sm font-semibold text-[#111827] dark:text-white">Recent Patient Reports</h2>
          </div>
          <div className="divide-y divide-[#E5E7EB] dark:divide-[#173D35]">
            {mockReports.map((report) => (
              <div key={report.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F9FAFB] dark:hover:bg-white/5 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111827] dark:text-white">{report.patient}</h3>
                    <p className="text-xs text-[#6B7280] dark:text-[#7C9A92] mt-0.5">
                      {report.type} • Uploaded {report.date}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    report.status === 'Reviewed' 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                      : report.status === 'Ready for Review'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                      : 'bg-stone-50 text-stone-600 dark:bg-white/5 dark:text-stone-400'
                  }`}>
                    {report.status}
                  </span>
                  
                  <button className="p-2 rounded-lg text-[#0F4C5C] hover:bg-[#0F4C5C]/10 dark:text-[#5EEAD4] dark:hover:bg-[#5EEAD4]/10 transition" title="View PDF">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB] dark:text-[#7C9A92] dark:hover:text-white dark:hover:bg-white/10 transition" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
