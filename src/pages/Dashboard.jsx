import React, { useState, useEffect } from 'react';
import PatientForm from '../components/PatientForm';
import RecordList from '../components/RecordList';
import HistoryModal from '../components/HistoryModal';
import { supabase } from '../supabaseClient';
import { mapDBToState, mapStateToDB } from '../utils/formatters';
import toast from 'react-hot-toast';

const Dashboard = ({ records, setRecords, dueRecords, setSelectedDueRecord, setShowDueDetailModal, session }) => {
  const [activeTab, setActiveTab] = useState('form');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [matchingRecords, setMatchingRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
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
    paymentType: '-',
    recordType: 'หลังทำหัตถการ',
    note: '',
    recordedBy: session?.user?.user_metadata?.display_name || session?.user?.email?.split('@')[0] || 'User'
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
      totalAmount: '', deposit: '', balance: 0, notifyCount: '',
      paymentType: '-', checkDate: new Date().toISOString().split('T')[0],
      recordType: 'หลังทำหัตถการ', note: '',
      recordedBy: session?.user?.user_metadata?.display_name || session?.user?.email?.split('@')[0] || 'User'
    });
    setEditingId(null);
    setSearchResult(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'hn') {
      const hnValue = value.trim().toLowerCase();
      if (hnValue.length > 0) {
        const existingRecord = records.find(r => r.hn.toLowerCase() === hnValue);
        if (existingRecord) {
          setFormData(prev => ({ ...prev, fullName: existingRecord.fullName, age: existingRecord.age, room: '' }));
        } else {
          setFormData(prev => ({ ...prev, fullName: '', age: '', room: '' }));
        }
      } else {
        setFormData(prev => ({ ...prev, fullName: '', age: '', room: '' }));
      }
    }
  };

  const handleCheckHistory = async (hn) => {
    if (!hn) return;
    const historicalRecords = records.filter(r => r.hn.toLowerCase() === hn.toLowerCase());
    
    if (historicalRecords.length === 0) {
      setSearchResult('ไม่พบประวัติการรักษาเดิม');
      setTimeout(() => setSearchResult(null), 3000);
    } else if (historicalRecords.length === 1) {
      const latest = historicalRecords[0];
      setFormData(prev => ({
        ...prev, fullName: latest.fullName, age: latest.age, room: '', 
        stayDays: '', totalAmount: '', deposit: '', balance: 0, 
        notifyCount: '', note: ''
      }));
      setSearchResult('ดึงข้อมูลเดิมสำเร็จ');
      setTimeout(() => setSearchResult(null), 3000);
    } else {
      setMatchingRecords(historicalRecords);
      setShowHistoryModal(true);
    }
  };

  const handleSelectHistory = (record) => {
    setFormData(prev => ({
      ...prev, fullName: record.fullName, age: record.age, room: '', 
      stayDays: '', totalAmount: '', deposit: '', balance: 0, 
      notifyCount: '', note: ''
    }));
    setShowHistoryModal(false);
    setSearchResult('ดึงข้อมูลที่เลือกแล้ว');
    setTimeout(() => setSearchResult(null), 3000);
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
    const payload = mapStateToDB(formData, session);

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

  return (
    <>
      <div className="flex justify-center mb-8">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
          <button 
            onClick={() => setActiveTab('form')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'form' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
          >
            ฟอร์มบันทึก
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
          >
            รายการทั้งหมด
          </button>
        </div>
      </div>

      {activeTab === 'form' ? (
        <PatientForm
          user={session?.user}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          handleCheckHistory={handleCheckHistory}
          searchResult={searchResult}
          editingId={editingId}
          handleCancelEdit={handleResetForm}
          handleResetForm={handleResetForm}
        />
      ) : (
        <RecordList 
          records={records} 
          dueRecords={dueRecords}
          onOpenDetail={(record) => {
            setSelectedDueRecord(record);
            setShowDueDetailModal(true);
          }}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      )}

      <HistoryModal 
        isOpen={showHistoryModal}
        historyData={matchingRecords}
        onClose={() => setShowHistoryModal(false)}
        onSelect={handleSelectHistory}
      />
    </>
  );
};

export default Dashboard;
