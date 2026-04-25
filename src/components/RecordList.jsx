import React, { useState } from 'react';
import { Search, Edit2, Calendar, User, CreditCard, ChevronRight, MessageSquare, Clock, Hash, Filter, RotateCcw, Bell } from 'lucide-react';

const RecordList = ({ records, handleEdit, handleDelete, dueRecords, onOpenDetail }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.hn.includes(searchTerm) ||
      record.paymentType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPayment = filterPayment === 'all' || record.paymentType === filterPayment;
    const matchesType = filterType === 'all' || record.recordType === filterType;
    const matchesDate = !filterDate || record.checkDate === filterDate;

    return matchesSearch && matchesPayment && matchesType && matchesDate;
  });

  const groupedRecords = filteredRecords.reduce((groups, record) => {
    const date = record.checkDate;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedRecords).sort((a, b) => new Date(b) - new Date(a));

  const formatDateThai = (dateString) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterPayment('all');
    setFilterType('all');
    setFilterDate('');
  };

  return (
    <div className="animate-fade-in pb-20">
      {/* Search & Filter Header */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[32px] p-8 mb-10 shadow-2xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 leading-tight">Clinical Summary</h2>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest tabular-nums">
              Total: {records.length} patients | Showing: {filteredRecords.length}
            </p>
          </div>
          <button 
            onClick={resetFilters}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-colors"
          >
            <RotateCcw size={14} /> ล้างตัวกรองทั้งหมด
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Main Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ, HN..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all font-bold text-slate-600 shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Filter */}
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="date" 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-600 outline-none transition-all font-bold text-slate-600 tabular-nums cursor-pointer"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          {/* Payment Filter */}
          <div className="relative">
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-600 outline-none transition-all font-bold text-slate-600 appearance-none cursor-pointer"
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
            >
              <option value="all">รูปแบบชำระ: ทั้งหมด</option>
              <option value="ชำระเอง">ชำระเอง</option>
              <option value="AIA">AIA</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-600 outline-none transition-all font-bold text-slate-600 appearance-none cursor-pointer"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">ประเภท: ทั้งหมด</option>
              <option value="หลังทำหัตถการ">หลังทำหัตถการ</option>
              <option value="แจ้งยอดทุก 3 วัน">แจ้งยอดทุก 3 วัน</option>
            </select>
          </div>
        </div>
      </div>

      {sortedDates.length > 0 ? (
        sortedDates.map((date) => (
          <div key={date} className="mb-12">
            <div className="flex items-center gap-4 mb-6 ml-4">
               <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <Calendar size={20} />
               </div>
               <div>
                  <h3 className="font-black text-slate-800 text-lg leading-tight">{formatDateThai(date)}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                    {groupedRecords[date].length} PATIENTS ON THIS DAY
                  </p>
               </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white border border-slate-200 rounded-[32px] shadow-xl shadow-slate-200/20 overflow-x-auto mb-4 custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1250px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-5 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center pl-10">จัดการ</th>
                    <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">#</th>
                    <th className="px-5 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">HN</th>
                    <th className="px-5 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">ชื่อ-นามสกุล (อายุ)</th>
                    <th className="px-5 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Room</th>
                    <th className="px-5 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">พัก (วัน)</th>
                    <th className="px-5 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">ยอดทั้งหมด</th>
                    <th className="px-5 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">มัดจำ</th>
                    <th className="px-5 py-5 text-[9px] font-black text-indigo-600 uppercase tracking-widest text-right pr-10">คงเหลือ</th>
                    <th className="px-5 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">ครั้งที่</th>
                    <th className="px-5 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {groupedRecords[date].map((record, index) => (
                    <tr key={record.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-5 py-6 text-center pl-10">
                        <button 
                          onClick={() => handleEdit(record)}
                          className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm hover:shadow-md transition-all active:scale-90 mx-auto"
                        >
                          <Edit2 size={18} />
                        </button>
                      </td>
                      <td className="px-4 py-6 text-center">
                         <span className="text-[10px] font-black text-slate-300 tabular-nums">
                            {(index + 1).toString().padStart(2, '0')}
                         </span>
                      </td>
                      <td className="px-5 py-6">
                        <span className="text-[11px] font-black text-slate-400 tabular-nums bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 group-hover:bg-white transition-all whitespace-nowrap">
                          {record.hn}
                        </span>
                      </td>
                      <td className="px-5 py-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                             {dueRecords?.some(dr => dr.id === record.id) && (
                               <Bell 
                                  size={14} 
                                  className="text-red-500 animate-bounce shrink-0 cursor-pointer hover:text-red-600" 
                                  title="คลิกเพื่อดูรายละเอียดการแจ้งเตือน"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenDetail(record);
                                  }}
                                />
                             )}
                             <p className="font-black text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                               {record.fullName} <span className="text-slate-400 font-bold ml-1 text-xs">({record.age})</span>
                             </p>
                          </div>
                          <div className="flex gap-2 mt-1.5">
                            <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-md uppercase ${
                              record.paymentType === 'ชำระเอง' ? 'bg-blue-50 text-blue-600' : 'bg-stone-50 text-stone-600'
                            }`}>
                              {record.paymentType}
                            </span>
                            <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-md uppercase ${
                              record.recordType === 'หลังทำหัตถการ' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                            }`}>
                              {record.recordType}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-6 text-center font-black text-slate-700 tabular-nums">{record.room}</td>
                      <td className="px-5 py-6 text-center text-xs font-bold text-slate-500 tabular-nums">{record.stayDays}</td>
                      <td className="px-5 py-6 text-right font-bold text-slate-400 text-xs tabular-nums">{Number(record.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="px-5 py-6 text-right font-bold text-slate-400 text-xs tabular-nums">{Number(record.deposit).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="px-5 py-6 text-right font-black text-indigo-600 text-[16px] tabular-nums whitespace-nowrap pr-10">{Number(record.balance).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="px-5 py-6 text-center">
                         <span className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-600 rounded-full text-[10px] font-black mx-auto">
                            {record.notifyCount || '-'}
                         </span>
                      </td>
                      <td className="px-5 py-6">
                        <p className="text-[11px] font-bold text-slate-400 line-clamp-2 italic leading-relaxed">
                          {record.note || '-'}
                        </p>
                        {record.recordedBy && (
                          <div className="flex items-center gap-1.5 mt-2 opacity-60">
                             <User size={10} className="text-slate-400" />
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">โดย: {record.recordedBy}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Expanded view */}
            <div className="md:hidden space-y-4 px-4">
              {groupedRecords[date].map((record, index) => (
                <div key={record.id} className="bg-white border border-slate-200 p-6 rounded-[32px] shadow-lg shadow-slate-200/20 active:scale-95 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center text-[10px] font-black">{index + 1}</span>
                      <span className="text-[10px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg tabular-nums">HN: {record.hn}</span>
                    </div>
                    <button onClick={() => handleEdit(record)} className="text-indigo-600 bg-indigo-50 p-2 rounded-xl"><Edit2 size={18} /></button>
                  </div>
                  
                  <div className="flex gap-4 mb-4">
                     <div className="flex-1">
                        <div className="flex items-center gap-2">
                           {dueRecords?.some(dr => dr.id === record.id) && (
                              <Bell 
                                size={18} 
                                className="text-red-500 animate-bounce shrink-0 cursor-pointer" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenDetail(record);
                                }}
                              />
                           )}
                          <h3 className="font-black text-slate-800 text-lg leading-tight">{record.fullName}</h3>
                        </div>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">อายุ {record.age} ปี | พัก {record.stayDays} วัน</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                     <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">ยอดรวม</p>
                        <p className="text-sm font-black text-slate-600">{Number(record.totalAmount).toLocaleString()}</p>
                     </div>
                     <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">มัดจำแล้ว</p>
                        <p className="text-sm font-black text-slate-600">{Number(record.deposit).toLocaleString()}</p>
                     </div>
                  </div>

                  {record.note && (
                    <div className="mb-5 flex flex-col gap-2 bg-indigo-50/50 p-3 rounded-2xl">
                       <div className="flex items-start gap-2">
                          <MessageSquare size={14} className="text-indigo-400 mt-0.5" />
                          <p className="text-[10px] italic font-bold text-indigo-600/70">{record.note}</p>
                       </div>
                       {record.recordedBy && (
                          <div className="flex items-center gap-1.5 mt-1 pt-2 border-t border-indigo-100/50">
                             <User size={10} className="text-indigo-400" />
                             <span className="text-[8px] font-black text-indigo-400/70 uppercase tracking-widest">บันทึกโดย: {record.recordedBy}</span>
                          </div>
                       )}
                    </div>
                  )}

                  <div className="bg-indigo-600 rounded-2xl p-4 text-white flex justify-between items-center shadow-lg shadow-indigo-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest">ยอดคงเหลือ</p>
                        <span className="bg-white/20 text-white text-[8px] px-1.5 py-0.5 rounded-md font-black italic">ครั้งที่ {record.notifyCount || 1}</span>
                      </div>
                      <p className="text-2xl font-black tabular-nums">{Number(record.balance).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                    <ChevronRight size={20} className="opacity-50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
           <p className="text-slate-400 font-bold uppercase tracking-widest italic">ไม่พบข้อมูลที่ตรงกับตัวกรอง</p>
           <button onClick={resetFilters} className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest">ล้างตัวกรองเพื่อดูข้อมูลทั้งหมด</button>
        </div>
      )}
    </div>
  );
};

export default RecordList;
