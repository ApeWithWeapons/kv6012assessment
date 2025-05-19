(async () => {
  console.log('Initialization…');

  // 1) Fetch projects list
  const resp = await fetch('/api/projects');
  if (!resp.ok) throw new Error(`/api/projects returned ${resp.status}`);
  const projects = await resp.json();
  if (!Array.isArray(projects) || projects.length === 0) {
    throw new Error('No projects returned');
  }

  // 2) Populate selector & initial table
  const sel   = document.getElementById('project-select');
  const tbody = document.querySelector('#projects-table tbody');
  projects.forEach(p => {
    sel.add(new Option(p.title, p.id));
  });
  sel.addEventListener('change', onProjectChange);

  // 3) Initialize Leaflet map
  console.log('Initialising map…');
  const first = projects[0];
  const map   = L.map('map').setView([first.latitude, first.longitude], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18
  }).addTo(map);
  const marker = L.marker([first.latitude, first.longitude]).addTo(map);

  // 4) Wire history button
  document.getElementById('load-history')
          .addEventListener('click', loadHistory);

  // 5) Initial load for first project
  sel.value = first.id;
  onProjectChange({ target: sel });

  // === Handlers ===

  async function onProjectChange(e) {
    const id = e.target.value;
    updateTable(id);
    updateMap(id);
    loadCurrent(id);
    loadForecast(id);
  }

  async function updateTable(id) {
    tbody.innerHTML = '';
    try {
      const res = await fetch(`/api/projects/${id}/resources`);
      const items = await res.json();
      items.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${r.id}</td>
          <td>${r.name}</td>
          <td>${r.description}</td>
          <td>${r.manager}</td>
          <td>${r.location}</td>
        `;
        tbody.appendChild(tr);
      });
    } catch {
      tbody.innerHTML = '<tr><td colspan="5">Error loading resources</td></tr>';
    }
  }

  async function updateMap(id) {
    const project = projects.find(p => p.id == id);
    map.setView([project.latitude, project.longitude], 12);
    marker.setLatLng([project.latitude, project.longitude]);
  }

  async function loadCurrent(id) {
    const wi  = document.getElementById('weather-info');
    const rec = document.getElementById('recommendation');
    rec.textContent = ''; rec.classList.remove('warn');
    try {
      const [wRes, aRes] = await Promise.all([
        fetch(`/api/projects/${id}/weather`),
        fetch(`/api/projects/${id}/airquality`)
      ]);
      if (!wRes.ok || !aRes.ok) throw new Error();
      const w = await wRes.json();
      const a = await aRes.json();
      wi.textContent = 
        `Temp: ${w.main.temp}°C  •  Wind: ${w.wind.speed} m/s  •  AQI: ${a.aqi}`;

      // Conditional recommendations
      if (w.wind.speed > 9) {
        rec.classList.add('warn');
        rec.textContent = 'Wind too high – crane operations not advised.';
      } else if (a.aqi > 100) {
        rec.classList.add('warn');
        rec.textContent = 'AQI poor – postpone earth-moving work.';
      } else {
        rec.textContent = 'Conditions good – proceed as normal.';
      }
    } catch {
      wi.textContent = 'Weather/AQI unavailable';
      rec.textContent = '';
    }
  }

  async function loadForecast(id) {
    const fo = document.getElementById('forecast-info');
    fo.textContent = '';
    try {
      const res = await fetch(`/api/projects/${id}/forecast`);
      if (!res.ok) throw new Error();
      const f = await res.json();
      fo.textContent = f.list
        .map(d => {
          const date = new Date(d.dt * 1000)
                         .toLocaleDateString();
          return `${date}: ${d.temp.day}°C — ${d.weather[0].main}`;
        })
        .join('\n');
    } catch {
      fo.textContent = 'Forecast unavailable';
    }
  }
// Example – adjust to your existing loadFor() pattern
document.getElementById('load-history').addEventListener('click', () => {
  const date = document.getElementById('history-date').value;
  if (!date) return alert('Please pick a date');
  fetch(`/api/projects/${currentId}/weather/history?date=${date}`)
    .then(r => r.json())
    .then(data => {
      document.getElementById('history-data').textContent =
        `On ${date}: wind ${data.windSpeed} mph, AQI ${data.aqiIndex}`;
    })
    .catch(() => {
      document.getElementById('history-data').textContent = 'Error loading history';
    });
});

  async function loadHistory() {
    const hd = document.getElementById('history-data');
    hd.textContent = '';
    const date = document.getElementById('history-date').value;
    if (!date) return alert('Select a date first.');
    try {
      const res = await fetch(
        `/api/projects/${sel.value}/weather/history?date=${date}`
      );
      if (!res.ok) throw new Error();
      const h = await res.json();
      hd.textContent = 
        `On ${date}: wind ${h.windSpeed} m/s, AQI ${h.aqiIndex}.`;
    } catch {
      hd.textContent = 'Historical data unavailable';
    }
  }

  // 6) Auto-refresh every 5 minutes
  setInterval(() => loadCurrent(sel.value), 300_000);
})();
