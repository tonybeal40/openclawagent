let companies=[];
const key='company-intel-v3-notes';

function score(c){return Math.round((c.fitScore+c.compPotential+c.growthPotential-c.riskScore)/3)}

function renderStats(list){
  const go=list.filter(c=>c.verdict==='GO').length;
  const may=list.filter(c=>c.verdict==='MAYBE').length;
  const skip=list.filter(c=>c.verdict==='SKIP').length;
  document.getElementById('stats').innerHTML=`
    <div class='stat'><div class='k'>Companies</div><div class='v'>${list.length}</div></div>
    <div class='stat'><div class='k'>GO</div><div class='v'>${go}</div></div>
    <div class='stat'><div class='k'>MAYBE</div><div class='v'>${may}</div></div>
    <div class='stat'><div class='k'>SKIP</div><div class='v'>${skip}</div></div>`;
}

function render(){
  const q=document.getElementById('q').value.toLowerCase().trim();
  const vf=document.getElementById('verdictFilter').value;
  const list=companies.filter(c=>{
    if(vf!=='all'&&c.verdict!==vf)return false;
    if(!q)return true;
    return [c.name,c.role,c.summary,c.approach].join(' ').toLowerCase().includes(q);
  });
  renderStats(list);
  const grid=document.getElementById('grid');
  grid.innerHTML='';
  for(const c of list){
    const card=document.createElement('article');
    card.className='card';
    card.innerHTML=`
      <div class='head'><h2 class='title'>${c.name}</h2><span class='badge ${c.verdict}'>${c.verdict}</span></div>
      <div class='row'><h4>Role</h4><div>${c.role}</div></div>
      <div class='row'><h4>Evaluator</h4><div class='chips'>
        <span class='chip'>Fit ${c.fitScore}/10</span><span class='chip'>Comp ${c.compPotential}/10</span><span class='chip'>Growth ${c.growthPotential}/10</span><span class='chip'>Risk ${c.riskScore}/10</span><span class='chip'>Overall ${score(c)}/10</span>
      </div></div>
      <div class='row'><h4>Why Fit</h4><div>${c.whyFit}</div></div>
      <div class='row'><h4>Review Signal</h4><div>${c.reviewSummary}</div></div>
      <div class='row'><h4>Risk Flags</h4><div class='chips'>${(c.riskFlags||[]).map(x=>`<span class='chip'>${x}</span>`).join('')}</div></div>
      <div class='row'><h4>Approach</h4><div>${c.approach}</div></div>
      <div class='row links'>
        <a href='${c.website||"#"}' target='_blank'>Website</a>
        <a href='${c.linkedin||"#"}' target='_blank'>LinkedIn</a>
        <a href='${c.jobPosting||"#"}' target='_blank'>Job</a>
        <a href='${c.reviews||"#"}' target='_blank'>Reviews</a>
      </div>
      <div class='row'><h4>Notes</h4><textarea class='notes' data-id='${c.id}'>${c.notes||''}</textarea></div>`;
    grid.appendChild(card);
  }
}

async function init(){
  const res=await fetch('companies.v3.json');
  companies=await res.json();
  const saved=JSON.parse(localStorage.getItem(key)||'{}');
  companies=companies.map(c=>({...c,notes:saved[c.id]||c.notes||''}));
  document.getElementById('q').addEventListener('input',render);
  document.getElementById('verdictFilter').addEventListener('change',render);
  document.getElementById('saveBtn').addEventListener('click',()=>{
    const m={};
    document.querySelectorAll('.notes').forEach(n=>m[n.dataset.id]=n.value);
    localStorage.setItem(key,JSON.stringify(m));
    alert('Saved');
  });
  render();
}
init();