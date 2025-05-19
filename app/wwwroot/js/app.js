(async () => {
  console.log('🟢 Starting initialization…');
  
  // 1) Fetch the project list
  console.log('🟢 Fetching /api/projects');
  const resp = await fetch('/api/projects');
  if (!resp.ok) throw new Error(`/api/projects returned ${resp.status}`);
  const projects = await resp.json();
  console.log('🟢 Received projects:', projects);

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
  console.log('🟢 Initialising Leaflet map…');
  const first = projects[0];
  const map   = L.map('map').setView([first.latitude, first.longitude], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 })
   .addTo(map);
  const marker = L.marker([first.latitude, first.longitude]).addTo(map);

  // 4) Function to load weather/air/forecast for a project
  async function loadFor(id) {
    console.log(`🟢 Loading weather/AQ/forecast for project ${id}`);
    
    const [wFetch, aFetch, fFetch] = await Promise.allSettled([
      fetch(`/api/projects/${id}/weather`),
      fetch(`/api/projects/${id}/airquality`),
      fetch(`/api/projects/${id}/forecast`),
    ]);

    // Weather & AQ
    if (wFetch.status === 'fulfilled' && wFetch.value.ok && aFetch.status === 'fulfilled' && aFetch.value.ok) {
      const w = await wFetch.value.json();
      const a = await aFetch.value.json();
      console.log('🟢 Weather:', w, 'AQ:', a);
      document.getElementById('weather-info').textContent =
        `Temp: ${w.main.temp}°C • Wind: ${w.wind.speed} m/s • AQI: ${a.aqi}`;
    } else {
      console.error('🔴 Weather/AQ failed', wFetch, aFetch);
      document.getElementById('weather-info').textContent = 'Weather/AQ unavailable';
    }

    // Forecast
    if (fFetch.status === 'fulfilled' && fFetch.value.ok) {
      const f = await fFetch.value.json();
      console.log('🟢 Forecast:', f);
      document.getElementById('forecast-info').textContent =
        f.list.map(d => {
          const date = new Date(d.dt * 1000).toLocaleDateString();
          return `${date}: ${d.temp.day}°C — ${d.weather[0].main}`;
        }).join('\n');
    } else {
      console.error('🔴 Forecast failed', fFetch);
      document.getElementById('forecast-info').textContent = 'Forecast unavailable';
    }
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

  // Auto-refresh weather & forecast every 5 minutes
setInterval(() => {
  const id = sel.value;
  loadFor(id);
}, 300_000);


})();
