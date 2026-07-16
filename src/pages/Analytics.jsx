import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { 
  TrendingUp, Users, Banknote, Clock, 
  PieChart as PieIcon, BarChart3, Activity, Download, X
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Analytics = ({ records: allRecords }) => {
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
  const [exportFilters, setExportFilters] = React.useState({
    dateRange: 'all',
    caseStatus: 'all',
    recordType: 'all',
    balanceThreshold: 'all',
  });

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

  // Group records by HN and combine their notes chronologically
  const getGroupedRecordsForExport = React.useCallback((recordList) => {
    const groups = {};
    recordList.forEach(r => {
      if (!groups[r.hn]) {
        groups[r.hn] = [];
      }
      groups[r.hn].push(r);
    });

    const groupedList = [];
    Object.keys(groups).forEach(hn => {
      const patientRecords = groups[hn];
      
      // Concatenate all unique non-empty notes from all records of this patient
      const noteParts = [];
      const allPatientRecords = (allRecords || []).filter(p => p.hn === hn);
      // Sort chronologically ascending to merge notes in order of time
      allPatientRecords.sort((a, b) => new Date(a.checkDate) - new Date(b.checkDate));
      
      allPatientRecords.forEach(r => {
        if (r.note && r.note.trim()) {
          const trimmed = r.note.trim();
          if (!noteParts.includes(trimmed)) {
            noteParts.push(trimmed);
          }
        }
      });
      const mergedNotes = noteParts.join(' | ');

      // Find the latest record with a non-zero deposit to get the latest deposit date
      const recordWithDeposit = [...allPatientRecords].reverse().find(r => (parseFloat(r.deposit) || 0) > 0);
      const latestDepositDate = recordWithDeposit ? recordWithDeposit.checkDate : '';

      // Sort chronologically descending to get the latest record as primary representation
      patientRecords.sort((a, b) => new Date(b.checkDate) - new Date(a.checkDate));
      const latestRecord = { ...patientRecords[0] };
      latestRecord.note = mergedNotes;
      latestRecord.latestDepositDate = latestDepositDate;
      groupedList.push(latestRecord);
    });

    // Sort by checkDate descending for standard display
    groupedList.sort((a, b) => new Date(b.checkDate) - new Date(a.checkDate));
    return groupedList;
  }, [allRecords]);

  // Calculate matching export record count dynamically
  const previewCount = useMemo(() => {
    let filtered = [...allRecords];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (exportFilters.recordType !== 'all') {
      filtered = filtered.filter(r => r.recordType === exportFilters.recordType);
    }

    if (exportFilters.dateRange === 'today') {
      filtered = filtered.filter(r => {
        const checkDate = new Date(r.checkDate);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate.getTime() === today.getTime();
      });
    } else if (exportFilters.dateRange === '7days') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      filtered = filtered.filter(r => {
        const checkDate = new Date(r.checkDate);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate >= sevenDaysAgo;
      });
    } else if (exportFilters.dateRange === '30days') {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      filtered = filtered.filter(r => {
        const checkDate = new Date(r.checkDate);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate >= thirtyDaysAgo;
      });
    }

    if (exportFilters.caseStatus === 'active') {
      filtered = filtered.filter(r => !r.isClosed);
    } else if (exportFilters.caseStatus === 'closed') {
      filtered = filtered.filter(r => r.isClosed);
    }

    if (exportFilters.balanceThreshold === 'gt100k') {
      filtered = filtered.filter(r => (parseFloat(r.balance) || 0) > 100000);
    } else if (exportFilters.balanceThreshold === 'gt500k') {
      filtered = filtered.filter(r => (parseFloat(r.balance) || 0) > 500000);
    } else if (exportFilters.balanceThreshold === 'lt100k') {
      filtered = filtered.filter(r => (parseFloat(r.balance) || 0) < 100000);
    }

    const grouped = getGroupedRecordsForExport(filtered);
    return grouped.length;
  }, [allRecords, exportFilters, getGroupedRecordsForExport]);

  // Export to CSV Function with date, status and record type filters
  const handleExportCSV = () => {
    let filtered = [...allRecords];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (exportFilters.recordType !== 'all') {
      filtered = filtered.filter(r => r.recordType === exportFilters.recordType);
    }

    if (exportFilters.dateRange === 'today') {
      filtered = filtered.filter(r => {
        const checkDate = new Date(r.checkDate);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate.getTime() === today.getTime();
      });
    } else if (exportFilters.dateRange === '7days') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      filtered = filtered.filter(r => {
        const checkDate = new Date(r.checkDate);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate >= sevenDaysAgo;
      });
    } else if (exportFilters.dateRange === '30days') {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      filtered = filtered.filter(r => {
        const checkDate = new Date(r.checkDate);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate >= thirtyDaysAgo;
      });
    }

    if (exportFilters.caseStatus === 'active') {
      filtered = filtered.filter(r => !r.isClosed);
    } else if (exportFilters.caseStatus === 'closed') {
      filtered = filtered.filter(r => r.isClosed);
    }

    if (exportFilters.balanceThreshold === 'gt100k') {
      filtered = filtered.filter(r => (parseFloat(r.balance) || 0) > 100000);
    } else if (exportFilters.balanceThreshold === 'gt500k') {
      filtered = filtered.filter(r => (parseFloat(r.balance) || 0) > 500000);
    } else if (exportFilters.balanceThreshold === 'lt100k') {
      filtered = filtered.filter(r => (parseFloat(r.balance) || 0) < 100000);
    }

    // Get unique patients and merge notes
    const grouped = getGroupedRecordsForExport(filtered);

    // Define headers matching the print template exactly
    const headers = [
      'ลำดับ', 'ROOM', 'HN', 'ชื่อ-นามสกุล', 'ชำระเอง', 'ประกัน', 
      'วันที่ Admit', 'จำนวนวันนอน', 'ยอดปัจจุบัน', 'วันที่จ่าย Deposit ล่าสุด', 'ยอดDeposit', 'คงเหลือ', 'หมายเหตุ'
    ];

    // Map records to rows
    const csvRows = [
      headers.join(','),
      ...grouped.map((r, index) => {
        const isSelfPay = r.paymentType === 'ชำระเอง';
        const isInsurance = r.paymentType !== 'ชำระเอง';

        // Format dates as dd/mm/yyyy
        const formatDate = (dateStr) => {
          if (!dateStr) return '';
          const d = new Date(dateStr);
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          return `${day}/${month}/${d.getFullYear()}`;
        };

        const row = [
          index + 1,
          r.room || '',
          r.hn || '',
          `"${(r.fullName || '').replace(/"/g, '""')}"`,
          isSelfPay ? '✓' : '',
          isInsurance ? '✓' : '',
          formatDate(r.admitDate),
          r.stayDays || '',
          r.totalAmount || 0,
          formatDate(r.latestDepositDate),
          r.deposit || '',
          r.balance || 0,
          `"${(r.note || '').replace(/"/g, '""')}"`
        ];
        return row.join(',');
      })
    ];

    // Add UTF-8 BOM so Excel opens Thai characters correctly
    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Filename format: IPD_Records_Export_dd-mm-yyyy.csv
    const dateStr = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
    link.setAttribute('href', url);
    link.setAttribute('download', `IPD_Records_Export_${exportFilters.dateRange}_${exportFilters.caseStatus}_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportModalOpen(false);
  };


  const handleOpenExportModal = () => {
    setExportFilters(prev => ({
      ...prev,
      recordType: typeFilter
    }));
    setIsExportModalOpen(true);
  };

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

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-start md:self-center w-full md:w-auto">
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
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

            <button
              onClick={handleOpenExportModal}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
              <Download size={16} />
              <span>ส่งออกข้อมูล</span>
            </button>
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

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[40px] border border-slate-100 max-w-2xl w-full p-8 md:p-10 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Download size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg leading-tight">เงื่อนไขการส่งออกข้อมูล</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Export Filters & Options</p>
                </div>
              </div>
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">ช่วงเวลา (Date Range)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'today', label: 'วันนี้ (Today)' },
                    { id: '7days', label: '7 วันย้อนหลัง' },
                    { id: '30days', label: '30 วันย้อนหลัง' },
                    { id: 'all', label: 'ทั้งหมด (All)' },
                  ].map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setExportFilters(prev => ({ ...prev, dateRange: option.id }))}
                      className={`px-4 py-3 rounded-xl border-2 font-bold text-xs transition-all text-center ${
                        exportFilters.dateRange === option.id
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600'
                          : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Record Type Filter */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">ประเภทการบันทึก (Record Type)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'ทั้งหมด' },
                    { id: 'หลังทำหัตถการ', label: 'หลังทำหัตถการ' },
                    { id: 'แจ้งยอดทุก 3 วัน', label: 'แจ้งยอดทุก 3 วัน' },
                  ].map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setExportFilters(prev => ({ ...prev, recordType: option.id }))}
                      className={`px-3 py-3 rounded-xl border-2 font-bold text-xs transition-all text-center leading-none ${
                        exportFilters.recordType === option.id
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600'
                          : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Case Status Filter */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">สถานะเคส (Case Status)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'ทั้งหมด' },
                    { id: 'active', label: 'ยังไม่ปิดเคส' },
                    { id: 'closed', label: 'ปิดเคสแล้ว' },
                  ].map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setExportFilters(prev => ({ ...prev, caseStatus: option.id }))}
                      className={`px-3 py-3 rounded-xl border-2 font-bold text-xs transition-all text-center ${
                        exportFilters.caseStatus === option.id
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600'
                          : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Balance Threshold Filter */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">ยอดคงเหลือ (Outstanding Balance)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'all', label: 'ทั้งหมด (All)' },
                    { id: 'gt100k', label: 'มากกว่า 100,000 ฿' },
                    { id: 'gt500k', label: 'มากกว่า 500,000 ฿' },
                    { id: 'lt100k', label: 'น้อยกว่า 100,000 ฿' },
                  ].map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setExportFilters(prev => ({ ...prev, balanceThreshold: option.id }))}
                      className={`px-4 py-3 rounded-xl border-2 font-bold text-xs transition-all text-center ${
                        exportFilters.balanceThreshold === option.id
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600'
                          : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">พบข้อมูลที่ตรงเงื่อนไข</span>
                <span className="text-sm font-black text-indigo-600">{previewCount.toLocaleString()} รายการ</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="flex-1 px-5 py-4 border-2 border-slate-100 hover:border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={previewCount === 0}
                  onClick={handleExportCSV}
                  className={`flex-1 px-5 py-4 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 ${
                    previewCount === 0
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 active:scale-95'
                  }`}
                >
                  <Download size={14} />
                  <span>ดาวน์โหลด CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
