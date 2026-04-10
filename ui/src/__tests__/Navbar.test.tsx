import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../components/Navbar'

function renderNavbar(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar />
    </MemoryRouter>
  )
}

describe('Navbar', () => {
  it('renders brand name', () => {
    renderNavbar()
    expect(screen.getByText('BugTracker')).toBeInTheDocument()
  })

  it('renders all 3 nav links', () => {
    renderNavbar()
    expect(screen.getByText('Log Bug')).toBeInTheDocument()
    expect(screen.getByText('Bug List')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
  })

  it('Log Bug link points to /', () => {
    renderNavbar()
    const link = screen.getByRole('link', { name: /log bug/i })
    expect(link).toHaveAttribute('href', '/')
  })

  it('Bug List link points to /bugs', () => {
    renderNavbar()
    const link = screen.getByRole('link', { name: /bug list/i })
    expect(link).toHaveAttribute('href', '/bugs')
  })

  it('Analytics link points to /analytics', () => {
    renderNavbar()
    const link = screen.getByRole('link', { name: /analytics/i })
    expect(link).toHaveAttribute('href', '/analytics')
  })

  it('active link has active styling when on / route', () => {
    renderNavbar('/')
    const logBugLink = screen.getByRole('link', { name: /log bug/i })
    expect(logBugLink.className).toContain('bg-blue-50')
  })

  it('active link has active styling when on /analytics route', () => {
    renderNavbar('/analytics')
    const analyticsLink = screen.getByRole('link', { name: /analytics/i })
    expect(analyticsLink.className).toContain('bg-blue-50')
  })
})
