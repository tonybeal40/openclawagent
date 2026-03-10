const seed = {
  mission: 'Build a reliable agent team that ships value daily with clean handoffs.',
  tasks: [
    {title:'Finalize mission-control workflow memory', owner:'Calvin', status:'Backlog'},
    {title:'Sync dashboard data pipeline', owner:'Albert', status:'Doing'},
    {title:'Review Feb12-22 recovery evidence', owner:'Jared', status:'Review'},
    {title:'Publish daily handoff', owner:'Tony', status:'Done'}
  ],
  jobs: [
    {name:'Morning proactive check', when:'Daily 08:00', enabled:true},
    {name:'run-folder milestone sync', when:'On demand', enabled:true}
  ],
  projects: [
    {name:'CareerOS Dashboard', progress:72},
    {name:'Recovery + Timeline', progress:81},
    {name:'Mission Control', progress:55}
  ],
  memories:[
    {day:'2026-03-10', note:'Mission control + handoff template established.'}
  ],
  docs:[
    {title:'OPENCLAW_MASTER_RUNBOOK', category:'runbook'},
    {title:'HANDOFF_TEMPLATE', category:'ops'}
  ],
  team:[
    {name:'Calvin', role:'Coordinator'}, {name:'Albert', role:'Execution'},
    {name:'Jared', role:'Ops'}, {name:'Azeem', role:'Research'},
    {name:'Breyer', role:'Marketing Systems'}, {name:'Saylor', role:'QA'},
    {name:'Beckham', role:'Comms'}
  ],
  activity:['Calvin triaging queue','Albert updating dashboard data','Saylor validating outputs']
};

const state = JSON.parse(localStorage.getItem('mc_state') || 'null') || seed;
const save = () => localStorage.setItem('mc_state', JSON.stringify(state));

document.getElementById('mission').textContent = state.mission;

document.querySelectorAll('nav button').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));
    document.getElementById(btn.dataset.view).classList.remove('hidden');
  }
});

function renderTask(){
  const el = document.getElementById('task');
  const cols=['Backlog','Doing','Review','Done'];
  el.innerHTML=`<h2>Task Board</h2><div class='grid kanban'>${cols.map(c=>`<div class='card'><h3>${c}</h3>${state.tasks.filter(t=>t.status===c).map(t=>`<div class='card'><b>${t.title}</b><div class='muted'>${t.owner}</div></div>`).join('')}</div>`).join('')}</div>`;
}
function renderCalendar(){
  document.getElementById('calendar').innerHTML = `<h2>Calendar / Cron</h2><ul class='list'>${state.jobs.map(j=>`<li><span class='pill'>${j.enabled?'enabled':'disabled'}</span> ${j.name} — ${j.when}</li>`).join('')}</ul>`;
}
function renderProjects(){
  document.getElementById('projects').innerHTML = `<h2>Projects</h2>${state.projects.map(p=>`<div class='card'><b>${p.name}</b><div class='muted'>${p.progress}%</div></div>`).join('')}`;
}
function renderMemories(){
  document.getElementById('memories').innerHTML = `<h2>Memories</h2><ul class='list'>${state.memories.map(m=>`<li><b>${m.day}</b> — ${m.note}</li>`).join('')}</ul>`;
}
function renderDocs(){
  document.getElementById('docs').innerHTML = `<h2>Docs</h2><ul class='list'>${state.docs.map(d=>`<li>${d.title} <span class='muted'>(${d.category})</span></li>`).join('')}</ul>`;
}
function renderTeam(){
  document.getElementById('team').innerHTML = `<h2>Team</h2><ul class='list'>${state.team.map(t=>`<li><b>${t.name}</b> — ${t.role}</li>`).join('')}</ul>`;
}
function renderOffice(){
  document.getElementById('office').innerHTML = `<h2>Office</h2><div class='card'>${state.activity.map(a=>`<div>🟢 ${a}</div>`).join('')}</div><p class='muted'>Fun mode on. Keep shipping.</p>`;
}

[renderTask,renderCalendar,renderProjects,renderMemories,renderDocs,renderTeam,renderOffice].forEach(fn=>fn());
save();