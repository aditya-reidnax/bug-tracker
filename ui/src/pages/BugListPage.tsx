import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { format } from 'date-fns'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { List, RotateCcw, Loader2, Bug } from 'lucide-react'

const SEVERITIES = ['Critical', 'High', 'Medium', 'Low', 'Trivial']
const PROGRESS_STAGES = [
  'Not Started',
  'In Development',
  'In Code Review',
  'In QA',
  'Ready for Release',
  'Live',
]
const DATE_RANGES = [
  { value: 'all_time', label: 'All Time' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_2_weeks', label: 'Last 2 Weeks' },
  { value: 'this_month', label: 'This Month' },
]

interface Bug {
  id: number
  title: string
  severity: string
  progress: string
  reporter_name: string
  estimated_fix_hours: string
  date_reported: string
  created_at: string
}

const severityBadgeVariant = (s: string) => {
  const map: Record<string, 'destructive' | 'warning' | 'default' | 'secondary' | 'outline'> = {
    Critical: 'destructive',
    High: 'warning',
    Medium: 'default',
    Low: 'secondary',
    Trivial: 'outline',
  }
  return map[s] ?? 'default'
}

const progressBadgeVariant = (p: string): 'default' | 'outline' | 'secondary' | 'destructive' | 'warning' | 'success' => {
  if (p === 'Live') return 'success'
  if (p === 'Not Started') return 'secondary'
  return 'default'
}

export default function BugListPage() {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(false)
  const [reporters, setReporters] = useState<string[]>([])

  const [selectedProgress, setSelectedProgress] = useState<string[]>([])
  const [selectedSeverity, setSelectedSeverity] = useState<string[]>([])
  const [dateRange, setDateRange] = useState('all_time')
  const [reporterName, setReporterName] = useState('__all__')

  const fetchBugs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      selectedProgress.forEach((p) => params.append('progress', p))
      selectedSeverity.forEach((s) => params.append('severity', s))
      if (dateRange !== 'all_time') params.set('date_range', dateRange)
      if (reporterName !== '__all__') params.set('reporter_name', reporterName)
      const res = await api.get<Bug[]>(`/api/bugs?${params.toString()}`)
      setBugs(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [selectedProgress, selectedSeverity, dateRange, reporterName])

  useEffect(() => {
    fetchBugs()
  }, [fetchBugs])

  useEffect(() => {
    api.get<string[]>('/api/bugs/reporters').then((res) => setReporters(res.data))
  }, [])

  const toggleProgress = (value: string) => {
    setSelectedProgress((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const toggleSeverity = (value: string) => {
    setSelectedSeverity((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const resetFilters = () => {
    setSelectedProgress([])
    setSelectedSeverity([])
    setDateRange('all_time')
    setReporterName('__all__')
  }

  const hasFilters =
    selectedProgress.length > 0 ||
    selectedSeverity.length > 0 ||
    dateRange !== 'all_time' ||
    reporterName !== '__all__'

  return (
    <div className="flex gap-6 h-full overflow-hidden">
      {/* Filter Panel */}
      <aside className="w-64 shrink-0 space-y-5 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Filters</h2>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs text-gray-500 gap-1 px-2">
              <RotateCcw className="h-3 w-3" /> Reset
            </Button>
          )}
        </div>

        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm">Bug Progress</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {PROGRESS_STAGES.map((stage) => (
              <div key={stage} className="flex items-center gap-2">
                <Checkbox
                  id={`progress-${stage}`}
                  checked={selectedProgress.includes(stage)}
                  onCheckedChange={() => toggleProgress(stage)}
                />
                <Label htmlFor={`progress-${stage}`} className="text-sm font-normal cursor-pointer">
                  {stage}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm">Severity</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {SEVERITIES.map((sev) => (
              <div key={sev} className="flex items-center gap-2">
                <Checkbox
                  id={`severity-${sev}`}
                  checked={selectedSeverity.includes(sev)}
                  onCheckedChange={() => toggleSeverity(sev)}
                />
                <Label htmlFor={`severity-${sev}`} className="text-sm font-normal cursor-pointer">
                  {sev}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm">Date Reported</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <RadioGroup value={dateRange} onValueChange={setDateRange} className="space-y-2">
              {DATE_RANGES.map((dr) => (
                <div key={dr.value} className="flex items-center gap-2">
                  <RadioGroupItem value={dr.value} id={`date-${dr.value}`} />
                  <Label htmlFor={`date-${dr.value}`} className="text-sm font-normal cursor-pointer">
                    {dr.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm">Reporter Name</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <Select value={reporterName} onValueChange={setReporterName}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All reporters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Reporters</SelectItem>
                {reporters.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </aside>

      {/* Bug Table */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <div className="p-2 bg-blue-100 rounded-lg">
            <List className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bug List</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? 'Loading...' : `${bugs.length} bug${bugs.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : bugs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Bug className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-lg font-medium">No bugs found</p>
            <p className="text-sm mt-1">Try adjusting your filters or log a new bug</p>
          </div>
        ) : (
          <Card className="h-full flex flex-col overflow-hidden">
            {/* Fixed header — never scrolls */}
            <table className="w-full text-sm shrink-0" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '35%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '17%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 rounded-tl-lg">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Severity</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Progress</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Reporter</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Est. Hours</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 rounded-tr-lg">Date Reported</th>
                </tr>
              </thead>
            </table>
            {/* Scrollable body — scrollbar-gutter keeps width stable */}
            <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
              <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '35%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '17%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: '12%' }} />
                </colgroup>
                <tbody>
                  {bugs.map((bug, idx) => (
                    <tr
                      key={bug.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${idx === bugs.length - 1 ? 'border-b-0' : ''}`}
                    >
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        <span className="line-clamp-2">{bug.title}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={severityBadgeVariant(bug.severity)}>{bug.severity}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={progressBadgeVariant(bug.progress)}>{bug.progress}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{bug.reporter_name}</td>
                      <td className="px-4 py-3 text-gray-600">{parseFloat(bug.estimated_fix_hours)}h</td>
                      <td className="px-4 py-3 text-gray-600">
                        {format(new Date(bug.date_reported), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        </div>
      </div>
    </div>
  )
}
