import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { 
  Users, Search, Mail, Calendar, ShieldCheck, UserCircle, 
  RefreshCcw, Ban, KeyRound, ShieldAlert, X, CheckCircle2, Lock, UserCog, Trash2, UserPlus, Fingerprint, Loader2
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusLoading, setStatusLoading] = useState(null);
  
  // Password Change State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [userToChange, setUserToChange] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);

  // Add User State
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'staff'
  });

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    setStatusLoading(user.id);
    const { error } = await supabase
      .from('profiles')
      .update({ is_disabled: !user.is_disabled })
      .eq('id', user.id);

    if (error) {
      toast.error('ล้มเหลว: ' + error.message);
    } else {
      setUsers(users.map(u => u.id === user.id ? { ...u, is_disabled: !u.is_disabled } : u));
      toast.success(user.is_disabled ? 'เปิดใช้งานบัญชีแล้ว' : 'ระงับบัญชีเรียบร้อย');
    }
    setStatusLoading(null);
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'staff' : 'admin';
    setStatusLoading(user.id);
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id);

    if (error) {
       toast.error('ล้มเหลว: ' + error.message);
    } else {
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      toast.success('เปลี่ยนระดับสิทธิ์เป็น ' + newRole + ' แล้ว');
    }
    setStatusLoading(null);
  };

  const handleAdminChangePassword = async (e) => {
    e.preventDefault();
    setChangeLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-change-password', {
        body: { 
          action: 'password',
          user_id: userToChange.id, 
          password: newPassword 
        },
      });
      if (error) throw error;
      toast.success('เปลี่ยนรหัสผ่านให้ ' + userToChange.display_name + ' สำเร็จแล้ว');
      setIsChangingPassword(false);
      setNewPassword('');
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setChangeLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setChangeLoading(true);
    let finalEmail = newUserData.email.trim();
    if (finalEmail && !finalEmail.includes('@')) {
      finalEmail = `${finalEmail}@ram2-hosp.com`;
    }

    try {
      const { error } = await supabase.functions.invoke('admin-change-password', {
        body: { 
          action: 'create',
          email: finalEmail,
          password: newUserData.password,
          display_name: newUserData.displayName,
          role: newUserData.role
        },
      });

      if (error) throw error;
      
      toast.success('สร้างผู้ใช้ใหม่เรียบร้อยแล้ว');
      setIsAddingUser(false);
      setNewUserData({ email: '', password: '', displayName: '', role: 'staff' });
      fetchUsers(); // Refresh list to see new user
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setChangeLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`ลบผู้ใช้ "${user.display_name}"?`)) return;
    setStatusLoading(user.id);
    try {
      const { error } = await supabase.functions.invoke('admin-change-password', {
        body: { action: 'delete', user_id: user.id },
      });
      if (error) throw error;
      setUsers(users.filter(u => u.id !== user.id));
      toast.success('ลบผู้ใช้เรียบร้อยแล้ว');
    } catch (err) {
      toast.error('ล้มเหลว: ' + err.message);
    } finally {
      setStatusLoading(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="animate-fade-in max-w-[1200px] mx-auto pb-20 px-4 text-sans">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-[32px] shadow-xl shadow-slate-200/50 p-8 mb-8 mt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <Users size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 leading-tight">จัดการผู้ใช้งาน</h2>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                 Control access and member roles
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             <button 
              onClick={() => setIsAddingUser(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <UserPlus size={18} />
              เพิ่มสมาชิกใหม่
            </button>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" placeholder="ค้นหาชื่อหรืออีเมล..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all font-bold text-sm"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={fetchUsers} className="w-11 h-11 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 transition-all">
              <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredUsers.map((user) => (
            <div key={user.id} className={`bg-white border p-6 rounded-[28px] shadow-lg transition-all relative overflow-hidden flex flex-col ${user.is_disabled ? 'opacity-70 border-red-50' : 'border-slate-200'}`}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 flex-1">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${user.is_disabled ? 'bg-red-50 text-red-500' : user.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                  {user.is_disabled ? <Ban size={28} /> : user.role === 'admin' ? <ShieldCheck size={28} /> : <UserCircle size={28} />}
                </div>
                <div className="min-w-0 pr-10">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-slate-800 text-lg truncate">{user.display_name || 'Staff User'}</h3>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase ${user.is_disabled ? 'bg-red-500 text-white' : user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-50 text-slate-500'}`}>
                      {user.is_disabled ? 'Banned' : user.role}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 truncate flex items-center gap-1.5"><Mail size={12} /> {user.email}</p>
                </div>
                <button onClick={() => handleDeleteUser(user)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
              </div>

              <div className="mt-8 grid grid-cols-2 xs:grid-cols-3 gap-2">
                <button disabled={statusLoading === user.id} onClick={() => handleToggleRole(user)} className="py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 bg-slate-50 border border-slate-100 text-slate-400 hover:text-indigo-600 transition-all"><UserCog size={14} /> Role: {user.role}</button>
                <button onClick={() => { setUserToChange(user); setIsChangingPassword(true); }} className="py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all"><Lock size={14} /> Password</button>
                <button disabled={statusLoading === user.id} onClick={() => handleToggleStatus(user)} className={`py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all text-white ${user.is_disabled ? 'bg-green-600' : 'bg-red-500'}`}>{user.is_disabled ? <CheckCircle2 size={14} /> : <Ban size={14} />}{user.is_disabled ? 'เปิดใช้งาน' : 'ระงับบัญชี'}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}
      {/* Password Change Modal - REDESIGNED */}
      {isChangingPassword && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsChangingPassword(false)}></div>
              <div className="relative bg-white w-full max-w-sm rounded-[40px] shadow-2xl p-10 animate-slide-up border border-slate-100">
                  <div className="text-center mb-10">
                      <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100/20">
                          <KeyRound size={28} />
                      </div>
                      <h3 className="text-xl font-black text-slate-800">เปลี่ยนรหัสผ่านใหม่</h3>
                      <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-[0.2em] tabular-nums">
                        Account: {userToChange?.display_name || 'Administrator'}
                      </p>
                  </div>
                  <form onSubmit={handleAdminChangePassword} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                        <input 
                            type="password" required placeholder="ขั้นต่ำ 6 ตัวอักษร" autoFocus
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-inner"
                            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-4 pt-4">
                          <button 
                            type="button" 
                            onClick={() => setIsChangingPassword(false)} 
                            className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-red-500 transition-colors"
                          >
                            ยกเลิก
                          </button>
                          <button 
                            type="submit" 
                            disabled={changeLoading} 
                            className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                          >
                            {changeLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                            ยืนยันการเปลี่ยน
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {isAddingUser && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddingUser(false)}></div>
              <div className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8 border border-slate-100 animate-slide-up">
                  <div className="text-center mb-8">
                       <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-100"><UserPlus size={24} /></div>
                       <h3 className="text-xl font-black text-slate-800">เพิ่มสมาชิกใหม่</h3>
                       <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Account registration by admin</p>
                  </div>
                  <form onSubmit={handleAddUser} className="space-y-4">
                      <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label><input type="text" required placeholder="ชื่อ-นามสกุล" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" value={newUserData.displayName} onChange={(e) => setNewUserData({...newUserData, displayName: e.target.value})} /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username / Email</label><input type="text" required placeholder="เช่น john (ไม่ต้องใส่ @...)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" value={newUserData.email} onChange={(e) => setNewUserData({...newUserData, email: e.target.value})} /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label><input type="password" required placeholder="รหัสผ่านเริ่มต้น" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" value={newUserData.password} onChange={(e) => setNewUserData({...newUserData, password: e.target.value})} /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Role</label><select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm appearance-none" value={newUserData.role} onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}><option value="staff">Staff (มาตรฐาน)</option><option value="admin">Administrator (แอดมิน)</option></select></div>
                      <div className="flex gap-3 pt-6"><button type="button" onClick={() => setIsAddingUser(false)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase">ยกเลิก</button><button type="submit" disabled={changeLoading} className="flex-2 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 text-xs uppercase flex items-center justify-center gap-2">{changeLoading ? <RefreshCcw size={18} className="animate-spin" /> : <ShieldCheck size={18} />}สร้างบัญชีผู้ใช้</button></div>
                  </form>
              </div>
          </div>
      )}
    </section>
  );
};

export default UserManagement;
