import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Login from './components/Login'
import UserManagement from './components/UserManagement'
import DueDetailModal from './components/DueDetailModal'
import NotificationModal from './components/NotificationModal'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import RecordList from './components/RecordList'
import { supabase } from './supabaseClient'
import { mapDBToState } from './utils/formatters'
import { useNotifications } from './hooks/useNotifications'
import { Toaster, toast } from 'react-hot-toast'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [userRole, setUserRole] = useState('staff')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [records, setRecords] = useState([])
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showDueDetailModal, setShowDueDetailModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [selectedDueRecord, setSelectedDueRecord] = useState(null)
  
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('fin_note_muted');
    return saved === 'true';
  })

  // Hook for Notifications
  const { dueRecords } = useNotifications(records, isMuted, setSelectedDueRecord, setShowDueDetailModal);

  useEffect(() => {
    localStorage.setItem('fin_note_muted', isMuted);
  }, [isMuted]);

  // Auth & Session Management
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchUserRole(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchUserRole(session.user.id)
      else setUserRole('staff')
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserRole = async (userId) => {
    const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single()
    if (!error && data) setUserRole(data.role)
  }

  // Fetch initial records
  useEffect(() => {
    if (!session) {
      setRecords([])
      return
    }

    const fetchRecords = async () => {
      const { data, error } = await supabase.from('ipd_records').select('*').order('check_date', { ascending: false })
      if (!error) {
        setRecords((data || []).map(r => mapDBToState(r)))
      }
    }

    fetchRecords()
  }, [session])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setShowLogoutModal(false)
    setActiveTab('dashboard')
  }

  const handleAcknowledge = async (recordId) => {
    const { data, error } = await supabase
      .from('ipd_records')
      .update({ is_acknowledged: true })
      .eq('id', recordId)
      .select();

    if (!error && data) {
      setRecords(records.map(r => r.id === recordId ? mapDBToState(data[0]) : r));
    }
  }

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

  if (!session) return <Login onSession={setSession} />

  return (
    <div className="layout-container">
      <Toaster position="top-center" reverseOrder={false} />
      
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={session?.user} 
        userRole={userRole}
        dueCount={dueRecords.length}
        pendingCasesCount={new Set(records.filter(r => !r.isClosed).map(r => r.hn)).size}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onOpenNotifications={() => setShowNotificationModal(true)}
        onLogout={() => setShowLogoutModal(true)} 
      />

      <main className="main-content">
        {activeTab === 'dashboard' ? (
          <Dashboard 
            records={records}
            setRecords={setRecords}
            dueRecords={dueRecords}
            setSelectedDueRecord={setSelectedDueRecord}
            setShowDueDetailModal={setShowDueDetailModal}
            session={session}
            userRole={userRole}
          />
        ) : activeTab === 'analytics' ? (
          <Analytics records={records} />
        ) : activeTab === 'all_records' && (userRole === 'admin' || userRole === 'head_finance') ? (
          <div className="pt-8">
            <RecordList 
              records={records} 
              dueRecords={dueRecords}
              userRole={userRole}
              showClosedCases={true}
              onOpenDetail={(record) => {
                setSelectedDueRecord(record);
                setShowDueDetailModal(true);
              }}
              handleDelete={handleDelete}
            />
          </div>
        ) : activeTab === 'users' && userRole === 'admin' ? (
          <UserManagement />
        ) : null}
      </main>

      {/* Modals */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowLogoutModal(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[40px] shadow-2xl p-10 animate-slide-up border border-slate-100 text-center">
            <h3 className="text-2xl font-black text-slate-800 mb-2">ออกจากระบบ?</h3>
            <div className="flex flex-col gap-3 mt-8">
              <button onClick={handleLogout} className="w-full py-4 bg-red-500 text-white font-black rounded-2xl shadow-xl hover:bg-red-600 transition-all uppercase text-sm">ยืนยัน</button>
              <button onClick={() => setShowLogoutModal(false)} className="w-full py-4 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      <DueDetailModal 
        isOpen={showDueDetailModal}
        onClose={() => setShowDueDetailModal(false)}
        record={selectedDueRecord}
        onViewFullList={() => { setShowDueDetailModal(false); setActiveTab('dashboard'); }}
      />

      <NotificationModal 
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        dueRecords={dueRecords}
        onSelectRecord={(record) => {
          setShowNotificationModal(false);
          setSelectedDueRecord(record);
          setShowDueDetailModal(true);
        }}
        onAcknowledge={handleAcknowledge}
      />

      <footer className="footer no-print text-center py-10 opacity-50 text-xs">
        <p>&copy; 2026 Fin IPD Note - ระบบจัดเก็บข้อมูลโน้ตผู้ป่วย</p>
      </footer>
    </div>
  )
}

export default App
