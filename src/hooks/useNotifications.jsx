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

    const due = records.filter(r => {
      if (r.recordType !== 'แจ้งยอดทุก 3 วัน') return false;
      const checkDate = new Date(r.checkDate);
      checkDate.setHours(0, 0, 0, 0);
      const diffTime = today - checkDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays % 3 === 0;
    });
    
    setDueRecords(due);
    
    const currentDueIds = due.map(r => r.id);
    const newDueRecords = due.filter(r => !prevDueIds.current.includes(r.id));

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
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ครบกำหนดแจ้งยอด</p>
                <p className="text-sm font-black text-slate-800 truncate">{record.fullName}</p>
                <p className="text-[10px] font-bold text-slate-400 tabular-nums">HN: {record.hn}</p>
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
