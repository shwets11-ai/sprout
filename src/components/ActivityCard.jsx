const categoryConfig = {
  meal:    { icon: '🍽️', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', label: 'Meal' },
  learning:{ icon: '📚', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', label: 'Learning' },
  sleep:   { icon: '😴', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', label: 'Sleep' },
  play:    { icon: '🎮', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: 'Play' },
};

export default function ActivityCard({ activity, onDelete }) {
  const cfg = categoryConfig[activity.category] || categoryConfig.meal;

  const detailLines = [];
  if (activity.category === 'meal') {
    detailLines.push(`Food: ${activity.foodItems || '—'}`);
    detailLines.push(`Rating: ${'⭐'.repeat(activity.rating || 0)}`);
  } else if (activity.category === 'learning') {
    detailLines.push(`Activity: ${activity.activityType || '—'}`);
    detailLines.push(`Duration: ${activity.duration || 0} min`);
  } else if (activity.category === 'sleep') {
    detailLines.push(`${activity.startTime || '?'} → ${activity.endTime || '?'}`);
    detailLines.push(`Type: ${activity.type || '—'} · Quality: ${'⭐'.repeat(activity.quality || 0)}`);
  } else if (activity.category === 'play') {
    detailLines.push(`Activity: ${activity.activityType || '—'}`);
    detailLines.push(`Duration: ${activity.duration || 0} min · ${activity.location || '—'}`);
  }

  return (
    <div className={`card ${cfg.bg} ${cfg.border} flex items-start gap-3`}>
      <span className="text-2xl mt-0.5">{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold uppercase tracking-wide ${cfg.text}`}>{cfg.label}</span>
          {activity.time && (
            <span className="text-xs text-gray-400 font-medium">{activity.time}</span>
          )}
        </div>
        {detailLines.map((line, i) => (
          <p key={i} className="text-sm text-gray-600 mt-0.5">{line}</p>
        ))}
        {activity.notes && (
          <p className="text-xs text-gray-400 italic mt-1">{activity.notes}</p>
        )}
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(activity.category, activity.id)}
          className="text-gray-300 hover:text-red-400 transition-colors p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Delete"
        >
          ✕
        </button>
      )}
    </div>
  );
}
