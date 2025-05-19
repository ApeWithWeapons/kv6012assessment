(async () => {
  console.log(' Starting initialization…');
  const sel   = document.getElementById('project-select');
  const tbody = document.querySelector('#projects-table tbody');
  const map   = L.map('map');
  let marker;

  // Fetch projects
  const resp = await fetch('/api/projects');
  const projects = await resp.json();
  projects.forEach(p => {
    sel.add(new Option(p.title, p.id));
  });

  // Initialize map and marker
  const first = projects[0];
  map.setView([first.latitude, first.longitude], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
  marker = L.marker([first.latitude, first.longitude]).addTo(map);

  // Load data for a project
  async function loadFor(id) {
    const p = projects.find(x => x.id == id);
    // table
    tbody.innerHTML = '';
    const resources = await (await fetch(`/api/projects/${id}/resources`)).json();
    resources.forEach(r => {
      tbody.insertAdjacentHTML('beforeend',
        `<tr><td>${r.id}</td><td>${r.name}</td><td>${r.description}</td><td>${r.manager}</td><td>${r.location}</td></tr>`);
    });
    // map
    map.setView([p.latitude, p.longitude], 12);
    marker.setLatLng([p.latitude, p.longitude]);
    // weather & AQI
    const w = await (await fetch(`/api/projects/${id}/weather`)).json();
    const a = await (await fetch(`/api/projects/${id}/airquality`)).json();
    document.getElementById('weather-info').textContent =
      `Temp: ${w.main.temp}°C • Wind: ${w.wind.speed} m/s • AQI: ${a.aqi}`;
    document.getElementById('recommendation').textContent =
      w.wind.speed > 10 ? 'High wind – crane not advised.' : a.aqi > 100 ? 'Poor AQI – delay operations.' : 'Conditions normal.';
    // 8-day forecast
    const f = await (await fetch(`/api/projects/${id}/forecast`)).json();
    // show first 8 days
    document.getElementById('forecast-info').textContent =
      f.list.slice(0,8).map(d => {
        const date = new Date(d.dt * 1000).toLocaleDateString();
        return `${date}: ${d.temp.day}°C — ${d.weather[0].main}`;
      }).join('\n');
  }

  // historical
  document.getElementById('load-history').onclick = async () => {
    const date = document.getElementById('history-date').value;
    if (!date) return alert('Please select a date');
    const h = await (await fetch(`/api/projects/${sel.value}/weather/history?date=${date}`)).json();
    document.getElementById('history-data').textContent =
      `On ${date}: Temp ${h.main.temp}°C • Wind ${h.wind.speed} m/s • AQI: ${h.aqi}`;
  };

  // initial and selector hook
  sel.onchange = () => loadFor(sel.value);
  loadFor(first.id);

  setInterval(() => loadFor(sel.value), 300000);
})();
