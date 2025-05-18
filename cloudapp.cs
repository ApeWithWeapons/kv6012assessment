// File: kv6012\_cloud\_app.csproj <Project Sdk="Microsoft.NET.Sdk.Web"> <PropertyGroup> <TargetFramework>net9.0</TargetFramework> </PropertyGroup> <ItemGroup> <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="7.0.0" /> <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="7.0.0"> <PrivateAssets>all</PrivateAssets> </PackageReference> <PackageReference Include="Swashbuckle.AspNetCore" Version="6.2.3" /> </ItemGroup> </Project>

// File: appsettings.json
{
"ConnectionStrings": {
"ProjectsDb": "Server=tcp\:sqlserver-part-1.database.windows.net,1433;Initial Catalog=sqldb-kv6012;Persist Security Info=False;User ID=bishr;Password=INCORRECT\@123;"
},
"OpenWeather": {
"ApiKey": "cb214b6a6101271b4097eef2cf169230"
},
"Map": {
"ApiKey": "pk.eyJ1IjoidzIxMDAiLCJhIjoiY21hdTA5aTdtMHd2cjJqc2hyNHJxODJ1cSJ9.LnbcNHDrVGzR7Y9hWRId0g"
},
"Logging": {
"LogLevel": {
"Default": "Information",
"Microsoft.AspNetCore": "Warning"
}
}
}

// File: Program.cs
using Microsoft.EntityFrameworkCore;
using CloudWebApp.Data;
using CloudWebApp.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
builder.Services.AddDbContext<DataContext>(opt =>
opt.UseSqlServer(builder.Configuration.GetConnectionString("ProjectsDb")));
builder.Services.AddHttpClient<WeatherService>();
builder.Services.AddHttpClient<AirQualityService>();
builder.Services.AddScoped\<IProjectRepository, ProjectRepository>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
app.UseSwagger();
app.UseSwaggerUI();
}
app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapControllers();
app.Run();

// File: Data/DataContext.cs
using Microsoft.EntityFrameworkCore;
using CloudWebApp.Models;

namespace CloudWebApp.Data
{
public class DataContext : DbContext
{
public DataContext(DbContextOptions<DataContext> options) : base(options) { }
public DbSet<Project> Projects { get; set; }
}
}

// File: Models/Project.cs
namespace CloudWebApp.Models
{
public class Project
{
public int Id { get; set; }
public string Title { get; set; }
public string Description { get; set; }
public double Latitude { get; set; }
public double Longitude { get; set; }
public bool RequiresCrane { get; set; }
public bool RequiresDigger { get; set; }
}
}

// File: Data/IProjectRepository.cs
using CloudWebApp.Models;

namespace CloudWebApp.Data
{
public interface IProjectRepository
{
Task\<IEnumerable<Project>> GetAllAsync();
Task\<Project?> GetByIdAsync(int id);
}
}

// File: Data/ProjectRepository.cs
using CloudWebApp.Models;
using Microsoft.EntityFrameworkCore;

namespace CloudWebApp.Data
{
public class ProjectRepository : IProjectRepository
{
private readonly DataContext \_context;
public ProjectRepository(DataContext context)
{
\_context = context;
}
public async Task\<IEnumerable<Project>> GetAllAsync() =>
await \_context.Projects.AsNoTracking().ToListAsync();

```
    public async Task<Project?> GetByIdAsync(int id) =>
        await _context.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
}
```

}

// File: Services/WeatherService.cs
using System.Net.Http.Json;
using CloudWebApp.Models;

namespace CloudWebApp.Services
{
public class WeatherService
{
private readonly string \_key;
private readonly HttpClient \_http;
public WeatherService(IConfiguration config, HttpClient http)
{
\_key = config\["OpenWeather\:ApiKey"];
\_http = http;
}
public async Task\<CurrentWeather?> GetCurrentAsync(double lat, double lon)
{
var url = \$"[https://api.openweathermap.org/data/2.5/weather?lat={lat}\&lon={lon}\&appid={\_key}\&units=metric](https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={_key}&units=metric)";
return await \_http.GetFromJsonAsync<CurrentWeather>(url);
}
public async Task\<ForecastWeather?> GetForecastAsync(double lat, double lon)
{
var url = \$"[https://api.openweathermap.org/data/2.5/forecast/daily?lat={lat}\&lon={lon}\&cnt=8\&appid={\_key}\&units=metric](https://api.openweathermap.org/data/2.5/forecast/daily?lat={lat}&lon={lon}&cnt=8&appid={_key}&units=metric)";
return await \_http.GetFromJsonAsync<ForecastWeather>(url);
}
public async Task\<HistoricalWeather?> GetHistoryAsync(double lat, double lon, long timestamp)
{
var url = \$"[https://api.openweathermap.org/data/2.5/onecall/timemachine?lat={lat}\&lon={lon}\&dt={timestamp}\&appid={\_key}\&units=metric](https://api.openweathermap.org/data/2.5/onecall/timemachine?lat={lat}&lon={lon}&dt={timestamp}&appid={_key}&units=metric)";
return await \_http.GetFromJsonAsync<HistoricalWeather>(url);
}
}
}

// File: Services/AirQualityService.cs
using System.Net.Http.Json;
using CloudWebApp.Models;

namespace CloudWebApp.Services
{
public class AirQualityService
{
private readonly string \_key;
private readonly HttpClient \_http;
public AirQualityService(IConfiguration config, HttpClient http)
{
\_key = config\["OpenWeather\:ApiKey"];
\_http = http;
}
public async Task\<AirQuality?> GetCurrentAsync(double lat, double lon)
{
var url = \$"[https://api.openweathermap.org/data/2.5/air\_pollution?lat={lat}\&lon={lon}\&appid={\_key}](https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={_key})";
var data = await \_http.GetFromJsonAsync<AirQualityResponse>(url);
return data?.List?.FirstOrDefault();
}
}
}

// File: Models/WeatherModels.cs
namespace CloudWebApp.Models
{
public class CurrentWeather { public WeatherMain Main { get; set; } public Wind Wind { get; set; } public WeatherCondition\[] Weather { get; set; } }
public class ForecastWeather { public ForecastDay\[] List { get; set; } }
public class HistoricalWeather { public HourlyData\[] Hourly { get; set; } }
public class AirQualityResponse { public AirQuality\[] List { get; set; } }
public class WeatherMain { public double Temp { get; set; } }
public class Wind { public double Speed { get; set; } }
public class WeatherCondition { public string Main { get; set; } }
public class ForecastDay { public long Dt { get; set; } public Temperature Temp { get; set; } public WeatherCondition\[] Weather { get; set; } }
public class Temperature { public double Day { get; set; } }
public class HourlyData { public long Dt { get; set; } public double Temp { get; set; } }
public class AirQuality { public int Aqi { get; set; } }
}

// File: Controllers/ProjectsController.cs
using CloudWebApp.Data;
using CloudWebApp.Models;
using CloudWebApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace CloudWebApp.Controllers
{
\[ApiController]
\[Route("api/\[controller]")]
public class ProjectsController : ControllerBase
{
private readonly IProjectRepository \_repo;
private readonly WeatherService \_weather;
private readonly AirQualityService \_aq;

```
    public ProjectsController(IProjectRepository repo, WeatherService weather, AirQualityService aq)
    {
        _repo = repo;
        _weather = weather;
        _aq = aq;
    }

    [HttpGet]
    public async Task<IEnumerable<Project>> GetAll() => await _repo.GetAllAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Project>> Get(int id)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p == null) return NotFound();
        return p;
    }

    [HttpGet("{id}/weather")]
    public async Task<IActionResult> GetWeather(int id)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p == null) return NotFound();
        var w = await _weather.GetCurrentAsync(p.Latitude, p.Longitude);
        return Ok(w);
    }

    [HttpGet("{id}/airquality")]
    public async Task<IActionResult> GetAirQuality(int id)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p == null) return NotFound();
        var a = await _aq.GetCurrentAsync(p.Latitude, p.Longitude);
        return Ok(a);
    }

    [HttpGet("{id}/forecast")]
    public async Task<IActionResult> GetForecast(int id)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p == null) return NotFound();
        var f = await _weather.GetForecastAsync(p.Latitude, p.Longitude);
        return Ok(f);
    }

    [HttpGet("{id}/history")]
    public async Task<IActionResult> GetHistory(int id, [FromQuery] long dt)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p == null) return NotFound();
        var h = await _weather.GetHistoryAsync(p.Latitude, p.Longitude, dt);
        return Ok(h);
    }
}
```

}

// File: wwwroot/index.html

<!DOCTYPE html>

<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Construction Projects Dashboard</title>
    <link href="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css" rel="stylesheet" />
    <script src="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js"></script>
</head>
<body>
    <h1>Projects</h1>
    <select id="projects"></select>
    <div id="map" style="width: 600px; height: 400px;"></div>
    <div id="weather"></div>
    <div id="airquality"></div>
    <script src="js/app.js"></script>
</body>
</html>

// File: wwwroot/js/app.js
(async () => {
const sel = document.getElementById('projects');
const projects = await fetch('/api/projects').then(r => r.json());
projects.forEach(p => {
const opt = document.createElement('option');
opt.value = p.id;
opt.textContent = p.title;
sel.appendChild(opt);
});
mapboxgl.accessToken = document.head.querySelector('script\[src\*="mapbox-gl.js"]').src.match(/access\_token=(\[^&]+)/)\[1] || '');
let map;
const update = async () => {
const id = sel.value;
const p = projects.find(x => x.id == id);
if (!map) {
map = new mapboxgl.Map({ container: 'map', style: 'mapbox://styles/mapbox/streets-v11', center: \[p.longitude, p.latitude], zoom: 12 });
new mapboxgl.Marker().setLngLat(\[p.longitude, p.latitude]).addTo(map);
}
const w = await fetch(`/api/projects/${id}/weather`).then(r => r.json());
document.getElementById('weather').textContent = `Temp: ${w.main.temp}°C, Wind: ${w.wind.speed} m/s`;
const a = await fetch(`/api/projects/${id}/airquality`).then(r => r.json());
document.getElementById('airquality').textContent = `Air Quality Index: ${a.aqi}`;
};
sel.addEventListener('change', update);
sel.selectedIndex = 0;
update();
})();
