// site.js
let map;
let marker;

// initialise Leaflet once
document.addEventListener("DOMContentLoaded", () => {
    map = L.map('map').setView([54.9, -1.6], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    loadProjects();
});

async function loadProjects() {
    const res = await fetch('/api/projects');
    const projects = await res.json();
    const sel = document.getElementById('projectSelect');
    projects.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.title;
        sel.appendChild(opt);
    });
    sel.addEventListener('change', e => loadProject(e.target.value));
}

async function loadProject(id) {
    const p = await (await fetch(`/api/projects/${id}`)).json();
    document.getElementById('title').textContent = p.title;
    document.getElementById('description').textContent = p.description;
    document.getElementById('resources').textContent = p.resources;
    document.getElementById('co2').textContent = p.co2;
    document.getElementById('cost').textContent = p.cost;
    document.getElementById('projectDetails').classList.remove('hidden');

    map.setView([p.lat, p.lon], 14);
    if (marker) map.removeLayer(marker);
    marker = L.marker([p.lat, p.lon]).addTo(map).bindPopup(p.title).openPopup();

    loadWeather(p.lat, p.lon);
    loadAirQuality(p.lat, p.lon);
    loadForecast(p.lat, p.lon);
}

async function loadWeather(lat, lon) {
    const data = await (await fetch(`/api/weather/latest?lat=${lat}&lon=${lon}`)).json();
    document.getElementById('temp').textContent = data.temp;
    document.getElementById('wind').textContent = data.wind;
    const crane = document.getElementById('resources').textContent.toLowerCase().includes('crane');
    document.getElementById('weatherAdvice').textContent =
        (data.wind > 20 && crane) ? 'High wind – crane not advised' : 'Conditions normal';
    document.getElementById('weatherCard').classList.remove('hidden');
}

async function loadAirQuality(lat, lon) {
    const data = await (await fetch(`/api/airquality?lat=${lat}&lon=${lon}`)).json();
    document.getElementById('aqi').textContent = data.aqi;
    document.getElementById('aqiBand').textContent = data.band;
    const earth = document.getElementById('resources').textContent.toLowerCase().includes('digger');
    document.getElementById('airAdvice').textContent =
        (data.aqi > 2 && earth) ? 'Poor AQI – delay earth-moving' : 'Air OK for work';
    document.getElementById('airCard').classList.remove('hidden');
}

async function loadForecast(lat, lon) {
    const list = await (await fetch(`/api/weather/forecast?lat=${lat}&lon=${lon}`)).json();
    const tbody = document.getElementById('forecastBody');
    tbody.innerHTML = '';
    list.forEach(d => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${d.date}</td><td>${d.temp}</td><td>${d.weather}</td>`;
        tbody.appendChild(tr);
    });
    document.querySelector('.forecast-card').classList.remove('hidden');
}

async function loadHistory() {
    const date = document.getElementById('historyPicker').value;
    if (!date) return;
    const [lat, lon] = [marker.getLatLng().lat, marker.getLatLng().lng];
    try {
        const data = await (await fetch(`/api/weather/historical?lat=${lat}&lon=${lon}&date=${date}`)).json();
        document.getElementById('historyResult').textContent = `Temp: ${data.temp} °C`;
    } catch {
        document.getElementById('historyResult').textContent = 'Historical data requires paid API tier – demo only.';
    }
}