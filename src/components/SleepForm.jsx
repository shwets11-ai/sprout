import { useState, useMemo } from 'react';
import { addActivity, getTodayStr } from '../db/database';

export default function SleepForm({ onSaved }) {
  const [type, setType] = useState('nap');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [quality, setQuality] = useState(0);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const duration = useMemo(() => {
    if (!startTime || !endTime) return null;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    let startMin = sh * 60 + sm;
    let endMin = eh * 60 + em;
    if (endMin < startMin) endMin += 24 * 60;
    const diff = endMin - startMin;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}h ${m}m`;
  }, [startTime, endTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startTime || !endTime) return;
    setSaving(true);
    await addActivity('sleep', {
      date: getTodayStr(),
      startTime,
      endTime,
      type,
      quality,
    });
    setStartTime('');
    setEndTime('');
    setQuality(0);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
    if (onSaved) onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="bg-green-100 border border-green-300 text-green-700 text-sm font-medium px-4 py-2 rounded-xl text-center">
          ✅ Sleep logged!
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType('nap')}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
            type === 'nap'
              ? 'bg-purple-400 text-white'
              : 'bg-purple-50 text-purple-600 border border-purple-200'
          }`}
        >
          😴 Nap
        </button>
        <button
          type="button"
          onClick={() => setType('night')}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
            type === 'night'
              ? 'bg-purple-700 text-white'
              : 'bg-purple-50 text-purple-600 border border-purple-200'
          }`}
        >
          🌙 Night Sleep
        </button>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Start</label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input-field" required />
        </div>
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">End</label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="input-field" required />
        </div>
      </div>

      {duration && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-center">
          <span className="text-sm font-semibold text-purple-700">Duration: {duration}</span>
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Quality</label>
        <div className="flex gap-3 justify-center">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setQuality(n)}
              className={`text-3xl transition-all ${n <= quality ? 'scale-110' : 'opacity-30 grayscale'}`}
              aria-label={`Quality ${n}`}
            >
              {n <= 2 ? '😴' : n === 3 ? '🙂' : '😊'}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" disabled={saving || !startTime || !endTime} className="btn-primary w-full">
        {saving ? 'Saving...' : 'Log Sleep 😴'}
      </button>
    </form>
  );
}
