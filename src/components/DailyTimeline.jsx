import ActivityCard from './ActivityCard';

export default function DailyTimeline({ activities, onDelete, dateLabel }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-10">
        <span className="text-4xl">🌱</span>
        <p className="text-gray-400 mt-3 text-sm">No activities logged yet today!</p>
        <p className="text-gray-300 text-xs mt-1">Tap the Log tab to add your first activity.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {dateLabel && (
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{dateLabel}</h2>
      )}
      {activities.map((activity) => (
        <ActivityCard
          key={`${activity.category}-${activity.id}`}
          activity={activity}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
