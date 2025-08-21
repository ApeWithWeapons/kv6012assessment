<?php
// weather.php  –  PHP + jQuery 8-day forecast
$pdo = new PDO(
    "sqlsrv:Server=sqlserver-part-1.database.windows.net;Database=sqldb-kv6012",
    "bishr",
    "INCORRECT@123"
);

$projects = $pdo->query(
    "SELECT Project_id AS id, Project_name AS title, Geolocation
     FROM Projects"
)->fetchAll(PDO::FETCH_ASSOC);
?>
<!doctype html>
<html>
<head>
  <title>8-Day Forecast</title>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    body{font-family:Arial;margin:0;padding:20px}
    table{border-collapse:collapse;width:100%}
    th,td{padding:8px;border:1px solid #ccc}
    img{width:40px}
  </style>
</head>
<body>
  <h1>8-Day Weather Forecast</h1>
  <select id="proj">
    <option>-- Select project --</option>
    <?php foreach ($projects as $p): ?>
      <option value="<?= $p['id'] ?>"
              data-loc="<?= $p['Geolocation'] ?>">
        <?= htmlspecialchars($p['title']) ?>
      </option>
    <?php endforeach; ?>
  </select>

  <table id="forecastTable" style="display:none">
    <thead><tr><th>Date</th><th>Icon</th><th>Min / Max °C</th><th>Weather</th></tr></thead>
    <tbody></tbody>
  </table>

  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <script>
    const apiKey = 'cb214b6a6101271b4097eef2cf169230';

    $('#proj').change(function () {
      const loc = $(this).find(':selected').data('loc').split(',');
      const lat = loc[0], lon = loc[1];

      $.getJSON(
        `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=8&units=metric&appid=${apiKey}`,
        data => {
          $('#forecastTable tbody').empty();
          data.list.forEach(d => {
            const date   = new Date(d.dt * 1000).toLocaleDateString('en-GB', {weekday:'short', day:'2-digit', month:'short'});
            const icon   = `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`;
            const min    = Math.round(d.temp.min * 10) / 10;
            const max    = Math.round(d.temp.max * 10) / 10;
            const desc   = d.weather[0].description;

            $('#forecastTable tbody').append(
              `<tr>
                 <td>${date}</td>
                 <td><img src="${icon}" alt="${desc}"></td>
                 <td>${min}° / ${max}°</td>
                 <td>${desc}</td>
               </tr>`
            );
          });
          $('#forecastTable').show();
        }
      );
    });
  </script>
</body>
</html>