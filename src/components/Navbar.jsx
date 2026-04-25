import { ClipboardList, ListTodo, LogOut, User as UserIcon, Users, Bell, Volume2, VolumeX } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, user, userRole, dueCount, onLogout, isMuted, setIsMuted, onOpenNotifications }) => {
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <nav className="sticky top-0 z-[1000] bg-white/80 backdrop-blur-xl border-b border-slate-200 py-3">
      <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center">
        {/* Logo Section ... (remains unchanged) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-200 text-white flex items-center justify-center text-xl font-black italic shrink-0">
            F
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-extrabold text-slate-800 leading-tight">Fin IPD Note</h1>
            <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Clinical Dashboard</p>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/50 scale-95 md:scale-100">
          <button 
            className={`flex items-center gap-2 px-3 md:px-5 py-2 rounded-lg font-bold text-xs md:text-sm transition-all duration-300 ${
              activeTab === 'dashboard' 
                ? 'bg-white text-indigo-600 shadow-sm shadow-slate-200' 
                : 'text-slate-500 hover:text-indigo-600'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            <ClipboardList size={18} />
            <span className="hidden xs:block">หน้าหลัก (Dashboard)</span>
          </button>

          {userRole === 'admin' && (
            <button 
              className={`flex items-center gap-2 px-3 md:px-5 py-2 rounded-lg font-bold text-xs md:text-sm transition-all duration-300 ${
                activeTab === 'users' 
                  ? 'bg-white text-indigo-600 shadow-sm shadow-slate-200' 
                  : 'text-slate-500 hover:text-indigo-600'
              }`}
              onClick={() => setActiveTab('users')}
            >
              <Users size={18} />
              <span className="hidden lg:block">จัดการผู้ใช้</span>
            </button>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-100 ml-1">
          <div className="hidden lg:block text-right mr-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated as</p>
            <p className="text-xs font-extrabold text-slate-700 leading-none">{displayName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onOpenNotifications}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all relative ${
                dueCount > 0 ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'
              }`}
              title="การแจ้งเตือน"
            >
              <Bell size={20} className={dueCount > 0 ? 'animate-bounce' : ''} />
              {dueCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
              )}
            </button>
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                isMuted ? 'text-slate-300 hover:text-slate-500 hover:bg-slate-50' : 'text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
              title={isMuted ? "เปิดเสียง" : "ปิดเสียง"}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button 
              onClick={onLogout}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="ออกจากระบบ"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
