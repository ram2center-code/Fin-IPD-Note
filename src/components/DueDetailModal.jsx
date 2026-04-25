import React from 'react';
import { 
  X, User, Hash, BedDouble, Calendar, Banknote, 
  MessageSquare, UserCheck, ChevronRight, List, Clock
} from 'lucide-react';

const DueDetailModal = ({ isOpen, onClose, record, onViewFullList }) => {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" 
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden animate-slide-up border border-slate-100 flex flex-col">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-indigo-600 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Clock size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black">รายละเอียดเคสครบกำหนด</h3>
              <p className="text-xs font-bold opacity-70 uppercase tracking-widest mt-0.5">Patient Due Details</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Identity Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ชื่อ-นามสกุล</p>
              <div className="flex items-center gap-2">
                <User size={14} className="text-indigo-500" />
                <span className="font-black text-slate-800">{record.fullName}</span>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hospital Number</p>
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-indigo-500" />
                <span className="font-black text-slate-800 tabular-nums">{record.hn}</span>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">เลขห้อง</p>
              <div className="flex items-center gap-2">
                <BedDouble size={14} className="text-indigo-500" />
                <span className="font-black text-slate-800 tabular-nums">{record.room}</span>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">อายุ</p>
              <div className="flex items-center gap-2 text-slate-800 font-black">
                {record.age} ปี
              </div>
            </div>
          </div>

          {/* Financial Section */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-[32px] p-6">
            <div className="flex items-center gap-2 mb-4 text-emerald-700">
              <Banknote size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">สรุปยอดเงินคงเหลือ</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-emerald-600 opacity-70 uppercase mb-1">ยอดคงเหลือ (Balance)</p>
                <h4 className="text-4xl font-black text-emerald-700 tabular-nums tracking-tighter">
                  {Number(record.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h4>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-emerald-600/50 uppercase mb-1 text-right">มัดจำแล้ว: {Number(record.deposit).toLocaleString()}</p>
                <div className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest inline-block">
                  ครั้งที่ {record.notifyCount || 1}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            {record.note && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <MessageSquare size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">หมายเหตุ</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm font-bold text-slate-600 italic leading-relaxed">
                  "{record.note}"
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 bg-indigo-50 p-3 rounded-2xl border border-indigo-100">
              <UserCheck size={16} className="text-indigo-600" />
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">
                ลงข้อมูลโดย: {record.recordedBy || 'N/A'}
              </span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onViewFullList}
            className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-black hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3 group"
          >
            <List size={20} /> ดูข้อมูลในตารางเพิ่มเติม <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={onClose}
            className="w-full mt-4 py-3 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-slate-600 transition-colors"
          >
            ปิดหน้าต่างนี้
          </button>
        </div>
      </div>
    </div>
  );
};

export default DueDetailModal;
