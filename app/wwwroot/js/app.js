(async () => {
  const sel = document.getElementById('projects');
  const projects = await fetch('/api/projects').then(r => r.json());

  projects.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.title;
    sel.appendChild(opt);
  });

  mapboxgl.accessToken = document.head
    .querySelector('script[src*="mapbox-gl.js"]')
    .src.match(/access_token=([^&]+)/)?.[1] || '';

  let map;
  async function update() {
    const id = sel.value;
    const p = projects.find(x => x.id == id);
    if (!map) {
      map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [p.longitude, p.latitude],
        zoom: 12
      });
      new mapboxgl.Marker()
        .setLngLat([p.longitude, p.latitude])
        .addTo(map);
    }

    const w = await fetch(`/api/projects/${id}/weather`).then(r => r.json());
    document.getElementById('weather').textContent =
      `Temp: ${w.main.temp}°C, Wind: ${w.wind.speed} m/s`;

    const a = await fetch(`/api/projects/${id}/airquality`).then(r => r.json());
    document.getElementById('airquality').textContent =
      `Air Quality Index: ${a.aqi}`;
  }

  sel.addEventListener('change', update);
  sel.selectedIndex = 0;
  update();
})();
