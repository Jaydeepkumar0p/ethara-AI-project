import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = {
  todo: '#94a3b8',
  'in-progress': '#60a5fa',
  review: '#c084fc',
  done: '#34d399'
}

const LABELS = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done'
}

const RadialChart = ({ data, total }) => {
  const chartData = Object.entries(data)
    .map(([key, value]) => ({ name: LABELS[key] || key, value, key }))
    .filter(d => d.value > 0)

  if (chartData.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-base-content/30">
        <div className="text-3xl mb-2">📭</div>
        <p className="text-sm">No tasks yet</p>
      </div>
    )
  }

  return (
    <div>
      <div className="relative h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell key={entry.key} fill={COLORS[entry.key] || '#6366f1'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px'
              }}
              formatter={(value, name) => [`${value} tasks`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-display text-2xl font-bold">{total}</span>
          <span className="text-xs text-base-content/40">total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {chartData.map(entry => (
          <div key={entry.key} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[entry.key] }} />
            <span className="text-xs text-base-content/60 truncate">{entry.name}</span>
            <span className="text-xs font-medium ml-auto">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RadialChart
