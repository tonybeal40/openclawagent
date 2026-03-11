const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'Expertise', href: '#expertise' },
  { label: 'Experience', href: '#experience' },
  { label: 'Results', href: '#results' },
  { label: 'Contact', href: '#contact' },
]

export function Header() {
  return (
    <header className="site-header">
      <a className="site-brand" href="#home" aria-label="Tony Beal home">
        <span className="site-brand__mark">TB</span>
        <span className="site-brand__text">
          <strong>Tony Beal</strong>
          <span>Revenue Operations</span>
        </span>
      </a>

      <nav className="site-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
