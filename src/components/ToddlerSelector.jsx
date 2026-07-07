export default function ToddlerSelector({ toddlers, activeToddler, onSelect }) {
  if (!toddlers || toddlers.length === 0) return null

  return (
    <div className="relative">
      <select
        value={activeToddler?.id || ''}
        onChange={(e) => {
          const t = toddlers.find((t) => t.id === Number(e.target.value))
          if (t) onSelect(t)
        }}
        className="appearance-none bg-sprout-green-50 text-sprout-green-700 font-bold text-sm rounded-xl px-3 py-1.5 pr-7 border border-sprout-green-200 focus:outline-none focus:ring-2 focus:ring-sprout-green-300 cursor-pointer min-h-[36px]"
        aria-label="Select toddler"
      >
        {toddlers.map((t) => {
          const age = t.birth_date
            ? Math.floor((Date.now() - new Date(t.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
            : null
          return (
            <option key={t.id} value={t.id}>
              {t.name}{age !== null ? ` (${age}y)` : ''}
            </option>
          )
        })}
      </select>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sprout-green-500 pointer-events-none text-xs">▼</span>
    </div>
  )
}
