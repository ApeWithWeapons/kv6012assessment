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
async function loadForecast(lat, lon) {
    const list = await (await fetch(`/api/weather/forecast?lat=${lat}&lon=${lon}`)).json();
    const tbody = document.getElementById('forecastBody');
    tbody.innerHTML = '';     // clear old rows

    list.forEach(d => {
        tbody.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${d.date}</td>
                <td><img src="${d.icon}" alt="${d.desc}" width="40" /></td>
                <td>${d.min}° / ${d.max}°</td>
                <td>${d.desc}</td>
            </tr>
        `);
    });
    document.querySelector('.forecast-card').classList.remove('hidden');
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
  document.getElementById('load-history').addEventListener('click', async () => {
    const date = document.getElementById('history-date').value;
    if (!date) return alert('Please select a date.');
    try {
      const res = await fetch(`/api/projects/${sel.value}/weather/history?date=${date}`);
      if (!res.ok) throw new Error(`History returned ${res.status}`);
      const h = await res.json();
      document.getElementById('history-data').textContent =
        `On ${date}: Temp ${h.main.temp}°C • Wind ${h.wind.speed} m/s • AQI ${h.aqi}`;
    } catch (e) {
      console.error(e);
      document.getElementById('history-data').textContent = 'Historical data unavailable';
    }
  });
  
  // Auto-refresh weather & forecast every 5 minutes
setInterval(() => {
  const id = sel.value;
  loadFor(id);
}, 300_000);

})();
