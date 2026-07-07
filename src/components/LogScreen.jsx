import { useState } from 'react';
import MealForm from './MealForm';
import LearningForm from './LearningForm';
import SleepForm from './SleepForm';
import PlayForm from './PlayForm';

const tabs = [
  { id: 'meals', label: 'Meals', color: 'border-orange-500', textColor: 'text-orange-600' },
  { id: 'learning', label: 'Learning', color: 'border-sky-500', textColor: 'text-sky-600' },
  { id: 'sleep', label: 'Sleep', color: 'border-purple-500', textColor: 'text-purple-600' },
  { id: 'play', label: 'Play', color: 'border-green-500', textColor: 'text-green-600' },
];

export default function LogScreen({ initialCategory, onBack, onSaved, toddlerId }) {
  const [activeTab, setActiveTab] = useState(initialCategory || 'meals');

  const handleSaved = () => {
    if (onSaved) onSaved();
  };

  return (
    <div className="pb-24">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 text-xl min-w-[44px] min-h-[44px] flex items-center justify-center">
          ←
        </button>
        <h1 className="text-xl font-bold text-gray-800">Log Activity</h1>
      </div>

      <p className="text-sm text-gray-400 mb-6">
        What did your little sprout do? 🌱
      </p>

      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-semibold text-center transition-all border-b-2 ${
              activeTab === tab.id
                ? `${tab.color} ${tab.textColor}`
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card">
        {activeTab === 'meals' && <MealForm onSaved={handleSaved} toddlerId={toddlerId} />}
        {activeTab === 'learning' && <LearningForm onSaved={handleSaved} toddlerId={toddlerId} />}
        {activeTab === 'sleep' && <SleepForm onSaved={handleSaved} toddlerId={toddlerId} />}
        {activeTab === 'play' && <PlayForm onSaved={handleSaved} toddlerId={toddlerId} />}
      </div>
    </div>
  );
}
