const seed = {
  mission: 'Build a reliable agent team that ships value daily with clean handoffs.',
  tasks: [
    {title:'Finalize mission-control workflow memory', owner:'Calvin', status:'Backlog'},
    {title:'Sync dashboard data pipeline', owner:'Albert', status:'Doing'},
    {title:'Review Feb12-22 recovery evidence', owner:'Jared', status:'Review'},
    {title:'Publish daily handoff', owner:'Tony', status:'Done'}
  ],
  jobs: [],
  projects: [
    {name:'CareerOS Dashboard', progress:72},
    {name:'Recovery + Timeline', progress:81},
    {name:'Mission Control', progress:65}
  ],
  memories:[],
  docs:[],
  team:[],
  activity:['Calvin triaging queue','Albert updating dashboard data','Saylor validating outputs']
};

const state = JSON.parse(localStorage.getItem('mc_state') || 'null') || seed;
const save = () => localStorage.setItem('mc_state', JSON.stringify(state));

const safeJson = async (url, fallback=[]) => {
  try {
    const r = await fetch(url, {cache:'no-store'});
    if (!r.ok) return fallback;
    return await r.json();
  } catch { return fallback; }
};

async function loadData(){
  const [memories, docs, team, jobs] = await Promise.all([
    safeJson('data/memories.json', []),
    safeJson('data/docs.json', []),
    safeJson('data/team.json', []),
    safeJson('data/jobs.json', [])
  ]);
  if (Array.isArray(memories) && memories.length) state.memories = memories;
  if (Array.isArray(docs) && docs.length) state.docs = docs;
  if (Array.isArray(team) && team.length) state.team = team;
  if (Array.isArray(jobs) && jobs.length) {
    state.jobs = jobs.map(j => ({name: j.name || j.id || 'job', when: j.schedule?.kind || 'scheduled', enabled: j.enabled !== false}));
  }
}

document.getElementById('mission').textContent = state.mission;
document.querySelectorAll('.side-nav button').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));
    document.querySelectorAll('.side-nav button').forEach(b=>b.classList.remove('active'));
    document.getElementById(btn.dataset.view).classList.remove('hidden');
    btn.classList.add('active');
  }
});
document.querySelector('.side-nav button[data-view="task"]')?.classList.add('active');

function avatar(owner='Unassigned'){
  const initials = owner.split(/\s+/).filter(Boolean).slice(0,2).map(p=>p[0]?.toUpperCase()||'').join('') || '??';
  return `<span class='avatar' title='${owner}'>${initials}</span>`;
}
function statusClass(status='Backlog'){
  return `status-${String(status).toLowerCase()}`;
}
function renderTask(){
  const el = document.getElementById('task');
  const cols=['Backlog','Doing','Review','Done'];
  el.innerHTML=`<h2>Task Board</h2><div class='grid kanban'>${cols.map(c=>`<div class='card lane ${statusClass(c)}'><h3>${c}</h3>${state.tasks.filter(t=>t.status===c).map(t=>`<div class='card task-card ${statusClass(t.status)}'><b>${t.title}</b><div class='assignee-row'>${avatar(t.owner)}<span class='muted'>${t.owner || 'Unassigned'}</span><span class='pill ${statusClass(t.status)}'>${t.status}</span></div></div>`).join('')||'<div class="muted">None</div>'}</div>`).join('')}</div>`;
}
function renderCalendar(){
  document.getElementById('calendar').innerHTML = `<h2>Calendar / Cron</h2><ul class='list'>${(state.jobs||[]).map(j=>`<li><span class='pill'>${j.enabled?'enabled':'disabled'}</span> ${j.name} — ${j.when}</li>`).join('') || '<li class="muted">No jobs loaded yet. Run scripts/export-data.ps1</li>'}</ul>`;
}
function renderProjects(){
  document.getElementById('projects').innerHTML = `<h2>Projects</h2>${state.projects.map(p=>`<div class='card'><b>${p.name}</b><div class='muted'>${p.progress}%</div></div>`).join('')}`;
}
function renderMemories(){
  document.getElementById('memories').innerHTML = `<h2>Memories</h2><ul class='list'>${(state.memories||[]).slice(0,30).map(m=>`<li><b>${m.day}</b> — ${m.note||''}</li>`).join('') || '<li class="muted">No memory data loaded yet.</li>'}</ul>`;
}
function renderDocs(){
  document.getElementById('docs').innerHTML = `<h2>Docs</h2><ul class='list'>${(state.docs||[]).slice(0,200).map(d=>`<li>${d.title} <span class='muted'>(${d.category||'doc'})</span> ${d.path?`<span class='muted'>- ${d.path}</span>`:''}</li>`).join('') || '<li class="muted">No docs loaded yet.</li>'}</ul>`;
}
function renderTeam(){
  document.getElementById('team').innerHTML = `<h2>Team</h2><ul class='list'>${(state.team||[]).map(t=>`<li><b>${t.name}</b> — ${t.role||'Worker'}</li>`).join('') || '<li class="muted">No team loaded yet.</li>'}</ul>`;
}
function renderOffice(){
  const workers = (state.team || []).slice(0,6);
  document.getElementById('office').innerHTML = `
    <h2>Pixel Office</h2>
    <div class='office-grid'>
      <div class='card office-panel'>
        <h3>Floor Activity</h3>
        ${state.activity.map(a=>`<div class='office-line'>🟢 ${a}</div>`).join('') || '<div class="muted">No activity yet.</div>'}
      </div>
      <div class='card office-panel'>
        <h3>Desks Online</h3>
        ${(workers.length?workers:[{name:'Calvin',role:'Ops Lead'},{name:'Albert',role:'Prompt Architect'},{name:'Jared',role:'Recovery Ops'}]).map(w=>`<div class='desk-row'>${avatar(w.name)}<span><b>${w.name}</b> <span class='muted'>${w.role||'Worker'}</span></span></div>`).join('')}
      </div>
    </div>
    <p class='muted'>Pixel-office mode: tight, visible, shipping-focused.</p>`;
}
function renderActivityFeed(){
  const el = document.getElementById('activity-feed');
  if (!el) return;
  el.innerHTML = state.activity.map(a=>`<div>• ${a}</div>`).join('') || '<div class="muted">No activity yet.</div>';
}

(async ()=>{
  await loadData();
  [renderTask,renderCalendar,renderProjects,renderMemories,renderDocs,renderTeam,renderOffice,renderActivityFeed].forEach(fn=>fn());
  save();
})();