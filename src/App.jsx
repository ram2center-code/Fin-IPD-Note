import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import PatientForm from './components/PatientForm'
import RecordList from './components/RecordList'
import HistoryModal from './components/HistoryModal'
import Login from './components/Login'
import UserManagement from './components/UserManagement'
import { supabase } from './supabaseClient'
import { LogOut } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [userRole, setUserRole] = useState('staff')
  const [activeTab, setActiveTab] = useState('form')
  const [records, setRecords] = useState([])
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  
  // Fetch records from Supabase on login
  useEffect(() => {
    if (!session) {
      setRecords([])
      return
    }

    const fetchRecords = async () => {
      const { data, error } = await supabase
        .from('ipd_records')
        .select('*')
        .order('check_date', { ascending: false })
      
      if (error) {
        console.error('Error fetching records:', error)
      } else {
        const mappedData = (data || []).map(r => mapDBToState(r))
        setRecords(mappedData)
      }
    }

    fetchRecords()
  }, [session])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchUserRole(session.user.id)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchUserRole(session.user.id)
      else setUserRole('staff')
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserRole = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (!error && data) {
      setUserRole(data.role)
    }
  }

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
    note: ''
  })

  // Auto-calculate balance
  useEffect(() => {
    const total = parseFloat(formData.totalAmount) || 0
    const dep = parseFloat(formData.deposit) || 0
    setFormData(prev => ({
      ...prev,
      balance: total - dep
    }))
  }, [formData.totalAmount, formData.deposit])

  const handleResetForm = () => {
    setFormData({
      fullName: '',
      age: '',
      hn: '',
      room: '',
      stayDays: '',
      totalAmount: '',
      deposit: '',
      balance: 0,
      notifyCount: '',
      paymentType: '-',
      checkDate: new Date().toISOString().split('T')[0],
      recordType: 'หลังทำหัตถการ',
      note: ''
    });
    setEditingId(null);
    setSearchResult(null);
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // HN Autofill logic (Only Name/Age)
    if (name === 'hn' && value.trim().length > 0) {
      const existingRecord = records.find(r => r.hn.toLowerCase() === value.trim().toLowerCase());
      if (existingRecord) {
        setFormData(prev => ({
          ...prev,
          fullName: existingRecord.fullName,
          age: existingRecord.age,
          room: '' // มั่นใจว่าไม่ดึงห้องมา
        }));
      }
    }
  }

  const [searchResult, setSearchResult] = useState(null)

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [matchingRecords, setMatchingRecords] = useState([]);

  const handleCheckHistory = (hnParam) => {
    // If called from event or no param, use current formData.hn
    const hn = (typeof hnParam === 'string' && hnParam.trim()) 
      ? hnParam.trim() 
      : formData.hn.trim();

    if (!hn) return;
    const historicalRecords = records.filter(r => r.hn.toLowerCase() === hn.toLowerCase());
    
    if (historicalRecords.length === 0) {
      setSearchResult('ไม่พบประวัติเดิม');
      setTimeout(() => setSearchResult(null), 3000);
    } else if (historicalRecords.length === 1) {
      // If exactly one match, autofill directly (Only identity info)
      const latest = historicalRecords[0];
      setFormData(prev => ({
        ...prev,
        fullName: latest.fullName,
        age: latest.age,
        room: '', // ไม่เอาห้องเดิมมา
        stayDays: '',
        totalAmount: '',
        deposit: '',
        balance: 0,
        notifyCount: '',
        note: ''
      }));
      setSearchResult('ดึงข้อมูลเดิมสำเร็จ (เว้นข้อมูลห้อง)');
      setTimeout(() => setSearchResult(null), 3000);
    } else {
      // If multiple matches, open the modal
      setMatchingRecords(historicalRecords);
      setShowHistoryModal(true);
    }
  }

  const handleSelectHistory = (record) => {
    setFormData(prev => ({
      ...prev,
      fullName: record.fullName,
      age: record.age,
      room: '', // บังคับล้างห้องเดิม
      stayDays: '',
      totalAmount: '',
      deposit: '',
      balance: 0,
      notifyCount: '',
      note: ''
    }));
    setShowHistoryModal(false);
    setSearchResult('ดึงข้อมูลที่เลือกแล้ว (เว้นข้อมูลห้อง)');
    setTimeout(() => setSearchResult(null), 3000);
  }

  const [editingId, setEditingId] = useState(null)

  const handleEdit = (record) => {
    setFormData(record)
    setEditingId(record.id)
    setActiveTab('form')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData({
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
      note: ''
    })
  }

  const mapDBToState = (r) => ({
    id: r.id,
    hn: r.hn,
    fullName: r.full_name,
    age: r.age,
    room: r.room,
    stayDays: r.stay_days,
    checkDate: r.check_date,
    paymentType: r.payment_type,
    recordType: r.record_type,
    totalAmount: r.total_amount,
    deposit: r.deposit,
    balance: r.balance,
    notifyCount: r.notify_count,
    note: r.note
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const payload = {
      hn: formData.hn,
      full_name: formData.fullName,
      age: formData.age,
      room: formData.room,
      stay_days: formData.stayDays,
      check_date: formData.checkDate,
      payment_type: formData.paymentType,
      record_type: formData.recordType,
      total_amount: parseFloat(formData.totalAmount) || 0,
      deposit: parseFloat(formData.deposit) || 0,
      balance: parseFloat(formData.balance) || 0,
      notify_count: formData.notifyCount,
      note: formData.note
    };

    try {
      if (editingId) {
        // Update existing record in Supabase
        const { data, error } = await supabase
          .from('ipd_records')
          .update(payload)
          .eq('id', editingId)
          .select()
        
        if (error) throw error;
        setRecords(records.map(r => r.id === editingId ? mapDBToState(data[0]) : r))
        setEditingId(null)
      } else {
        // Create new record in Supabase
        const { data, error } = await supabase
          .from('ipd_records')
          .insert([payload])
          .select()
        
        if (error) throw error;
        setRecords([mapDBToState(data[0]), ...records])
      }

      // Switch to list view to show the changes
      setActiveTab('list')
      toast.success(editingId ? 'แก้ไขข้อมูลเรียบร้อย' : 'บันทึกข้อมูลใหม่เรียบร้อย');
      handleResetForm();
    } catch (err) {
      toast.error('ไม่สามารถบันทึกได้: ' + err.message);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setShowLogoutModal(false)
    setActiveTab('form')
  }

  // Show Login page if not authenticated
  if (!session) {
    return <Login onSession={setSession} />
  }

  return (
    <div className="layout-container">
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={session?.user} 
        userRole={userRole}
        onLogout={() => setShowLogoutModal(true)} 
      />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowLogoutModal(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[40px] shadow-2xl p-10 animate-slide-up border border-slate-100 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[30px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-100/50">
              <LogOut size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">ออกจากระบบ?</h3>
            <p className="text-sm font-bold text-slate-400 mb-10 leading-relaxed">
              คุณต้องการออกจากระบบ <br/> คลินิก IPD Note ใช่หรือไม่?
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleLogout}
                className="w-full py-4 bg-red-500 text-white font-black rounded-2xl shadow-xl shadow-red-100 hover:bg-red-600 hover:-translate-y-1 transition-all uppercase tracking-widest text-sm"
              >
                ยืนยันออกจากระบบ
              </button>
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-4 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="main-content">
        {activeTab === 'form' && (
          <PatientForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            handleCheckHistory={handleCheckHistory}
            searchResult={searchResult}
            editingId={editingId}
            handleCancelEdit={handleCancelEdit}
            handleResetForm={handleResetForm}
          />
        )}

        {activeTab === 'list' && (
          <RecordList 
            records={records} 
            handleEdit={handleEdit}
          />
        )}

        {activeTab === 'users' && (
          <UserManagement />
        )}
      </main>

      <HistoryModal 
        isOpen={showHistoryModal}
        historyData={matchingRecords}
        onClose={() => setShowHistoryModal(false)}
        onSelect={handleSelectHistory}
      />

      <footer className="footer no-print">
        <p>&copy; 2026 Fin IPD Note - ระบบจัดเก็บข้อมูลโน้ตผู้ป่วย</p>
      </footer>
    </div>
  )
}

export default App
