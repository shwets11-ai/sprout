import { useState } from 'react';
import { addActivity, getTodayStr } from '../db/database';

const commonFoods = [
  'Oatmeal', 'Banana', 'Eggs', 'Toast', 'Yogurt', 'Rice',
  'Chicken', 'Pasta', 'Broccoli', 'Berries', 'Cheese', 'Apple',
];

const mealPresets = [
  { label: 'Breakfast', time: '08:00' },
  { label: 'Lunch', time: '12:00' },
  { label: 'Dinner', time: '17:00' },
  { label: 'Snack', time: '15:00' },
];

export default function MealForm({ onSaved, toddlerId }) {
  const [time, setTime] = useState('');
  const [foodItems, setFoodItems] = useState([]);
  const [customFood, setCustomFood] = useState('');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleFood = (food) => {
    setFoodItems((prev) =>
      prev.includes(food) ? prev.filter((f) => f !== food) : [...prev, food]
    );
  };

  const addCustomFood = () => {
    const trimmed = customFood.trim();
    if (trimmed && !foodItems.includes(trimmed)) {
      setFoodItems((prev) => [...prev, trimmed]);
      setCustomFood('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!time || foodItems.length === 0) return;
    setSaving(true);
    await addActivity('meals', {
      date: getTodayStr(),
      time,
      foodItems: foodItems.join(', '),
      rating,
      notes,
    }, toddlerId);
    setFoodItems([]);
    setCustomFood('');
    setRating(0);
    setNotes('');
    setTime('');
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
    if (onSaved) onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="bg-green-100 border border-green-300 text-green-700 text-sm font-medium px-4 py-2 rounded-xl text-center">
          ✅ Meal logged!
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Meal Time</label>
        <div className="flex flex-wrap gap-2">
          {mealPresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setTime(preset.time)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                time === preset.time
                  ? 'bg-orange-400 text-white'
                  : 'bg-orange-50 text-orange-600 border border-orange-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="input-field mt-2 text-sm"
          required
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">What did they eat?</label>
        <div className="flex flex-wrap gap-2">
          {commonFoods.map((food) => (
            <button
              key={food}
              type="button"
              onClick={() => toggleFood(food)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                foodItems.includes(food)
                  ? 'bg-orange-400 text-white'
                  : 'bg-orange-50 text-orange-600 border border-orange-200'
              }`}
            >
              {food}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={customFood}
            onChange={(e) => setCustomFood(e.target.value)}
            placeholder="Other food..."
            className="input-field text-sm flex-1"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFood())}
          />
          <button type="button" onClick={addCustomFood} className="btn-secondary text-sm px-3">+</button>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">How much did they like it?</label>
        <div className="flex gap-3 justify-center">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`text-3xl transition-all ${n <= rating ? 'scale-110' : 'opacity-30 grayscale'}`}
              aria-label={`Rating ${n}`}
            >
              {n <= 2 ? '😐' : n === 3 ? '🙂' : '😄'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Notes (optional)</label>
        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes..." className="input-field" />
      </div>

      <button type="submit" disabled={saving || !time || foodItems.length === 0} className="btn-primary w-full">
        {saving ? 'Saving...' : 'Log Meal 🍽️'}
      </button>
    </form>
  );
}
