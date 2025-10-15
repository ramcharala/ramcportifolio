async function loadJSON(path){const r=await fetch(path);return await r.json();}
function el(id){return document.getElementById(id)}
function setHTML(id,html){const e=el(id);if(e)e.innerHTML=html}
function setText(id,txt){const e=el(id);if(e)e.textContent=txt}

async function loadProfile(){
  const data = await loadJSON('data/profile.json');

  setText('name', data.name||''); setText('headline', data.headline||''); setText('tagline', data.tagline||'');
  setHTML('meta', [data.location, data.availability, data.visa].filter(Boolean).join(' • '));
  setHTML('links', [data.linkedin?`<a href="${data.linkedin}" target="_blank" rel="noopener">LinkedIn</a>`:'', data.github?`<a href="${data.github}" target="_blank" rel="noopener">GitHub</a>`:'', data.email?`<a href="mailto:${data.email}">Email</a>`:''].join(''));

  // stats
  const statsEl = el('stats'); if(statsEl){ statsEl.innerHTML = ''; (data.stats||[]).forEach(s=>{
    const d=document.createElement('div'); d.className='card'; d.innerHTML = `<div class="label">${s.label}</div><div class="value">${s.value}</div>`; statsEl.appendChild(d);
  });}

  // competencies
  const compEl = el('competencies'); if(compEl){ compEl.innerHTML=''; Object.entries(data.core_competencies||{}).forEach(([cat,items])=>{
    const h = document.createElement('h4'); h.textContent=cat; h.style.color='#cbd5e1'; h.style.margin='10px 0 6px'; compEl.appendChild(h);
    (items||[]).forEach(i=>{ const b=document.createElement('span'); b.className='badge'; b.textContent=i; compEl.appendChild(b); });
  });}

  // tools
  const toolsEl = el('tools'); if(toolsEl){ toolsEl.innerHTML=''; (data.tools||[]).forEach(t=>{ const li=document.createElement('li'); li.textContent=t; toolsEl.appendChild(li); });}

  // bar chart
  const bar = el('skillsBar') || el('skillsRadar');
  if(bar && window.Chart){
    const labels = Object.keys(data.core_competencies||{});
    const values = labels.map(k=> Math.min(10, ((data.core_competencies[k]||[]).length + 5)));
    new Chart(bar, { type:'bar', data:{ labels, datasets:[{ label:'Competency breadth', data: values, borderWidth:1 }]},
      options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false,
        scales:{ x:{ suggestedMin:0, suggestedMax:10, grid:{display:false}}, y:{ grid:{display:false}}},
        plugins:{ legend:{display:false} }, layout:{ padding:8 } }
    });
  }

  // preview of cases
  const preview = el('casePreview');
  if(preview){ const cases = await loadJSON('data/cases.json'); preview.innerHTML='';
    (cases||[]).slice(0,3).forEach(c=>{
      const d=document.createElement('div'); d.className='card2';
      d.innerHTML = `<h4>${c.title}</h4><div class="muted">${c.company} • ${c.period}</div><div class="muted">${(c.domain||[]).join(', ')}</div><p>${c.context}</p>`;
      preview.appendChild(d);
    });
  }

  const y = el('year'); if(y) y.textContent = new Date().getFullYear();
}

async function loadCases(){
  const list = el('caseList'); if(!list) return;
  const data = await loadJSON('data/cases.json'); list.innerHTML = '';

  // Build tag bar
  const allTags = Array.from(new Set(data.flatMap(c=>c.domain||[]))).sort();
  const tagBar = el('tags'); const active = new Set();
  allTags.forEach(t=>{ const s=document.createElement('span'); s.className='tag'; s.textContent=t; s.onclick=()=>{ if(active.has(t)) active.delete(t); else active.add(t); s.classList.toggle('active'); render(); }; tagBar.appendChild(s); });
  const search = el('search'); search && (search.oninput = render);

  function render(){
    const q = (search && search.value || '').toLowerCase();
    list.innerHTML='';
    data.filter(c=>{
      const text = [c.title,c.company,c.context,c.problem,(c.domain||[]).join(' ')].join(' ').toLowerCase();
      const tagOk = active.size? (c.domain||[]).some(d=>active.has(d)) : true;
      return (!q or text.includes(q)) and tagOk;
    }).forEach(c=>{
      const div = document.createElement('div'); div.className='item';
      div.innerHTML = `
        <h3>${c.title}</h3>
        <p class="muted">${c.company} • ${c.period} • ${(c.domain||[]).join(', ')}</p>
        <p><strong>Context:</strong> ${c.context}</p>
        <p><strong>Problem:</strong> ${c.problem}</p>
        <p><strong>Actions:</strong></p>
        <ul>${(c.actions||[]).map(a=>`<li>${a}</li>`).join('')}</ul>
        <p><strong>Impact:</strong></p>
        <ul>${(c.impact||[]).map(a=>`<li>${a}</li>`).join('')}</ul>
        <p><strong>Challenges:</strong></p>
        <ul>${(c.challenges||[]).map(a=>`<li>${a}</li>`).join('')}</ul>
        <p><strong>Best Practices:</strong></p>
        <ul>${(c.best_practices||[]).map(a=>`<li>${a}</li>`).join('')}</ul>
      `;
      list.appendChild(div);
    });
  }
  render();
}

async function loadArtifacts(){
  const grid = el('artifactGrid'); if(!grid) return;
  const data = await loadJSON('data/artifacts.json'); grid.innerHTML='';
  (data||[]).forEach(a=>{
    const d=document.createElement('div'); d.className='card2';
    d.innerHTML = `<h4>${a.type} — ${a.title}</h4><p class="muted">${a.summary}</p><p><a class="cta" href="${a.link}" target="_blank" rel="noopener">Open</a></p>`;
    grid.appendChild(d);
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  loadProfile(); loadCases(); loadArtifacts();
});
