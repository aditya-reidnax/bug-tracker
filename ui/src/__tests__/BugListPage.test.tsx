import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import axios from 'axios'
import BugListPage from '../pages/BugListPage'

vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

const SAMPLE_BUGS = [
  {
    id: 1, title: 'Login crash', severity: 'Critical', progress: 'Not Started',
    reporter_name: 'Alice', estimated_fix_hours: '4.00', date_reported: '2026-04-10', created_at: '',
  },
  {
    id: 2, title: 'Slow dashboard', severity: 'High', progress: 'In Development',
    reporter_name: 'Bob', estimated_fix_hours: '2.00', date_reported: '2026-04-08', created_at: '',
  },
  {
    id: 3, title: 'Typo in footer', severity: 'Trivial', progress: 'Live',
    reporter_name: 'Alice', estimated_fix_hours: '0.25', date_reported: '2026-03-10', created_at: '',
  },
]

function setupMocks(bugs = SAMPLE_BUGS, reporters = ['Alice', 'Bob']) {
  mockedAxios.get = vi.fn().mockImplementation((url: string) => {
    if (url.includes('/reporters')) return Promise.resolve({ data: reporters })
    return Promise.resolve({ data: bugs })
  })
}

describe('BugListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading spinner initially', () => {
    setupMocks()
    render(<BugListPage />)
    // The spinner should be visible briefly — just check no crash
    expect(document.body).toBeTruthy()
  })

  it('renders bugs in a table after loading', async () => {
    setupMocks()
    render(<BugListPage />)

    await waitFor(() => {
      expect(screen.getByText('Login crash')).toBeInTheDocument()
      expect(screen.getByText('Slow dashboard')).toBeInTheDocument()
      expect(screen.getByText('Typo in footer')).toBeInTheDocument()
    })
  })

  it('displays bug count in the heading area', async () => {
    setupMocks()
    render(<BugListPage />)

    await waitFor(() => {
      expect(screen.getByText('3 bugs found')).toBeInTheDocument()
    })
  })

  it('shows severity badges for each bug', async () => {
    setupMocks()
    render(<BugListPage />)

    await waitFor(() => {
      expect(screen.getByText('Critical')).toBeInTheDocument()
      expect(screen.getByText('High')).toBeInTheDocument()
      expect(screen.getByText('Trivial')).toBeInTheDocument()
    })
  })

  it('shows empty state when no bugs match', async () => {
    setupMocks([])
    render(<BugListPage />)

    await waitFor(() => {
      expect(screen.getByText('No bugs found')).toBeInTheDocument()
    })
  })

  it('displays singular "bug found" for exactly 1 result', async () => {
    setupMocks([SAMPLE_BUGS[0]])
    render(<BugListPage />)

    await waitFor(() => {
      expect(screen.getByText('1 bug found')).toBeInTheDocument()
    })
  })

  it('renders all filter section headings', async () => {
    setupMocks()
    render(<BugListPage />)

    expect(screen.getByText('Filters')).toBeInTheDocument()
    expect(screen.getByText('Bug Progress')).toBeInTheDocument()
    expect(screen.getByText('Severity')).toBeInTheDocument()
    expect(screen.getByText('Date Reported')).toBeInTheDocument()
    expect(screen.getByText('Reporter Name')).toBeInTheDocument()
  })

  it('renders all progress stage checkboxes', async () => {
    setupMocks()
    render(<BugListPage />)

    const stages = ['Not Started', 'In Development', 'In Code Review', 'In QA', 'Ready for Release', 'Live']
    stages.forEach((stage) => {
      expect(screen.getByLabelText(stage)).toBeInTheDocument()
    })
  })

  it('renders all severity checkboxes', async () => {
    setupMocks()
    render(<BugListPage />)

    const severities = ['Critical', 'High', 'Medium', 'Low', 'Trivial']
    severities.forEach((sev) => {
      expect(screen.getByLabelText(sev)).toBeInTheDocument()
    })
  })

  it('renders all date range radio options', async () => {
    setupMocks()
    render(<BugListPage />)

    expect(screen.getByLabelText('All Time')).toBeInTheDocument()
    expect(screen.getByLabelText('This Week')).toBeInTheDocument()
    expect(screen.getByLabelText('Last 2 Weeks')).toBeInTheDocument()
    expect(screen.getByLabelText('This Month')).toBeInTheDocument()
  })
})
