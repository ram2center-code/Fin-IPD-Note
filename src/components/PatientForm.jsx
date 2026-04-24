import React, { useState, useRef, useEffect } from 'react';
import { 
  User, Hash, BedDouble, Calendar, Banknote, 
  Wallet, Receipt, FileText, Search, UserPlus, 
  ChevronRight, Save, X, RotateCcw, HelpCircle, ChevronDown
} from 'lucide-react';

const PatientForm = ({ 
  formData, 
  handleInputChange, 
  handleSubmit, 
  handleCheckHistory, 
  searchResult, 
  editingId, 
  handleCancelEdit,
  handleResetForm
}) => {
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const paymentRef = useRef(null);

  const paymentOptions = [
    "ชำระเอง", "AIA", "Allianz", "FWD", 
    "Bupa", "ไทยประกัน", "เมืองไทยประกัน", "อื่นๆ"
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paymentRef.current && !paymentRef.current.contains(event.target)) {
        setShowPaymentOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectPayment = (option) => {
    handleInputChange({ target: { name: 'paymentType', value: option } });
    setShowPaymentOptions(false);
  };

  const filteredOptions = paymentOptions.filter(opt => 
    opt.toLowerCase().includes(formData.paymentType.toLowerCase())
  );

  return (
    <div className="max-w-[1000px] mx-auto animate-fade-in pb-12">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Patient Identity Section */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[40px] p-8 md:p-10 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 leading-tight">
                {editingId ? 'แก้ไขข้อมูลคนไข้' : 'ลงทะเบียนเคส IPD ใหม่'}
              </h2>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">General Information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* HN Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Hospital Number (HN)</label>
              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input
                  type="text" name="hn" placeholder="เช่น 12345"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-slate-700"
                  value={formData.hn} onChange={handleInputChange} required
                />
                <button
                  type="button" onClick={handleCheckHistory}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all border border-slate-100 active:scale-95"
                >
                  <Search size={14} className="inline mr-1" /> เช็คประวัติ
                </button>
              </div>
              {searchResult && (
                <p className={`text-[10px] font-black px-2 py-1 rounded-lg mt-2 inline-block ${searchResult.includes('ไม่พบ') ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>{searchResult}</p>
              )}
            </div>

            {/* Name Input */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name (ชื่อ-นามสกุล)</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input
                  type="text" name="fullName" placeholder="ชื่อจริง และ นามสกุล"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-slate-700"
                  value={formData.fullName} onChange={handleInputChange} required
                />
              </div>
            </div>

            {/* Others */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Age (อายุ)</label>
              <input type="number" name="age" placeholder="ปี" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-slate-700 tabular-nums" value={formData.age} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Room Number (เลขห้อง)</label>
              <div className="relative group">
                <BedDouble className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input type="text" name="room" placeholder="เช่น 801" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-slate-700 tabular-nums" value={formData.room} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Stay Duration (พักกี่คืน)</label>
              <input type="number" name="stayDays" placeholder="จำนวนคืน" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-slate-700 tabular-nums" value={formData.stayDays} onChange={handleInputChange} required />
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[40px] p-8 md:p-10 shadow-2xl shadow-slate-200/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
                <Banknote size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-800">ข้อมูลการเงิน</h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">ยอดรวมทั้งหมด</label>
                  <input type="number" name="totalAmount" placeholder="0.00" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-black text-slate-700 text-lg tabular-nums" value={formData.totalAmount} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Deposit</label>
                  <input type="number" name="deposit" placeholder="0.00" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-black text-slate-700 text-lg tabular-nums" value={formData.deposit} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="bg-emerald-600 rounded-3xl p-6 shadow-xl shadow-emerald-100 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1 text-emerald-100">คงเหลือที่ต้องชำระ (Balance)</p>
                <p className="text-4xl font-black tabular-nums tracking-tight">
                  {Number(formData.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* CUSTOM PREMIUM DROPDOWN */}
                <div className="space-y-2 relative" ref={paymentRef}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">รูปแบบการชำระ</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="paymentType"
                      autoComplete="off"
                      placeholder="เช่น AIA, ชำระเอง"
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                      value={formData.paymentType}
                      onChange={handleInputChange}
                      onFocus={() => setShowPaymentOptions(true)}
                    />
                    <ChevronDown size={18} className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 transition-transform ${showPaymentOptions ? 'rotate-180' : ''}`} />
                  </div>

                  {showPaymentOptions && (
                    <div className="absolute z-[100] left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-slide-up max-h-[250px] overflow-y-auto custom-scrollbar">
                      {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            className="w-full text-left px-5 py-3.5 text-sm font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-b border-slate-50 last:border-0"
                            onClick={() => selectPayment(opt)}
                          >
                            {opt}
                          </button>
                        ))
                      ) : (
                        <div className="px-5 py-3 text-xs font-bold text-slate-400 italic">เลือก "{formData.paymentType}" เป็นค่าใหม่</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">วันที่เช็คยอด</label>
                  <input type="date" name="checkDate" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none font-bold text-slate-700" value={formData.checkDate} onChange={handleInputChange} required />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[40px] p-8 md:p-10 shadow-2xl shadow-slate-200/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-violet-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-violet-100">
                <FileText size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-800">บันทึกเพิ่มเติม</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">ประเภทการบันทึก</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer font-black text-xs uppercase tracking-widest ${formData.recordType === 'หลังทำหัตถการ' ? 'bg-red-50 border-red-500 text-red-600' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-red-200'}`}>
                    <input type="radio" name="recordType" value="หลังทำหัตถการ" className="hidden" checked={formData.recordType === 'หลังทำหัตถการ'} onChange={handleInputChange} />
                    หลังทำหัตถการ
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer font-black text-xs uppercase tracking-widest ${formData.recordType === 'แจ้งยอดทุก 3 วัน' ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200'}`}>
                    <input type="radio" name="recordType" value="แจ้งยอดทุก 3 วัน" className="hidden" checked={formData.recordType === 'แจ้งยอดทุก 3 วัน'} onChange={handleInputChange} />
                    แจ้งยอดทุก 3 วัน
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">แจ้งครั้งที่ (Optional)</label>
                <input type="text" name="notifyCount" placeholder="เช่น 1, 2, 3..." className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-600 outline-none transition-all font-bold text-slate-700" value={formData.notifyCount} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">หมายเหตุ</label>
                <textarea name="note" rows="3" placeholder="ระบุรายละเอียดเพิ่มเติมที่นี่..." className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-600 outline-none transition-all font-bold text-slate-700 resize-none" value={formData.note} onChange={handleInputChange}></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-8">
          <button type="submit" className="w-full sm:w-auto px-12 py-5 bg-slate-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-black hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3 group">
            <Save size={20} /> {editingId ? 'บันทึกการแก้ไข' : 'บันทึกรายการใหม่'} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button type="button" onClick={editingId ? handleCancelEdit : handleResetForm} className="w-full sm:w-auto px-12 py-5 bg-white border-2 border-slate-200 text-slate-500 rounded-3xl font-black text-sm uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-all flex items-center justify-center gap-3">
            {editingId ? <X size={20} /> : <RotateCcw size={20} />} {editingId ? 'ยกเลิกการแก้ไข' : 'ล้างข้อมูลฟอร์ม'}
          </button>
        </div>
      </form>

      <div className="mt-12 flex justify-center">
        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
          <HelpCircle size={14} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tip: ใช้ปุ่ม HN Search เพื่อดึงข้อมูลเดิมมาใช้ใหม่ได้ทันที</span>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;
