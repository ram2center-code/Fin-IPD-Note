import React, { useState, useEffect } from 'react';
import PatientForm from '../components/PatientForm';
import RecordList from '../components/RecordList';
import { supabase } from '../supabaseClient';
import { mapDBToState, mapStateToDB } from '../utils/formatters';
import toast from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';

const Dashboard = ({ records, setRecords, dueRecords, setSelectedDueRecord, setShowDueDetailModal, session, userRole }) => {
  const [activeTab, setActiveTab] = useState('form');
  const [targetCloseHN, setTargetCloseHN] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    hn: '',
    room: '',
    stayDays: '',
    checkDate: new Date().toISOString().split('T')[0],
    totalAmount: '',
    deposit: '',
    balance: 0,
    notifyCount: '',
    paymentType: '',
    recordType: 'หลังทำหัตถการ',
    note: '',
    recordedBy: '',
    isAcknowledged: false
  });

  // Calculate balance automatically
  useEffect(() => {
    const total = parseFloat(formData.totalAmount) || 0;
    const dep = parseFloat(formData.deposit) || 0;
    setFormData(prev => ({ ...prev, balance: total - dep }));
  }, [formData.totalAmount, formData.deposit]);

  const handleResetForm = () => {
    setFormData({
      fullName: '', age: '', hn: '', room: '', stayDays: '',
      totalAmount: '', deposit: '', balance: 0, notifyCount: '1',
      paymentType: '', checkDate: new Date().toISOString().split('T')[0],
      recordType: 'หลังทำหัตถการ', note: '',
      recordedBy: '',
      isAcknowledged: false
    });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (record) => {
    setFormData(record);
    setEditingId(record.id);
    setActiveTab('form');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ยืนยันการลบข้อมูลใช่หรือไม่?')) return;
    const { error } = await supabase.from('ipd_records').delete().eq('id', id);
    if (error) {
      toast.error('ลบไม่สำเร็จ: ' + error.message);
    } else {
      setRecords(records.filter(r => r.id !== id));
      toast.success('ลบข้อมูลเรียบร้อย');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      isAcknowledged: false // Always reset on save
    };

    const payload = mapStateToDB(submissionData, session);

    try {
      if (editingId) {
        const { data, error } = await supabase.from('ipd_records').update(payload).eq('id', editingId).select();
        if (error) throw error;
        setRecords(records.map(r => r.id === editingId ? mapDBToState(data[0]) : r));
        setEditingId(null);
      } else {
        const { data, error } = await supabase.from('ipd_records').insert([payload]).select();
        if (error) throw error;
        setRecords([mapDBToState(data[0]), ...records]);
      }
      setActiveTab('list');
      toast.success(editingId ? 'แก้ไขข้อมูลเรียบร้อย' : 'บันทึกข้อมูลใหม่เรียบร้อย');
      handleResetForm();
    } catch (err) {
      toast.error('ไม่สามารถบันทึกได้: ' + err.message);
    }
  };

  const handleCloseHN = (hn) => {
    setTargetCloseHN(hn);
  };

  const executeCloseHN = async () => {
    if (!targetCloseHN) return;
    const hn = targetCloseHN;
    
    try {
      const { data, error } = await supabase
        .from('ipd_records')
        .update({ is_closed: true })
        .eq('hn', hn);
        
      if (error) throw error;
      
      setRecords(records.map(r => r.hn === hn ? { ...r, isClosed: true } : r));
      toast.success('ปิดเคสเรียบร้อย');
      setTargetCloseHN(null);
    } catch (err) {
      toast.error('ปิดเคสไม่สำเร็จ: ' + err.message);
      setTargetCloseHN(null);
    }
  };

  const handleAddRecordForHN = (hn) => {
    const existingRecord = records.find(r => r.hn === hn);
    if (existingRecord) {
      handleResetForm();
      const hnRecordsCount = records.filter(r => r.hn === hn).length;
      setFormData(prev => ({ 
        ...prev, 
        hn: existingRecord.hn, 
        fullName: existingRecord.fullName, 
        age: existingRecord.age,
        room: existingRecord.room || '',
        notifyCount: (hnRecordsCount + 1).toString(),
        recordType: 'แจ้งยอดทุก 3 วัน'
      }));
      setActiveTab('form');
    }
  };

  return (
    <>
      <div className="flex justify-center mb-8">
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
          <button 
            onClick={() => {
              handleResetForm();
              setActiveTab('form');
            }}
            className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${
              activeTab === 'form' 
                ? 'bg-white text-indigo-600 shadow-md' 
                : 'text-slate-500 hover:text-indigo-600'
            }`}
          >
            ฟอร์มบันทึก
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${
              activeTab === 'list' 
                ? 'bg-white text-indigo-600 shadow-md' 
                : 'text-slate-500 hover:text-indigo-600'
            }`}
          >
            รายการคนไข้
          </button>
        </div>
      </div>

      {activeTab === 'form' ? (
        <PatientForm
          user={session?.user}
          formData={formData}
          records={records}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          editingId={editingId}
          handleCancelEdit={handleResetForm}
          handleResetForm={handleResetForm}
        />
      ) : (
        <RecordList 
          records={records} 
          dueRecords={dueRecords}
          userRole={userRole}
          onOpenDetail={(record) => {
            setSelectedDueRecord(record);
            setShowDueDetailModal(true);
          }}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleAdd={handleAddRecordForHN}
          handleCloseHN={handleCloseHN}
        />
      )}

      {targetCloseHN && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setTargetCloseHN(null)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[40px] shadow-2xl p-10 animate-slide-up border border-slate-100 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <CheckCircle className="text-red-500" size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">ยืนยันการปิดเคส?</h3>
            <p className="text-sm font-bold text-slate-500">
              คุณต้องการปิดเคสของ HN: <span className="text-indigo-600">{targetCloseHN}</span> ใช่หรือไม่?<br/>
              <span className="text-xs text-slate-400 font-normal mt-2 block">หากปิดเคสแล้ว ผู้ใช้อื่นจะมองไม่เห็นรายการนี้อีก</span>
            </p>
            <div className="flex flex-col gap-3 mt-8">
              <button onClick={executeCloseHN} className="w-full py-4 bg-red-500 text-white font-black rounded-2xl shadow-xl hover:bg-red-600 transition-all uppercase text-sm">ยืนยันการปิดเคส</button>
              <button onClick={() => setTargetCloseHN(null)} className="w-full py-4 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
