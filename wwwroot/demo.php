<?php
// demo.php
$conn = new PDO(
    "sqlsrv:Server=kv6012-sqlserver.database.windows.net;Database=kv6012db",
    "sqladmin",
    "KV6012Strong!"
);
$projects = $conn->query("SELECT Id, Title FROM Projects")->fetchAll(PDO::FETCH_ASSOC);
?>
<!doctype html>
<html>
<head>
    <title>PHP Demo</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <link rel="stylesheet" href="/css/site.css" />
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
</head>
<body>
    <h1>PHP + jQuery Demo</h1>
    <select id="proj">
        <option>-- Select --</option>
        <?php foreach ($projects as $p): ?>
            <option value="<?= $p['Id'] ?>"><?= $p['Title'] ?></option>
        <?php endforeach; ?>
    </select>
    <div id="phpMap" style="height:400px;"></div>
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <script>
        const map = L.map('phpMap').setView([54.9,-1.6], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        $('#proj').change(function () {
            const id = $(this).val();
            $.getJSON(`/api/projects/${id}`, function (p) {
                map.setView([p.lat, p.lon], 14);
                L.marker([p.lat, p.lon]).addTo(map)
                    .bindPopup(p.title).openPopup();
            });
        });
    </script>
</body>
</html>