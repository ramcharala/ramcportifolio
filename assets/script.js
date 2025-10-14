async function loadProfile() {
  const res = await fetch('data/profile.json');
  const data = await res.json();

  // Header
  document.getElementById('name').textContent = data.name;
  document.getElementById('headline').textContent = data.headline;
  document.getElementById('tagline').textContent = data.tagline;
  document.getElementById('meta').innerHTML = `${data.location} • ${data.availability} • ${data.visa}`;
  document.getElementById('links').innerHTML = [
    data.linkedin ? `<a href="${data.linkedin}" target="_blank" rel="noopener">LinkedIn</a>` : '',
    data.github ? `<a href="${data.github}" target="_blank" rel="noopener">GitHub</a>` : '',
    data.email ? `<a href="mailto:${data.email}">Email</a>` : ''
  ].join('');

  // Stats
  const statsEl = document.getElementById('stats');
  data.stats.forEach(s => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<div class="label">${s.label}</div><div class="value">${s.value}</div>`;
    statsEl.appendChild(card);
  });

  // Competencies
  const compEl = document.getElementById('competencies');
  Object.entries(data.core_competencies).forEach(([cat, items]) => {
    const h = document.createElement('h4'); h.textContent = cat; h.style.color = '#cbd5e1'; h.style.margin='10px 0 6px';
    compEl.appendChild(h);
    items.forEach(i => {
      const b = document.createElement('span'); b.className='badge'; b.textContent=i; compEl.appendChild(b);
    });
  });

  // Tools
  const toolsEl = document.getElementById('tools');
  (data.tools || []).forEach(t => {
    const li = document.createElement('li'); li.textContent = t; toolsEl.appendChild(li);
  });

  // Timeline
  const tl = document.getElementById('timeline');
  data.experience.forEach(exp => {
    const li = document.createElement('li');
    li.innerHTML = `<strong style="color:#e6edf3">${exp.title}</strong> – ${exp.company} <span style="color:#94a3b8">(${exp.date_range})</span><br/><span style="color:#9fb3c8">${exp.location}</span><ul style="margin:6px 0 0 16px;color:#cbd5e1">${exp.highlights.map(h=>`<li>${h}</li>`).join('')}</ul>`;
    tl.appendChild(li);
  });

  // Skills bar chart (horizontal)
  const barCtx = document.getElementById('skillsBar');
  const labels = Object.keys(data.core_competencies);
  const values = labels.map(k => Math.min(10, (data.core_competencies[k] || []).length + 5)); // simple heuristic
  if (window.Chart && barCtx) {
    new Chart(barCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Competency breadth', data: values, borderWidth: 1 }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        scales: {
          x: { suggestedMin: 0, suggestedMax: 10, grid: { display: false } },
          y: { grid: { display: false } }
        },
        plugins: { legend: { display: false }, tooltip: { enabled: true } }
      }
    });
  }

  // Use‑Cases page
  const uc = document.getElementById('useCases');
  if (uc) {
    data.use_cases.forEach(u => {
      const div = document.createElement('div');
      div.className='item';
      div.innerHTML = `
        <h3>${u.title}</h3>
        <p><strong>Context:</strong> ${u.context}</p>
        <p><strong>Problem:</strong> ${u.problem}</p>
        <p><strong>Actions:</strong></p>
        <ul>${u.actions.map(a=>`<li>${a}</li>`).join('')}</ul>
        <p><strong>Result:</strong> ${u.result}</p>
      `;
      uc.appendChild(div);
    });
  }

  // Footer year
  document.getElementById('year').textContent = new Date().getFullYear();
}
document.addEventListener('DOMContentLoaded', loadProfile);
