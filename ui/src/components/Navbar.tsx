import { NavLink } from 'react-router-dom'
import { Bug, List, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Bug className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">BugTracker</span>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )
              }
            >
              <Bug className="h-4 w-4" />
              Log Bug
            </NavLink>
            <NavLink
              to="/bugs"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )
              }
            >
              <List className="h-4 w-4" />
              Bug List
            </NavLink>
            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )
              }
            >
              <BarChart2 className="h-4 w-4" />
              Analytics
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  )
}
