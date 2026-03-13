import './style.css'

document.querySelectorAll('.reveal').forEach((el) => {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in')
        revealObserver.unobserve(e.target)
      }
    })
  }, { threshold: 0.15 })

  revealObserver.observe(el)
})

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return
    const el = entry.target
    const t = Number(el.dataset.target || 0)
    const p = el.dataset.prefix || ''
    const s = el.dataset.suffix || ''
    const start = performance.now()
    const dur = 1200

    const run = (now) => {
      const x = Math.min((now - start) / dur, 1)
      const v = Math.floor(t * (1 - Math.pow(1 - x, 3)))
      el.textContent = p + v.toLocaleString() + s
      if (x < 1) requestAnimationFrame(run)
    }

    requestAnimationFrame(run)
    countObserver.unobserve(el)
  })
}, { threshold: 0.5 })

document.querySelectorAll('.count').forEach((el) => countObserver.observe(el))

const heroPhoto = document.getElementById('heroPhoto')
const card = document.getElementById('photoCard')
if (heroPhoto && card) {
  heroPhoto.addEventListener('error', () => card.classList.add('no-photo'))
}
