import './App.css'
import { ContactSection } from './components/ContactSection'
import { ExperienceTimeline, type ExperienceItem } from './components/ExperienceTimeline'
import { ExpertiseGrid, type ExpertiseItem } from './components/ExpertiseGrid'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { HeroSection } from './components/HeroSection'
import { ResultsSection, type ResultItem } from './components/ResultsSection'
import { Section } from './components/Section'

const expertise: ExpertiseItem[] = [
  {
    title: 'RevOps',
    description: 'Align revenue teams around one operating cadence, one source of truth, and one accountable funnel.',
  },
  {
    title: 'Sales Ops',
    description: 'Build disciplined process, territory planning, reporting, and pipeline management that sales teams actually use.',
  },
  {
    title: 'GTM Systems',
    description: 'Translate go-to-market strategy into clean CRM architecture, integrations, and workflows that scale.',
  },
  {
    title: 'Forecasting',
    description: 'Improve forecast accuracy with better stage definitions, inspection rhythms, and data hygiene.',
  },
  {
    title: 'Enablement',
    description: 'Equip reps and managers with playbooks, tooling, and feedback loops that shorten time to productivity.',
  },
]

const experience: ExperienceItem[] = [
  {
    company: 'Wicks',
    role: 'Revenue Operations and Business Development Leader',
    period: '2023 - Present',
    summary: 'Driving operating rigor across pipeline management, GTM execution, and strategic growth initiatives.',
  },
  {
    company: 'BioGaia',
    role: 'Sales Operations and Commercial Strategy',
    period: '2020 - 2023',
    summary: 'Built commercial reporting, process discipline, and cross-functional decision support for growth-stage expansion.',
  },
  {
    company: 'ProForm',
    role: 'Business Development and Sales Operations',
    period: '2017 - 2020',
    summary: 'Improved sales execution through cleaner systems, tighter planning, and operational support for revenue teams.',
  },
  {
    company: 'Natoli',
    role: 'Business Development',
    period: '2013 - 2017',
    summary: 'Led relationship-driven growth efforts while strengthening the commercial foundation behind new business.',
  },
]

const results: ResultItem[] = [
  'Built forecasting and inspection rhythms that gave leadership a more reliable view of pipeline health and risk.',
  'Improved CRM structure and reporting so commercial teams could act on data instead of debating it.',
  'Created scalable operating processes that reduced manual work and increased accountability across GTM teams.',
  'Supported business development initiatives with clearer qualification, handoff, and follow-through mechanisms.',
]

function App() {
  return (
    <div className="site-shell">
      <Header />

      <main>
        <HeroSection />

        <Section
          id="expertise"
          eyebrow="Expertise"
          title="Operational depth across the full revenue engine."
          intro="Tony Beal brings a systems-first view to growth: connecting leadership priorities, field execution, and the operating model underneath both."
        >
          <ExpertiseGrid items={expertise} />
        </Section>

        <Section
          id="experience"
          eyebrow="Experience"
          title="A track record built across operations, sales, and business development."
          intro="From mid-market execution to strategic growth support, each role sharpened the ability to build process without slowing momentum."
        >
          <ExperienceTimeline items={experience} />
        </Section>

        <Section
          id="results"
          eyebrow="Results"
          title="Proof that operational clarity drives commercial performance."
          intro="The work centers on making revenue teams easier to manage, easier to forecast, and easier to scale."
        >
          <ResultsSection items={results} />
        </Section>

        <ContactSection />
      </main>

      <Footer />
    </div>
  )
}

export default App
