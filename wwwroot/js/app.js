(async () => {
  console.log(' Starting initialization…');
  
  // 1) Fetch the project list
  console.log(' Fetching /api/projects');
  const resp = await fetch('/api/projects');
  if (!resp.ok) throw new Error(`/api/projects returned ${resp.status}`);
  const projects = await resp.json();
  console.log(' Received projects:', projects);

  if (!Array.isArray(projects) || projects.length === 0) {
    throw new Error('No projects were returned from /api/projects');
  }

  // 2) Populate the <select> and the table
  const sel   = document.getElementById('project-select');
  const tbody = document.querySelector('#projects-table tbody');

  projects.forEach(p => {
    sel.add(new Option(p.title, p.id));
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.title}</td>
      <td>${p.description}</td>
      <td>${p.manager}</td>
      <td>${p.location}</td>
    `;
    tbody.appendChild(tr);
  });

  // 3) Initialise map
  console.log('Initialising Leaflet map…');
  const first = projects[0];
  const map   = L.map('map').setView([first.latitude, first.longitude], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 })
   .addTo(map);
  const marker = L.marker([first.latitude, first.longitude]).addTo(map);

  // 4) Function to load weather/air/forecast for a project
  async function loadFor(id) {
    console.log(` Loading weather/AQ/forecast for project ${id}`);
    
    const [wFetch, aFetch, fFetch] = await Promise.allSettled([
      fetch(`/api/projects/${id}/weather`),
      fetch(`/api/projects/${id}/airquality`),
      fetch(`/api/projects/${id}/forecast`),
    ]);

    // WEATHER & AQI
    let w, a;
    if (wFetch.status === 'fulfilled' && wFetch.value.ok &&
        aFetch.status === 'fulfilled' && aFetch.value.ok) {
      w = await wFetch.value.json();
      a = await aFetch.value.json();
      document.getElementById('weather-info').textContent =
        `Temp: ${w.main.temp}°C • Wind: ${w.wind.speed} m/s • AQI: ${a.aqi}`;
    } else {
      console.error(' Weather/AQ failed', wFetch, aFetch);
      document.getElementById('weather-info').textContent = 'Weather/AQ unavailable';
    }
 // CONDITIONAL RECOMMENDATION
    const recEl = document.getElementById('recommendation');
    recEl.textContent = '';
    if (w && w.wind.speed > 10) {
      recEl.textContent = 'High wind – crane operations not advised.';
    } else if (a && a.aqi > 100) {
      recEl.textContent = 'Poor air quality – postpone earth-moving work.';
    } else {
      recEl.textContent = 'Conditions good – proceed as normal.';
    }
   // 8-day forecast (unique days)
      const f = await fetch(`/api/projects/${id}/forecast`).then(r => r.json());
      const seen = new Set();
      const lines = [];
      f.list.forEach(d => {
        const dateStr = new Date(d.dt * 1000).toLocaleDateString();
        if (!seen.has(dateStr) && lines.length < 8) {
          seen.add(dateStr);
          lines.push(`${dateStr}: ${d.temp.day}°C — ${d.weather[0].main}`);
        }
      });
      document.getElementById('forecast-info').textContent = lines.join('\n');
    }
  // 5) Wire up the selector
  sel.addEventListener('change', () => {
    const id = sel.value|0;
    const p  = projects.find(x => x.id === id);
    map.setView([p.latitude, p.longitude], 12);
    marker.setLatLng([p.latitude, p.longitude]);
    loadFor(id);
  });

  // 6) Do the first load
  loadFor(first.id);
// 7) Historical data lookup
document.getElementById('load-history').onclick = async () => {
  const isoDate = document.getElementById('history-date').value;           // "YYYY-MM-DD"
  if (!isoDate) return alert('Please select a date');

const res = await fetch(`/api/projects/${sel.value}/weather/history?date=${isoDate}`);
  if (!res.ok) {
    document.getElementById('history-data').textContent = 'Historical data unavailable';
    return;
  }
  const h = await res.json();
  document.getElementById('history-data').textContent =
    `On ${new Date(isoDate).toLocaleDateString()}: Temp ${h.main.temp}°C • Wind ${h.wind.speed} m/s • AQI: ${h.aqi}`;
};

  
  // Auto-refresh weather & forecast every 5 minutes
setInterval(() => {
  const id = sel.value;
  loadFor(id);
}, 300_000);

})();
