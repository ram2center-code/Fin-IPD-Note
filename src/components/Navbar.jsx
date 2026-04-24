import React from 'react';
import { ClipboardList, ListTodo, LogOut, User as UserIcon, Users } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, user, userRole, onLogout }) => {
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <nav className="sticky top-0 z-[1000] bg-white/80 backdrop-blur-xl border-b border-slate-200 py-3">
      <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center">
        {/* Logo Section */}
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
              activeTab === 'form' 
                ? 'bg-white text-indigo-600 shadow-sm shadow-slate-200' 
                : 'text-slate-500 hover:text-indigo-600'
            }`}
            onClick={() => setActiveTab('form')}
          >
            <ClipboardList size={18} />
            <span className="hidden xs:block">ฟอร์ม</span>
          </button>
          
          <button 
            className={`flex items-center gap-2 px-3 md:px-5 py-2 rounded-lg font-bold text-xs md:text-sm transition-all duration-300 ${
              activeTab === 'list' 
                ? 'bg-white text-indigo-600 shadow-sm shadow-slate-200' 
                : 'text-slate-500 hover:text-indigo-600'
            }`}
            onClick={() => setActiveTab('list')}
          >
            <ListTodo size={18} />
            <span className="hidden xs:block">รายการ</span>
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
          <div className="group relative">
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
