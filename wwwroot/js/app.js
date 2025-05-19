// Replace with your actual Mapbox token
const MAPBOX_TOKEN = '<YOUR_MAPBOX_ACCESS_TOKEN>';

let map;
let currentProjectId = null;

// Initialise when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  flatpickr('#history-date', { maxDate: 'today' });
  document.getElementById('load-history').addEventListener('click', loadHistory);

  loadProjects();
});

// ELEMENT 3 & 4: Fetch and display projects
async function loadProjects() {
  try {
    const res = await fetch('/api/projects');
    const projects = await res.json();
    const select = document.getElementById('project-select');

    projects.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      select.append(opt);
    });

    select.addEventListener('change', () => {
      currentProjectId = select.value;
      onProjectChange(currentProjectId);
    });
  } catch (err) {
    console.error(err);
    alert('Failed to load projects');
  }
}

// Called when a project is selected
function onProjectChange(id) {
  loadResources(id);
  updateMap(id);
  loadWeather(id);
  loadForecast(id);
}

// ELEMENT 4: Load and render resources table
async function loadResources(id) {
  const tbody = document.querySelector('#resource-table tbody');
  tbody.innerHTML = '';
  try {
    const res = await fetch(`/api/projects/${id}/resources`);
    const items = await res.json();
    items.forEach(r => {
      const row = `<tr>
        <td>${r.id}</td>
        <td>${r.name}</td>
        <td>${r.description}</td>
        <td>${r.manager}</td>
        <td>${r.location}</td>
      </tr>`;
      tbody.insertAdjacentHTML('beforeend', row);
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="5">Error loading resources</td></tr>';
  }
}

// ELEMENT 5: Initialise Mapbox
function initMap() {
  mapboxgl.accessToken = MAPBOX_TOKEN;
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-0.1276, 51.5074], // Default to London
    zoom: 5
  });
}

// ELEMENT 5: Pan & place marker
async function updateMap(id) {
  try {
    const res = await fetch(`/api/projects/${id}`);
    const project = await res.json();
    const [lat, lon] = project.coordinates; // [latitude, longitude]

    map.flyTo({ center: [lon, lat], zoom: 12 });
    new mapboxgl.Marker().setLngLat([lon, lat]).addTo(map);
  } catch (err) {
    console.error(err);
  }
}

// ELEMENT 6 & 7: Live weather + AQI + recommendations
async function loadWeather(id) {
  const cw  = document.getElementById('current-weather');
  const aqi = document.getElementById('aqi');
  const rec = document.getElementById('recommendation');
  rec.textContent = ''; rec.className = 'alert';

  try {
    const res = await fetch(`/api/projects/${id}/weather/current`);
    const { windSpeed, aqiIndex } = await res.json();

    cw.textContent = `Wind speed: ${windSpeed} mph`;
    aqi.textContent = `AQI: ${aqiIndex}`;

    // Conditional recommendations
    if (windSpeed > 20) {
      rec.classList.add('warn');
      rec.textContent = 'High wind – crane operations not advised.';
    } else if (aqiIndex > 100) {
      rec.classList.add('warn');
      rec.textContent = 'Poor air quality – postpone earth-moving work.';
    } else {
      rec.classList.add('ok');
      rec.textContent = 'Conditions good – proceed as normal.';
    }
  } catch (err) {
    console.error(err);
    rec.classList.add('warn');
    rec.textContent = 'Error loading weather/AQI.';
  }
}

// ELEMENT 8a: 8-day forecast
async function loadForecast(id) {
  const fc = document.getElementById('forecast');
  fc.innerHTML = '';

  try {
    const res = await fetch(`/api/projects/${id}/weather/forecast`);
    const days = await res.json();
    days.forEach(d => {
      const div = document.createElement('div');
      div.className = 'forecast-day';
      div.innerHTML = `<strong>${d.date}</strong>: ${d.summary}`;
      fc.append(div);
    });
  } catch (err) {
    console.error(err);
    fc.textContent = 'Error loading forecast.';
  }
}

// ELEMENT 8b: Historical data lookup
async function loadHistory() {
  const out = document.getElementById('history-data');
  out.textContent = '';
  const date = document.getElementById('history-date').value;
  if (!date) return alert('Please select a date.');

  try {
    const res = await fetch(
      `/api/projects/${currentProjectId}/weather/history?date=${date}`
    );
    const { windSpeed, aqiIndex } = await res.json();
    out.textContent = `On ${date}: wind ${windSpeed} mph, AQI ${aqiIndex}.`;
  } catch (err) {
    console.error(err);
    out.textContent = 'Error loading historical data.';
  }
}
