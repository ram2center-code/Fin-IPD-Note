import React, { useState } from 'react';
import { Search, Edit2, Calendar, User, CreditCard, ChevronRight, MessageSquare, Clock, Hash, Filter, RotateCcw, Bell, ChevronDown, ChevronUp, BedDouble, Plus, CheckCircle } from 'lucide-react';

const RecordList = ({ records, handleEdit, handleDelete, dueRecords, onOpenDetail, userRole, handleAdd, handleCloseHN, showClosedCases = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [expandedHN, setExpandedHN] = useState(null);

  const filteredRecords = records.filter(record => {
    if (record.isClosed && !showClosedCases) return false;

    const matchesSearch =
      record.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.hn.includes(searchTerm) ||
      record.paymentType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPayment = filterPayment === 'all' || record.paymentType === filterPayment;
    const matchesType = filterType === 'all' || record.recordType === filterType;
    const matchesDate = !filterDate || record.checkDate === filterDate;

    return matchesSearch && matchesPayment && matchesType && matchesDate;
  });

  // Group by HN
  const groupedByHN = filteredRecords.reduce((groups, record) => {
    const hn = record.hn;
    if (!groups[hn]) {
      groups[hn] = {
        hn: hn,
        fullName: record.fullName,
        age: record.age,
        records: []
      };
    }
    groups[hn].records.push(record);
    return groups;
  }, {});

  // Sort HNs by the most recent record date
  const sortedHNs = Object.keys(groupedByHN).sort((a, b) => {
    const latestA = Math.max(...groupedByHN[a].records.map(r => new Date(r.checkDate)));
    const latestB = Math.max(...groupedByHN[b].records.map(r => new Date(r.checkDate)));
    return latestB - latestA;
  });

  const formatDateThai = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterPayment('all');
    setFilterType('all');
    setFilterDate('');
  };

  const toggleHN = (hn) => {
    setExpandedHN(expandedHN === hn ? null : hn);
  };

  return (
    <div className="animate-fade-in pb-20">
      {/* Search & Filter Header */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[32px] p-8 mb-10 shadow-2xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 leading-tight">{showClosedCases ? 'ประวัติทั้งหมด (Admin)' : 'Clinical Summary'}</h2>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest tabular-nums">
              Total: {records.length} patients | Showing: {sortedHNs.length} groups
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-colors"
          >
            <RotateCcw size={14} /> ล้างตัวกรองทั้งหมด
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Main Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-600 transition-colors" size={18} />
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
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input
              type="date"
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-600 outline-none transition-all font-bold text-slate-600 tabular-nums cursor-pointer"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          {/* Payment Filter */}
          <div className="relative">
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
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
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
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

      <div className="space-y-4">
        {sortedHNs.length > 0 ? (
          sortedHNs.map((hn) => {
            const patientData = groupedByHN[hn];
            const isExpanded = expandedHN === hn;
            const latestRecord = patientData.records[0];
            const totalBalance = patientData.records.reduce((sum, r) => sum + (Number(r.balance) || 0), 0);
            const hasDue = patientData.records.some(r => dueRecords?.some(dr => dr.id === r.id));

            return (
              <div key={hn} className={`bg-white border border-slate-200 rounded-[32px] overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-2xl shadow-indigo-100 ring-1 ring-indigo-600/10' : 'shadow-lg shadow-slate-200/20 hover:border-indigo-600/30'}`}>
                {/* Accordion Header */}
                <div
                  onClick={() => toggleHN(hn)}
                  className="p-6 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isExpanded ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-500'}`}>
                      <User size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-800 text-lg leading-tight">{patientData.fullName}</h3>
                        <span className="text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg tabular-nums">HN: {hn}</span>
                        {patientData.records[0].isClosed ? (
                          <span className="text-[10px] font-black text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">ปิดเคสแล้ว</span>
                        ) : (
                          <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg">ยังไม่ปิดเคส</span>
                        )}
                        {hasDue && (
                          <Bell size={14} className="text-red-500 animate-bounce" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-widest">
                        อายุ {patientData.age} ปี | {patientData.records.length} ประวัติการรักษา
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                    {!patientData.records[0].isClosed && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAdd && handleAdd(hn); }}
                          className="w-8 h-8 flex items-center justify-center text-slate-500 bg-slate-50 hover:bg-green-500 hover:text-white rounded-lg shadow-sm transition-all active:scale-90"
                          title="เพิ่มประวัติใหม่"
                        >
                          <Plus size={16} />
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); handleCloseHN && handleCloseHN(hn); }}
                          className="w-8 h-8 flex items-center justify-center text-slate-500 bg-slate-50 hover:bg-red-500 hover:text-white rounded-lg shadow-sm transition-all active:scale-90"
                          title="ปิดเคส (HN)"
                        >
                          <CheckCircle size={16} />
                        </button>
                      </div>
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'bg-indigo-50 text-indigo-600 rotate-180' : 'bg-slate-50 text-slate-300'}`}>
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="px-6 pb-8 animate-slide-down">
                    <div className="border-t border-slate-100 pt-6">
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50 rounded-xl">
                              <th className="px-4 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">จัดการ</th>
                              <th className="px-4 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">วันที่</th>
                              <th className="px-4 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Room</th>
                              <th className="px-4 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">ประเภท/ชำระ</th>
                              <th className="px-4 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">ยอดทั้งหมด</th>
                              <th className="px-4 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">มัดจำ</th>
                              <th className="px-4 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">ครั้งที่</th>
                              <th className="px-4 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">หมายเหตุ</th>
                              <th className="px-4 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">ชื่อผู้ลงข้อมูล</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {patientData.records.map((record) => (
                              <tr key={record.id} className={`hover:bg-indigo-50/30 transition-colors group ${record.isClosed ? 'opacity-70' : ''}`}>
                                <td className="px-4 py-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    {handleEdit && (
                                      <button
                                        onClick={() => handleEdit(record)}
                                        className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-white rounded-lg shadow-sm hover:shadow-md transition-all active:scale-90"
                                        title="แก้ไข"
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    {dueRecords?.some(dr => dr.id === record.id) && (
                                      <Bell
                                        size={16}
                                        className="text-red-500 animate-bounce shrink-0 cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onOpenDetail(record);
                                        }}
                                      />
                                    )}
                                    <span className="text-sm font-black text-slate-600 tabular-nums">
                                      {formatDateThai(record.checkDate)}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-center font-black text-slate-700 tabular-nums text-sm">{record.room}</td>
                                <td className="px-4 py-4">
                                  <div className="flex flex-col gap-1.5">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase w-fit ${record.paymentType === 'ชำระเอง' ? 'bg-blue-50 text-blue-600' : 'bg-stone-50 text-stone-600'}`}>
                                      {record.paymentType}
                                    </span>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase w-fit ${record.recordType === 'หลังทำหัตถการ' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                      {record.recordType}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-slate-500 text-sm tabular-nums">{Number(record.totalAmount).toLocaleString()}</td>
                                <td className="px-4 py-4 text-right font-bold text-slate-500 text-sm tabular-nums">{Number(record.deposit).toLocaleString()}</td>
                                <td className="px-4 py-4 text-center">
                                  <span className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-600 rounded-full text-[11px] font-black mx-auto">
                                    {record.notifyCount || '-'}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  <p className="text-xs font-bold text-slate-500 line-clamp-1 italic">{record.note || '-'}</p>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <p className="text-xs font-bold text-indigo-600 truncate">{record.recordedBy || '-'}</p>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile List View */}
                      <div className="md:hidden space-y-3">
                        {patientData.records.map((record) => (
                          <div key={record.id} className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl relative">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                {dueRecords?.some(dr => dr.id === record.id) && (
                                  <Bell
                                    size={16}
                                    className="text-red-500 animate-bounce shrink-0 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenDetail(record);
                                    }}
                                  />
                                )}
                                <div>
                                  <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">{formatDateThai(record.checkDate)}</p>
                                  <p className="text-sm font-bold text-slate-500 mt-0.5">ห้อง {record.room} | ครั้งที่ {record.notifyCount || 1}</p>
                                </div>
                              </div>
                              {handleEdit && (
                                <button onClick={() => handleEdit(record)} className="text-indigo-600 bg-white p-2 rounded-lg shadow-sm border border-slate-100"><Edit2 size={16} /></button>
                              )}
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-100 mb-3">
                              <p className="text-[10px] font-black text-slate-500 uppercase mb-1">ประเภท / รูปแบบชำระ</p>
                              <div className="flex gap-2">
                                <span className="text-xs font-black text-indigo-600">{record.recordType}</span>
                                <span className="text-xs font-black text-slate-500">|</span>
                                <span className="text-xs font-black text-slate-600">{record.paymentType}</span>
                              </div>
                            </div>
                            {record.note && (
                              <div className="flex items-start gap-2 bg-white/50 p-2 rounded-xl border border-slate-100">
                                <MessageSquare size={14} className="text-slate-500 mt-0.5" />
                                <p className="text-xs italic font-bold text-slate-500">{record.note}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200 shadow-inner">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Search size={24} className="text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest italic">ไม่พบข้อมูลที่ตรงกับตัวกรอง</p>
            <button onClick={resetFilters} className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline transition-all">ล้างตัวกรองเพื่อดูข้อมูลทั้งหมด</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordList;
