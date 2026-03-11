import { Section } from './Section'

export function ContactSection() {
  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title="Need a stronger revenue operating system?"
      intro="If you need help tightening sales operations, forecasting, CRM process, or GTM execution, Tony Beal is available for the right conversation."
    >
      <div className="contact-panel">
        <div>
          <h3>Let&apos;s talk about your revenue engine.</h3>
          <p>
            Use email for direct outreach or connect on LinkedIn. Replace the placeholder profile URL with the final
            public profile when ready.
          </p>
        </div>
        <div className="contact-actions">
          <a className="button button--primary" href="mailto:tony@tonybeal.net">
            Email Tony
          </a>
          <a className="button button--secondary" href="https://www.linkedin.com/in/tonybeal" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
      </div>
    </Section>
  )
}
