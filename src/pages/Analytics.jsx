import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { 
  TrendingUp, Users, Banknote, Clock, 
  PieChart as PieIcon, BarChart3, Activity
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Analytics = ({ records: allRecords }) => {
  const [typeFilter, setTypeFilter] = React.useState('all');

  // Filter records based on selection
  const records = useMemo(() => {
    if (typeFilter === 'all') return allRecords;
    return allRecords.filter(r => r.recordType === typeFilter);
  }, [allRecords, typeFilter]);

  // Group records by HN to find the latest record for each active patient
  const activeRecords = useMemo(() => {
    const groups = {};
    records.forEach(r => {
      if (!groups[r.hn]) {
        groups[r.hn] = [];
      }
      groups[r.hn].push(r);
    });

    const latestActive = [];
    Object.keys(groups).forEach(hn => {
      const patientRecords = groups[hn];
      // Sort to get the latest record (most recent checkDate)
      patientRecords.sort((a, b) => new Date(b.checkDate) - new Date(a.checkDate));
      
      const latest = patientRecords[0];
      if (latest && !latest.isClosed) {
        latestActive.push(latest);
      }
    });

    return latestActive;
  }, [records]);

  // 1. Calculate Metrics
  const metrics = useMemo(() => {
    const totalBalance = activeRecords.reduce((sum, r) => sum + (parseFloat(r.balance) || 0), 0);
    const totalDeposit = activeRecords.reduce((sum, r) => sum + (parseFloat(r.deposit) || 0), 0);
    const pendingCasesCount = activeRecords.length;
    const postOpCases = activeRecords.filter(r => r.recordType === 'หลังทำหัตถการ').length;
    const dueCases = activeRecords.filter(r => {
        if (r.recordType !== 'แจ้งยอดทุก 3 วัน') return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(r.checkDate);
        checkDate.setHours(0, 0, 0, 0);
        const diffTime = today - checkDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays % 3 === 0;
    }).length;
    const avgBalance = pendingCasesCount > 0 ? totalBalance / pendingCasesCount : 0;

    return { totalBalance, totalDeposit, avgBalance, pendingCasesCount, postOpCases, dueCases };
  }, [activeRecords]);

  // 2. Data for Bar Chart: Daily Cases (Last 7 Days)
  const dailyData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const count = activeRecords.filter(r => r.checkDate === date).length;
      const dayLabel = new Date(date).toLocaleDateString('th-TH', { weekday: 'short' });
      return { name: dayLabel, date, count };
    });
  }, [activeRecords]);

  // 3. Data for Pie Chart: Payment Types
  const paymentData = useMemo(() => {
    const counts = {};
    activeRecords.forEach(r => {
      const type = r.paymentType || 'อื่นๆ';
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [activeRecords]);

  // 4. Data for Area Chart: Balance Trend
  const trendData = useMemo(() => {
    const sortedRecords = [...activeRecords].sort((a, b) => new Date(a.checkDate) - new Date(b.checkDate));
    const dates = [...new Set(sortedRecords.map(r => r.checkDate))].slice(-10); // Last 10 unique dates
    
    return dates.map(date => {
      const dayBalance = activeRecords
        .filter(r => r.checkDate === date)
        .reduce((sum, r) => sum + (parseFloat(r.balance) || 0), 0);
      return { 
        name: new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
        balance: dayBalance 
      };
    });
  }, [activeRecords]);

  return (
    <div className="animate-fade-in space-y-8 pb-20 max-w-[1200px] mx-auto px-4">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <Activity size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">สรุปสถิติและวิเคราะห์ข้อมูล</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time data insights & financial overview</p>
            </div>
          </div>

          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50 self-start md:self-center">
            {['all', 'หลังทำหัตถการ', 'แจ้งยอดทุก 3 วัน'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  typeFilter === type 
                    ? 'bg-white text-indigo-600 shadow-md' 
                    : 'text-slate-500 hover:text-indigo-600'
                }`}
              >
                {type === 'all' ? 'ทั้งหมด' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'ยอดคงเหลือรวม', value: metrics.totalBalance.toLocaleString(), icon: <Banknote />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'ยอดรวมมัดจำ (Deposit)', value: metrics.totalDeposit.toLocaleString(), icon: <Banknote />, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'จำนวนเคสที่ค้าง', value: metrics.pendingCasesCount, icon: <Users />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'ครบกำหนดแจ้ง (DUE)', value: metrics.dueCases, icon: <Clock />, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((item, i) => (
          <div key={i} className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-lg hover:shadow-xl transition-all group">
            <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              {React.cloneElement(item.icon, { size: 24 })}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{item.label}</p>
            <h4 className="text-2xl font-black text-slate-800 tabular-nums">{item.value}</h4>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Daily Cases Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-lg font-black text-slate-800">จำนวนเคสย้อนหลัง 7 วัน</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Type Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <PieIcon size={20} />
            </div>
            <h3 className="text-lg font-black text-slate-800">สัดส่วนสิทธิ์การรักษา</h3>
          </div>
          <div className="h-[300px] w-full flex flex-col md:flex-row items-center">
            <div className="flex-1 h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-48 space-y-2 mt-4 md:mt-0">
              {paymentData.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                  <span className="text-xs font-bold text-slate-600 truncate flex-1">{item.name}</span>
                  <span className="text-xs font-black text-slate-400 tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Balance Trend Area Chart */}
        <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-xl shadow-slate-200/50 lg:col-span-2">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-lg font-black text-slate-800">แนวโน้มยอดเงินคงเหลือรายวัน</h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <Tooltip />
                <Area type="monotone" dataKey="balance" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
