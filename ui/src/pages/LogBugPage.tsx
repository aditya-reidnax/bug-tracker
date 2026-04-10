import { useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, AlertCircle, Bug } from 'lucide-react'

const SEVERITIES = ['Critical', 'High', 'Medium', 'Low', 'Trivial']
const PROGRESS_STAGES = [
  'Not Started',
  'In Development',
  'In Code Review',
  'In QA',
  'Ready for Release',
  'Live',
]

interface FormData {
  title: string
  severity: string
  progress: string
  reporter_name: string
  estimated_fix_hours: string
  date_reported: string
}

const getEmptyForm = (): FormData => ({
  title: '',
  severity: '',
  progress: '',
  reporter_name: '',
  estimated_fix_hours: '',
  date_reported: new Date().toISOString().split('T')[0],
})

export default function LogBugPage() {
  const [form, setForm] = useState<FormData>(getEmptyForm)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      await axios.post('/api/bugs', {
        ...form,
        estimated_fix_hours: parseFloat(form.estimated_fix_hours),
      })
      setStatus('success')
      setForm(getEmptyForm())
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      setStatus('error')
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setErrorMsg(err.response.data.error)
      } else {
        setErrorMsg('Failed to log bug. Please try again.')
      }
    }
  }

  const isValid =
    form.title.trim() &&
    form.severity &&
    form.progress &&
    form.reporter_name.trim() &&
    form.estimated_fix_hours &&
    parseFloat(form.estimated_fix_hours) >= 0 &&
    form.date_reported

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Bug className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Log a Bug</h1>
          <p className="text-sm text-gray-500 mt-0.5">Report a new bug to track it through resolution</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bug Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title">Bug Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder="e.g. Login button unresponsive on mobile"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Severity <span className="text-red-500">*</span></Label>
                <Select value={form.severity} onValueChange={(v) => handleChange('severity', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITIES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Bug Progress <span className="text-red-500">*</span></Label>
                <Select value={form.progress} onValueChange={(v) => handleChange('progress', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select progress" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRESS_STAGES.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reporter_name">Reporter Name <span className="text-red-500">*</span></Label>
              <Input
                id="reporter_name"
                placeholder="e.g. Jane Smith"
                value={form.reporter_name}
                onChange={(e) => handleChange('reporter_name', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="estimated_fix_hours">Estimated Fix Time (hours) <span className="text-red-500">*</span></Label>
                <Input
                  id="estimated_fix_hours"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="e.g. 4"
                  value={form.estimated_fix_hours}
                  onChange={(e) => handleChange('estimated_fix_hours', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date_reported">Date Reported <span className="text-red-500">*</span></Label>
                <Input
                  id="date_reported"
                  type="date"
                  value={form.date_reported}
                  onChange={(e) => handleChange('date_reported', e.target.value)}
                  required
                />
              </div>
            </div>

            {status === 'success' && (
              <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span className="text-sm">Bug logged successfully!</span>
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="text-sm">{errorMsg}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={!isValid || status === 'loading'}>
                {status === 'loading' ? 'Logging...' : 'Log Bug'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setForm(getEmptyForm()); setStatus('idle') }}
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
