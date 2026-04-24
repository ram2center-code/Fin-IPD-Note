import React from 'react';
import { X, Clock, MapPin, User, Calendar } from 'lucide-react';

const HistoryModal = ({ isOpen, onClose, historyData, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-fade-in border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-800">พบประวัติการรักษาเดิม</h3>
            <p className="text-xs font-bold text-slate-400 mt-0.5">เลือกรายการที่ต้องการดึงข้อมูลมาใช้</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
          {historyData.map((record, index) => (
            <button
              key={index}
              onClick={() => onSelect(record)}
              className="w-full text-left p-4 rounded-2xl border border-slate-100 hover:border-indigo-600/30 hover:bg-indigo-50/50 transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <span className="font-bold text-slate-700">{record.fullName}</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
                  HN: {record.hn}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-4 text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar size={14} className="text-slate-300" />
                  <span className="font-semibold">{record.checkDate}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 justify-end">
                  <MapPin size={14} className="text-slate-300" />
                  <span className="font-semibold text-slate-600">ห้อง {record.room || '-'}</span>
                </div>
              </div>

              {/* Hover Indicator */}
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-600 translate-x-full group-hover:translate-x-0 transition-transform"></div>
            </button>
          ))}
        </div>

        <div className="p-4 bg-slate-50 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            คลิกที่รายการเพื่อเลือกข้อมูล
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
