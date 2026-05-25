import { X, Bell, User, ChevronRight, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

const NotificationModal = ({ isOpen, onClose, dueRecords, onSelectRecord, onAcknowledge }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-slide-up border border-slate-100 flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">การแจ้งเตือน</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {dueRecords.length} เคสที่ครบกำหนด
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {dueRecords.length > 0 ? (
            dueRecords.map((record) => (
              <button
                key={record.id}
                onClick={() => onSelectRecord(record)}
                className="w-full text-left p-4 rounded-2xl border border-slate-100 hover:border-red-200 hover:bg-red-50/30 transition-all group flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:border-red-100">
                  <User size={20} className="text-slate-400 group-hover:text-red-500 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="font-black text-slate-800 text-sm truncate">{record.fullName}</h4>
                    {record.dueType === 'limit_500k' ? (
                      <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase ml-2 shrink-0 border border-amber-100 animate-pulse">500k+</span>
                    ) : (
                      <span className="text-[9px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded uppercase ml-2 shrink-0">Due</span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">HN: {record.hn} | ห้อง {record.room}</p>
                  {record.dueMessage && (
                    <p className={`text-[10px] font-bold mt-1 ${record.dueType === 'limit_500k' ? 'text-amber-500' : 'text-indigo-500'}`}>
                      • {record.dueMessage}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                   <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAcknowledge(record.id);
                    }}
                    className="w-10 h-10 flex items-center justify-center bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                    title="ทราบแล้ว (อัปเดตวันที่เป็นวันนี้)"
                  >
                    <CheckCircle2 size={20} />
                  </button>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={32} />
              </div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">ไม่มีการแจ้งเตือนในขณะนี้</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
             แสดงเฉพาะเคสที่ครบกำหนดแจ้งยอดทุก 3 วัน
           </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
