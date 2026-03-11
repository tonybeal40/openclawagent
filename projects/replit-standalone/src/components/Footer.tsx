const quickLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Expertise', href: '#expertise' },
  { label: 'Experience', href: '#experience' },
  { label: 'Results', href: '#results' },
  { label: 'Contact', href: '#contact' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <p>© {year} Tony Beal. All rights reserved.</p>
      <nav className="footer-links" aria-label="Footer navigation">
        {quickLinks.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  )
}
