import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import api from '@/lib/api'
import AnalyticsPage from '../pages/AnalyticsPage'

vi.mock('@/lib/api', () => ({
  default: { get: vi.fn() },
}))

const mockedGet = vi.mocked(api.get)

const MOCK_PROGRESS_DIST = [
  { stage: 'Not Started', count: 5 },
  { stage: 'In Development', count: 3 },
  { stage: 'In Code Review', count: 2 },
  { stage: 'In QA', count: 4 },
  { stage: 'Ready for Release', count: 1 },
  { stage: 'Live', count: 6 },
]

const MOCK_WEEKLY = [
  { week: '2026-04-06', Critical: 2, High: 1, Medium: 3, Low: 1, Trivial: 0 },
  { week: '2026-03-30', Critical: 1, High: 2, Medium: 1, Low: 0, Trivial: 1 },
]

const MOCK_AVG = { avg_hours: 6.5, live_count: 6 }

const MOCK_FUNNEL = MOCK_PROGRESS_DIST.map((d, i) => ({ ...d, order: i }))

function setupMocks() {
  mockedGet.mockImplementation((url: string) => {
    if (url.includes('progress-distribution')) return Promise.resolve({ data: MOCK_PROGRESS_DIST })
    if (url.includes('weekly-severity'))       return Promise.resolve({ data: MOCK_WEEKLY })
    if (url.includes('avg-dev-to-live'))        return Promise.resolve({ data: MOCK_AVG })
    if (url.includes('funnel'))                 return Promise.resolve({ data: MOCK_FUNNEL })
    return Promise.resolve({ data: [] })
  })
}

describe('AnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders section headings after data loads', async () => {
    setupMocks()
    render(<AnalyticsPage />)

    await waitFor(() => {
      expect(screen.getByText('Bug Distribution by Progress')).toBeInTheDocument()
      expect(screen.getByText('Bug Funnel by Stage')).toBeInTheDocument()
      expect(screen.getByText('Weekly Bug Count by Severity')).toBeInTheDocument()
    })
  })

  it('displays avg hours metric card with correct value', async () => {
    setupMocks()
    render(<AnalyticsPage />)

    await waitFor(() => {
      expect(screen.getByText('6.5h')).toBeInTheDocument()
    })
  })

  it('displays N/A when avg_hours is null', async () => {
    mockedGet.mockImplementation((url: string) => {
      if (url.includes('progress-distribution')) return Promise.resolve({ data: [] })
      if (url.includes('weekly-severity'))       return Promise.resolve({ data: [] })
      if (url.includes('avg-dev-to-live'))        return Promise.resolve({ data: { avg_hours: null, live_count: 0 } })
      if (url.includes('funnel'))                 return Promise.resolve({ data: [] })
      return Promise.resolve({ data: [] })
    })

    render(<AnalyticsPage />)

    await waitFor(() => {
      expect(screen.getByText('N/A')).toBeInTheDocument()
    })
  })

  it('displays live bug count in the metric card description', async () => {
    setupMocks()
    render(<AnalyticsPage />)

    await waitFor(() => {
      expect(screen.getByText(/6 bugs currently marked as Live/i)).toBeInTheDocument()
    })
  })

  it('calls all 4 analytics API endpoints', async () => {
    setupMocks()
    render(<AnalyticsPage />)

    await waitFor(() => {
      const calls = mockedGet.mock.calls.map((c) => c[0])
      expect(calls.some((u) => u.includes('progress-distribution'))).toBe(true)
      expect(calls.some((u) => u.includes('weekly-severity'))).toBe(true)
      expect(calls.some((u) => u.includes('avg-dev-to-live'))).toBe(true)
      expect(calls.some((u) => u.includes('funnel'))).toBe(true)
    })
  })

  it('shows empty chart message when no data available', async () => {
    mockedGet.mockImplementation((url: string) => {
      if (url.includes('avg-dev-to-live')) return Promise.resolve({ data: { avg_hours: null, live_count: 0 } })
      return Promise.resolve({ data: [] })
    })

    render(<AnalyticsPage />)

    await waitFor(() => {
      const emptyMessages = screen.getAllByText(/no data available yet/i)
      expect(emptyMessages.length).toBeGreaterThanOrEqual(1)
    })
  })
})
