import { useEffect, useState } from 'react'

import './App.css'
import { DashboardCard, type MissionCard, type PriorityLevel } from './components/DashboardCard'
import { DashboardLane, type LaneDefinition } from './components/DashboardLane'
import { OfficeSidebar, type AvailabilityItem, type QuickStat } from './components/OfficeSidebar'

const lanes: LaneDefinition[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    accent: 'lane-backlog',
    cards: [
      { id: 'b1', title: 'Refine launch checklist', owner: 'AL', priority: 'Med', dueDate: 'Mar 14' },
      { id: 'b2', title: 'Capture user interview clips', owner: 'JT', priority: 'Low', dueDate: 'Mar 16' },
      { id: 'b3', title: 'Review onboarding copy', owner: 'RK', priority: 'High', dueDate: 'Mar 18' },
    ],
  },
  {
    id: 'progress',
    title: 'In Progress',
    accent: 'lane-progress',
    cards: [
      { id: 'p1', title: 'Ship telemetry dashboard', owner: 'MN', priority: 'High', dueDate: 'Mar 12' },
      { id: 'p2', title: 'Tune deploy rollback flow', owner: 'DS', priority: 'Med', dueDate: 'Mar 13' },
      { id: 'p3', title: 'QA mobile command center', owner: 'EV', priority: 'Med', dueDate: 'Mar 15' },
    ],
  },
  {
    id: 'blocked',
    title: 'Blocked',
    accent: 'lane-blocked',
    cards: [
      { id: 'x1', title: 'Procurement approval for GPUs', owner: 'KP', priority: 'High', dueDate: 'Mar 11' },
      { id: 'x2', title: 'Vendor API rate limit waiver', owner: 'LM', priority: 'Med', dueDate: 'Mar 17' },
      { id: 'x3', title: 'Legal sign-off for pilot', owner: 'SC', priority: 'Low', dueDate: 'Mar 19' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    accent: 'lane-done',
    cards: [
      { id: 'd1', title: 'Alert routing migration', owner: 'TW', priority: 'High', dueDate: 'Mar 10' },
      { id: 'd2', title: 'Sprint notes published', owner: 'HB', priority: 'Low', dueDate: 'Mar 09' },
      { id: 'd3', title: 'Incident template updated', owner: 'CF', priority: 'Med', dueDate: 'Mar 08' },
    ],
  },
]

const teamAvailability: AvailabilityItem[] = [
  { name: 'Avery Lane', role: 'Ops Lead', status: 'Online', detail: 'Warp room' },
  { name: 'Mina Noor', role: 'Frontend', status: 'Focus', detail: 'Heads-down on charts' },
  { name: 'Diego Soto', role: 'Platform', status: 'In Review', detail: 'Rollback audit' },
  { name: 'Lina Moore', role: 'Partnerships', status: 'Away', detail: 'Vendor call until 4:30' },
]

const quickStats: QuickStat[] = [
  { label: 'Open Missions', value: '12' },
  { label: 'At Risk', value: '3' },
  { label: 'Velocity', value: '84%' },
  { label: 'Deploys Today', value: '7' },
]

function formatCurrentTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function countPriority(cards: MissionCard[], priority: PriorityLevel) {
  return cards.filter((card) => card.priority === priority).length
}

function App() {
  const [currentTime, setCurrentTime] = useState(() => formatCurrentTime(new Date()))

  useEffect(() => {
    let intervalId: number

    const syncClock = () => {
      setCurrentTime(formatCurrentTime(new Date()))
      intervalId = window.setInterval(() => {
        setCurrentTime(formatCurrentTime(new Date()))
      }, 60_000)
    }

    const now = new Date()
    const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()
    const timeoutId = window.setTimeout(syncClock, delay)

    setCurrentTime(formatCurrentTime(now))

    return () => {
      window.clearTimeout(timeoutId)
      if (intervalId) {
        window.clearInterval(intervalId)
      }
    }
  }, [])

  const totalCards = lanes.reduce((sum, lane) => sum + lane.cards.length, 0)
  const highPriorityCount = lanes.reduce((sum, lane) => sum + countPriority(lane.cards, 'High'), 0)

  return (
    <div className="mission-control">
      <div className="mission-control__backdrop" />
      <div className="app-shell">
        <main className="dashboard">
          <header className="dashboard-header">
            <div>
              <p className="eyebrow">Orbital Command Grid</p>
              <h1>Mission Control</h1>
            </div>
            <div className="dashboard-header__meta">
              <div className="clock-panel">
                <span className="clock-panel__label">Current Time</span>
                <strong>{currentTime}</strong>
              </div>
              <div className="status-pill">
                <span className="status-pill__dot" />
                Systems nominal
              </div>
            </div>
          </header>

          <section className="board-overview" aria-label="Board overview">
            <div>
              <span className="overview-label">Active board</span>
              <strong>{totalCards} tracked items</strong>
            </div>
            <div>
              <span className="overview-label">High priority</span>
              <strong>{highPriorityCount} missions</strong>
            </div>
            <div>
              <span className="overview-label">Blocked lane</span>
              <strong>{lanes.find((lane) => lane.id === 'blocked')?.cards.length ?? 0} waiting</strong>
            </div>
          </section>

          <section className="lanes-grid" aria-label="Mission lanes">
            {lanes.map((lane) => (
              <DashboardLane key={lane.id} lane={lane}>
                {lane.cards.map((card) => (
                  <DashboardCard key={card.id} card={card} />
                ))}
              </DashboardLane>
            ))}
          </section>
        </main>

        <OfficeSidebar availability={teamAvailability} stats={quickStats} />
      </div>
    </div>
  )
}

export default App
