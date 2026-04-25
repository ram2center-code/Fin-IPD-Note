import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, User, LogIn, UserPlus, Fingerprint, Loader2, KeyRound, ShieldAlert } from 'lucide-react';

const Login = ({ onSession }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isForceReset, setIsForceReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);
  const [tempSession, setTempSession] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let finalEmail = email.trim();
      if (finalEmail && !finalEmail.includes('@')) {
        finalEmail = `${finalEmail}@ram2-hosp.com`;
      }

      if (isForceReset) {
        // Handle forced password reset
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (updateError) throw updateError;

        // Clear the force reset flag in profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ force_password_reset: false })
          .eq('id', tempSession.user.id);
        
        if (profileError) throw profileError;

        setIsForceReset(false);
        onSession(tempSession);
        alert('เปลี่ยนรหัสผ่านสำเร็จ!');
      } else if (isRegister) {
        // Register Logic
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: finalEmail,
          password,
          options: {
            data: {
              display_name: displayName,
            }
          }
        });
        if (signUpError) throw signUpError;
        alert('สมัครสมาชิกสำเร็จ!');
        setIsRegister(false);
      } else {
        // Login Logic
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: finalEmail,
          password,
        });
        if (signInError) throw signInError;
        
        // CHECK PROFILE STATUS
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) throw profileError;

        if (profile.is_disabled) {
          await supabase.auth.signOut();
          throw new Error('บัญชีของคุณถูกระงับการใช้งาน โปรดติดต่อผู้ดูแลระบบ');
        }

        if (profile.force_password_reset) {
          setIsForceReset(true);
          setTempSession(data.session);
          setLoading(false);
          return;
        }

        onSession(data.session);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/50 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-200/50 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      
      <div className="w-full max-w-md px-6 z-10 animate-fade-in">
        <div className="bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[35px] shadow-2xl shadow-indigo-100/50 p-10 relative">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl shadow-xl shadow-indigo-200 text-white flex items-center justify-center text-3xl font-black italic mx-auto mb-6">
              F
            </div>
            <h2 className="text-3xl font-black text-slate-800 leading-tight">
              {isForceReset ? 'ตั้งรหัสผ่านใหม่' : isRegister ? 'สร้างบัญชีใหม่' : 'ยินดีต้อนรับ'}
            </h2>
            <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">
              Fin IPD Note Management
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-600 text-xs font-bold animate-shake">
              {error}
            </div>
          )}

          {isForceReset && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="text-amber-500 shrink-0" size={20} />
              <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
                แอดมินต้องการให้คุณเปลี่ยนรหัสผ่านเพื่อความปลอดภัย โปรดตั้งรหัสผ่านใหม่ที่จำได้แม่นยำ
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isForceReset ? (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    required
                    placeholder="รหัสผ่านใหม่"
                    className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white outline-none transition-all font-semibold text-slate-700"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <>
                {isRegister && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        required
                        placeholder="ชื่อที่ต้องการให้แสดง"
                        className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white outline-none transition-all font-semibold text-slate-700"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username / Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      required
                      placeholder="ใส่เฉพาะชื่อ หรือ Email"
                      className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white outline-none transition-all font-semibold text-slate-700"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white outline-none transition-all font-semibold text-slate-700"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isForceReset ? <KeyRound size={20} /> : isRegister ? <Fingerprint size={20} /> : <LogIn size={20} />}
                  {isForceReset ? 'ยืนยันรหัสผ่านใหม่' : isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
                </>
              )}
            </button>
          </form>

          {!isForceReset && (
            <div className="mt-10 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs font-bold text-slate-400">
                {isRegister ? 'เป็นสมาชิกอยู่แล้ว?' : 'ยังไม่เคยมีบัญชี?'}{' '}
                <button 
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors ml-1 uppercase"
                >
                  {isRegister ? 'เข้าสู่ระบบ' : 'สมัครสมาชิกที่นี่'}
                </button>
              </p>
            </div>
          )}
        </div>
        
        <p className="text-center mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">
          &copy; 2026 Admin Portal Security Powered by Supabase
        </p>
      </div>
    </div>
  );
};

export default Login;
