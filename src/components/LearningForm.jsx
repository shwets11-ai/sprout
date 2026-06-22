import { useState } from 'react';
import { addActivity, getTodayStr } from '../db/database';

const activityTypes = [
  'Reading', 'Puzzles', 'Colors & Shapes', 'ABCs', 'Counting',
  'Songs & Music', 'Arts & Crafts', 'Outdoor Exploration',
  'Sensory Play', 'Pretend Play',
];

export default function LearningForm({ onSaved }) {
  const [time, setTime] = useState(() => {
    const n = new Date();
    return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
  });
  const [activityType, setActivityType] = useState('');
  const [duration, setDuration] = useState(15);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!time || !activityType) return;
    setSaving(true);
    await addActivity('learning', {
      date: getTodayStr(),
      time,
      activityType,
      duration,
      notes,
    });
    setActivityType('');
    setDuration(15);
    setNotes('');
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
    if (onSaved) onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="bg-green-100 border border-green-300 text-green-700 text-sm font-medium px-4 py-2 rounded-xl text-center">
          ✅ Learning logged!
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Time</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input-field" required />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Activity Type</label>
        <select
          value={activityType}
          onChange={(e) => setActivityType(e.target.value)}
          className="input-field"
          required
        >
          <option value="">Select an activity...</option>
          {activityTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Duration: {duration} min</label>
        <input
          type="range"
          min="5"
          max="60"
          step="5"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full accent-sky-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>5 min</span>
          <span>60 min</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Notes (optional)</label>
        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What did they learn?" className="input-field" />
      </div>

      <button type="submit" disabled={saving || !time || !activityType} className="btn-primary w-full">
        {saving ? 'Saving...' : 'Log Learning 📚'}
      </button>
    </form>
  );
}
