import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LogBugPage from './pages/LogBugPage'
import BugListPage from './pages/BugListPage'
import AnalyticsPage from './pages/AnalyticsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LogBugPage />} />
          <Route path="/bugs" element={<BugListPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
