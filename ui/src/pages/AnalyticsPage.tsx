import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart2, Clock, Loader2 } from 'lucide-react'

interface ProgressDistItem { stage: string; count: number }
interface WeeklySeverityItem { week: string; Critical: number; High: number; Medium: number; Low: number; Trivial: number }
interface AvgDevToLive { avg_hours: number | null; live_count: number }
interface FunnelItem { stage: string; count: number; order: number }

const PROGRESS_COLORS: Record<string, string> = {
  'Not Started': '#94a3b8',
  'In Development': '#60a5fa',
  'In Code Review': '#a78bfa',
  'In QA': '#fb923c',
  'Ready for Release': '#34d399',
  'Live': '#22c55e',
}

const SEVERITY_COLORS: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#3b82f6',
  Trivial: '#94a3b8',
}

const FUNNEL_COLORS = ['#60a5fa', '#818cf8', '#a78bfa', '#fb923c', '#34d399', '#22c55e']

function formatWeek(weekStr: string) {
  const d = new Date(weekStr + 'T00:00:00')
  return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`
}

export default function AnalyticsPage() {
  const [progressDist, setProgressDist] = useState<ProgressDistItem[]>([])
  const [weeklySeverity, setWeeklySeverity] = useState<WeeklySeverityItem[]>([])
  const [avgMetric, setAvgMetric] = useState<AvgDevToLive | null>(null)
  const [funnel, setFunnel] = useState<FunnelItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get<ProgressDistItem[]>('/api/analytics/progress-distribution'),
      axios.get<WeeklySeverityItem[]>('/api/analytics/weekly-severity'),
      axios.get<AvgDevToLive>('/api/analytics/avg-dev-to-live'),
      axios.get<FunnelItem[]>('/api/analytics/funnel'),
    ]).then(([pd, ws, avg, fn]) => {
      setProgressDist(pd.data.filter((d) => d.count > 0))
      setWeeklySeverity(ws.data)
      setAvgMetric(avg.data)
      setFunnel(fn.data.filter((d) => d.count > 0))
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BarChart2 className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Bug tracking insights and metrics</p>
        </div>
      </div>

      {/* Avg Dev to Live Metric Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
        <CardContent className="flex items-center gap-6 py-6 px-8">
          <div className="p-3 bg-white/20 rounded-xl">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <div>
            <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">
              Avg. Estimated Fix Time (Live Bugs)
            </p>
            <p className="text-4xl font-bold mt-1">
              {avgMetric?.avg_hours != null
                ? `${avgMetric.avg_hours}h`
                : 'N/A'}
            </p>
            <p className="text-blue-200 text-sm mt-1">
              Based on {avgMetric?.live_count ?? 0} bug{avgMetric?.live_count !== 1 ? 's' : ''} currently marked as Live
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Bugs by Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Bug Distribution by Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {progressDist.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={progressDist}
                    dataKey="count"
                    nameKey="stage"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label={({ percent }: { percent?: number }) =>
                      (percent ?? 0) > 0.04 ? `${((percent ?? 0) * 100).toFixed(0)}%` : ''
                    }
                    labelLine={false}
                  >
                    {progressDist.map((entry) => (
                      <Cell key={entry.stage} fill={PROGRESS_COLORS[entry.stage] ?? '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} bugs`, 'Count']} />
                  <Legend formatter={(value) => <span className="text-sm text-gray-700">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Funnel Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Bug Funnel by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            {funnel.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <FunnelChart>
                  <Tooltip formatter={(v) => [`${v} bugs`, 'Count']} />
                  <Funnel
                    dataKey="count"
                    data={funnel.map((d, i) => ({
                      ...d,
                      name: d.stage,
                      fill: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
                    }))}
                    isAnimationActive
                  >
                    <LabelList position="center" fill="#fff" fontSize={12} dataKey="stage" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stacked Bar Chart: Weekly by Severity */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Bug Count by Severity</CardTitle>
        </CardHeader>
        <CardContent>
          {weeklySeverity.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={weeklySeverity} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="week"
                  tickFormatter={formatWeek}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  label={{ value: 'Bugs', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#9ca3af' } }}
                />
                <Tooltip
                  formatter={(v, name) => [`${v}`, name]}
                  labelFormatter={(label) => `Week of ${formatWeek(label)}`}
                />
                <Legend formatter={(value) => <span className="text-sm text-gray-700">{value}</span>} />
                {(['Critical', 'High', 'Medium', 'Low', 'Trivial'] as const).map((sev) => (
                  <Bar key={sev} dataKey={sev} stackId="a" fill={SEVERITY_COLORS[sev]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
      No data available yet. Log some bugs to see analytics.
    </div>
  )
}
