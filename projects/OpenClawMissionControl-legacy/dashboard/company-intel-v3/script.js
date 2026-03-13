let companies=[];
const KEY='company-intel-v3-notes';

async function load(){
  const res=await fetch('companies.json');
  companies=await res.json();
  hydrateLocal();
  render();
  bind();
}

function hydrateLocal(){
  const saved=JSON.parse(localStorage.getItem(KEY)||'{}');
  companies.forEach(c=>{ if(saved[c.name]){ c.notes=saved[c.name].notes||''; c.decision=saved[c.name].decision||c.decision; c.tasks=saved[c.name].tasks||c.tasks; } });
}

function statsHTML(list){
  const go=list.filter(x=>x.decision==='GO').length;
  const maybe=list.filter(x=>x.decision==='MAYBE').length;
  const skip=list.filter(x=>x.decision==='SKIP').length;
  const avg=(list.reduce((a,b)=>a+b.fitScore,0)/(list.length||1)).toFixed(1);
  return `
  <div class='stat'><div class='k'>Companies</div><div class='v'>${list.length}</div></div>
  <div class='stat'><div class='k'>GO</div><div class='v'>${go}</div></div>
  <div class='stat'><div class='k'>MAYBE</div><div class='v'>${maybe}</div></div>
  <div class='stat'><div class='k'>SKIP</div><div class='v'>${skip}</div></div>
  <div class='stat'><div class='k'>Avg Fit Score</div><div class='v'>${avg}</div></div>`;
}

function render(){
  const search=document.getElementById('search').value.toLowerCase();
  const filter=document.getElementById('decisionFilter').value;
  const filtered=companies.filter(c=>{
    const match=(c.name+' '+c.role).toLowerCase().includes(search);
    const pass=filter==='all'||c.decision===filter;
    return match&&pass;
  });
  document.getElementById('stats').innerHTML=statsHTML(filtered);

  const grid=document.getElementById('grid');
  grid.innerHTML='';
  filtered.forEach(c=>{
    const pros=(c.pros||[]).map(x=>`<li>${x}</li>`).join('');
    const cons=(c.cons||[]).map(x=>`<li>${x}</li>`).join('');
    const tasks=(c.tasks||[]).map((t,i)=>`<span class='task ${t.done?'done':''}' data-company='${c.name}' data-task='${i}'>${t.label}</span>`).join('');
    const div=document.createElement('div');
    div.className='card';
    div.innerHTML=`
      <div class='row'>
        <h3 class='name'>${c.name}</h3>
        <span class='pill ${c.decision}'>${c.decision}</span>
      </div>
      <div class='score'>Role: ${c.role} · Fit ${c.fitScore}/10 · Risk ${c.risk}/10 · Review ${c.reviewSentiment}/10</div>
      <div class='block'><h4>Why Fit</h4><p>${c.whyFit}</p></div>
      <div class='block'><h4>Approach</h4><p>${c.approach}</p></div>
      <div class='block'><h4>Reviews Readout</h4><p>${c.reviewSummary}</p></div>
      <div class='block'><h4>Pros</h4><ul>${pros}</ul></div>
      <div class='block'><h4>Cons</h4><ul>${cons}</ul></div>
      <div class='links'>
        <a href='${c.website||"#"}' target='_blank'>Website</a>
        <a href='${c.linkedin||"#"}' target='_blank'>LinkedIn</a>
        <a href='${c.jobPosting||"#"}' target='_blank'>Job</a>
        <a href='${c.reviewsUrl||"#"}' target='_blank'>Reviews</a>
      </div>
      <div class='tasks'>${tasks}</div>
      <textarea class='notes' data-company='${c.name}' placeholder='Notes / next step...'>${c.notes||''}</textarea>
    `;
    grid.appendChild(div);
  });

  document.querySelectorAll('.task').forEach(el=>el.onclick=()=>toggleTask(el));
}

function toggleTask(el){
  const c=companies.find(x=>x.name===el.dataset.company);
  const i=parseInt(el.dataset.task,10);
  c.tasks[i].done=!c.tasks[i].done;
  render();
}

function bind(){
  document.getElementById('search').addEventListener('input',render);
  document.getElementById('decisionFilter').addEventListener('change',render);
  document.getElementById('saveBtn').addEventListener('click',()=>{
    document.querySelectorAll('.notes').forEach(n=>{ const c=companies.find(x=>x.name===n.dataset.company); c.notes=n.value; });
    const out={};
    companies.forEach(c=>out[c.name]={notes:c.notes||'',decision:c.decision,tasks:c.tasks||[]});
    localStorage.setItem(KEY,JSON.stringify(out));
    alert('Saved');
  });
}

load();