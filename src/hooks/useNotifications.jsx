import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import React from 'react';
import { Bell } from 'lucide-react';

export const useNotifications = (records, isMuted, setSelectedDueRecord, setShowDueDetailModal) => {
  const [dueRecords, setDueRecords] = useState([]);
  const prevDueIds = useRef([]);
  const isInitialLoad = useRef(true);

  const playNotificationSound = () => {
    if (isMuted) return;
    
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0.4;
    
    audio.play().catch(() => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const playNote = (freq, startTime, duration, vol) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.type = 'triangle'; 
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.start(startTime);
          osc.stop(startTime + duration);
        };
        playNote(880, audioContext.currentTime, 0.6, 0.1); 
        playNote(1108.73, audioContext.currentTime + 0.1, 0.7, 0.08);
      } catch (e) {
        console.warn('Audio context blocked', e);
      }
    });
  };

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = [];
    
    // Group records by HN
    const groups = {};
    records.forEach(r => {
      if (!groups[r.hn]) {
        groups[r.hn] = [];
      }
      groups[r.hn].push(r);
    });

    Object.keys(groups).forEach(hn => {
      const patientRecords = groups[hn];
      // Sort chronologically (oldest first, latest last)
      patientRecords.sort((a, b) => new Date(a.checkDate) - new Date(b.checkDate));
      
      const latest = patientRecords[patientRecords.length - 1];
      if (!latest || latest.isAcknowledged) return;

      const checkDate = new Date(latest.checkDate);
      checkDate.setHours(0, 0, 0, 0);
      const diffTime = today - checkDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      const isDue3Days = latest.recordType === 'แจ้งยอดทุก 3 วัน' && diffDays > 0 && diffDays % 3 === 0;

      // 500k Threshold Crossing Logic (triggers every 500,000 increment: 500k, 1M, 1.5M, etc.)
      const currentBracket = Math.floor((parseFloat(latest.totalAmount) || 0) / 500000);
      let isDue500k = false;
      let thresholdValue = 0;

      if (currentBracket > 0) {
        // Compare with the previous record of this patient (if any)
        const prev = patientRecords.length > 1 ? patientRecords[patientRecords.length - 2] : null;
        const prevBracket = prev ? Math.floor((parseFloat(prev.totalAmount) || 0) / 500000) : 0;
        
        if (currentBracket > prevBracket) {
          isDue500k = true;
          thresholdValue = currentBracket * 500000;
        }
      }

      if (isDue3Days || isDue500k) {
        due.push({
          ...latest,
          dueType: isDue500k ? 'limit_500k' : 'interval_3days',
          dueMessage: isDue500k 
            ? `ยอดสะสมแตะระดับใหม่ที่ ${thresholdValue.toLocaleString()} บาท` 
            : 'ครบรอบเช็คยอดทุก 3 วัน'
        });
      }
    });

    // Since we grouped by HN and checked the latest record, due already contains at most 1 item per unique HN
    const uniqueDue = due;
    
    setDueRecords(uniqueDue);
    
    const currentDueIds = uniqueDue.map(r => r.id);
    const newDueRecords = uniqueDue.filter(r => !prevDueIds.current.includes(r.id));

    if (newDueRecords.length > 0) {
      playNotificationSound();
      
      if (isInitialLoad.current) {
        toast.success(`พบเคสครบกำหนด ${newDueRecords.length} รายการ`, {
          icon: '🔔',
          duration: 5000,
        });
        isInitialLoad.current = false;
      } else {
        newDueRecords.forEach(record => {
          toast((t) => (
            <div className="flex items-center gap-3 py-1">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <Bell size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${record.dueType === 'limit_500k' ? 'text-amber-500' : 'text-slate-400'}`}>
                  {record.dueType === 'limit_500k' ? '⚠ ยอดสะสมสูง (500k+)' : 'ครบกำหนดแจ้งยอด'}
                </p>
                <p className="text-sm font-black text-slate-800 truncate">{record.fullName}</p>
                <p className="text-[10px] font-bold text-slate-400 tabular-nums">HN: {record.hn} | {Number(record.totalAmount).toLocaleString()} บ.</p>
              </div>
              <button 
                onClick={() => {
                  setSelectedDueRecord(record);
                  setShowDueDetailModal(true);
                  toast.dismiss(t.id);
                }}
                className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 shrink-0"
              >
                ดู
              </button>
            </div>
          ), {
            duration: 6000,
            position: 'top-right',
          });
        });
      }
    }
    
    prevDueIds.current = currentDueIds;
  }, [records, isMuted]);

  return { dueRecords, playNotificationSound };
};
