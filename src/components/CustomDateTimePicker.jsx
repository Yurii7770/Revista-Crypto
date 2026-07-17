import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export default function CustomDateTimePicker({ value, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Initialize selected date
  const parsedDate = value ? new Date(value) : new Date();
  const [tempDate, setTempDate] = useState(isNaN(parsedDate.getTime()) ? new Date() : parsedDate);

  const [month, setMonth] = useState(tempDate.getMonth());
  const [year, setYear] = useState(tempDate.getFullYear());
  const [hours, setHours] = useState(tempDate.getHours());
  const [minutes, setMinutes] = useState(tempDate.getMinutes());

  // Sync state if input value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setTempDate(d);
        setMonth(d.getMonth());
        setYear(d.getFullYear());
        setHours(d.getHours());
        setMinutes(d.getMinutes());
      }
    }
  }, [value]);

  // Click outside listener to close calendar
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => {
    // 0 = Sunday, 1 = Monday, etc. Adjusting to make Monday = 0
    let day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1; 
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleSelectDay = (day) => {
    const newD = new Date(year, month, day, hours, minutes);
    setTempDate(newD);
  };

  const handleApply = () => {
    const finalD = new Date(year, month, tempDate.getDate(), hours, minutes);
    onChange(finalD.toISOString());
    setIsOpen(false);
  };

  const handleNow = () => {
    const now = new Date();
    setTempDate(now);
    setMonth(now.getMonth());
    setYear(now.getFullYear());
    setHours(now.getHours());
    setMinutes(now.getMinutes());
  };

  const formatDisplay = (d) => {
    if (!value) return 'Select Date & Time';
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return 'Select Date & Time';
    return dateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Generate days array
  const cells = [];
  // Offset padding for first day of week
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="h-7 w-7"></div>);
  }
  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const isSelected = tempDate.getDate() === d && tempDate.getMonth() === month && tempDate.getFullYear() === year;
    const isToday = new Date().getDate() === d && new Date().getMonth() === month && new Date().getFullYear() === year;

    cells.push(
      <button
        key={`day-${d}`}
        type="button"
        onClick={() => handleSelectDay(d)}
        className={`h-7 w-7 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center ${
          isSelected 
            ? 'bg-emerald-500 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
            : isToday
              ? 'border border-emerald-500/40 text-emerald-400'
              : 'text-slate-350 hover:bg-slate-800 hover:text-slate-100'
        }`}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-900 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-300 hover:border-slate-650 transition-colors"
      >
        <span className={value ? 'text-slate-200' : 'text-slate-500'}>
          {formatDisplay(tempDate)}
        </span>
        <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 p-3.5 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-[250px] tab-transition-container left-0 top-full">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-3">
            <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-200">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-bold text-slate-200">
              {months[month]} {year}
            </span>
            <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-200">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-[8px] font-extrabold text-slate-500 text-center uppercase tracking-wider mb-1.5">
            <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center justify-items-center mb-3">
            {cells}
          </div>

          {/* Time Picker Controls */}
          <div className="border-t border-slate-800 pt-2.5 mb-3">
            <div className="flex items-center justify-between text-[9px] font-semibold text-slate-400 mb-1.5 uppercase">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-400" /> Set Time</span>
              <span className="text-slate-200 font-mono">{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}</span>
            </div>
            <div className="space-y-2">
              {/* Hour input slider */}
              <div className="flex items-center gap-2">
                <span className="text-[8px] text-slate-500 w-3">H</span>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="flex-1 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
              {/* Minute input slider */}
              <div className="flex items-center gap-2">
                <span className="text-[8px] text-slate-500 w-3">M</span>
                <input
                  type="range"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="flex-1 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleNow}
              className="text-[8px] font-extrabold text-emerald-400 hover:text-emerald-300 uppercase tracking-wider"
            >
              Set Now
            </button>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2 py-1 text-[8px] font-bold border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-2.5 py-1 text-[8px] font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
