using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CloudWebApp.Data;
using CloudWebApp.Services;
using CloudWebApp.Models;

namespace CloudWebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectRepository _repo;
        private readonly WeatherService _weather;
        private readonly AirQualityService _aq;

        public ProjectsController(
            IProjectRepository repo,
            WeatherService weather,
            AirQualityService aq)
        {
            _repo = repo;
            _weather = weather;
            _aq = aq;
        }

        [HttpGet]
        public async Task<IEnumerable<Project>> GetAll() =>
            await _repo.GetAllAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> Get(int id)
        {
            var project = await _repo.GetByIdAsync(id);
            return project is null ? NotFound() : project;
        }

        [HttpGet("{id}/weather")]
        public async Task<IActionResult> GetWeather(int id)
        {
            var p = await _repo.GetByIdAsync(id);
            if (p is null) return NotFound();
            var w = await _weather.GetCurrentAsync(p.Latitude, p.Longitude);
            return Ok(w);
        }

        [HttpGet("{id}/airquality")]
        public async Task<IActionResult> GetAirQuality(int id)
        {
            var p = await _repo.GetByIdAsync(id);
            if (p is null) return NotFound();
            var a = await _aq.GetCurrentAsync(p.Latitude, p.Longitude);
            return Ok(a);
        }

        [HttpGet("{id}/forecast")]
        public async Task<IActionResult> GetForecast(int id)
        {
            var p = await _repo.GetByIdAsync(id);
            if (p is null) return NotFound();
            var f = await _weather.GetForecastAsync(p.Latitude, p.Longitude);
            return Ok(f);
        }

        [HttpGet("{id}/history")]
        public async Task<IActionResult> GetHistory(int id, [FromQuery] long dt)
        {
            var p = await _repo.GetByIdAsync(id);
            if (p is null) return NotFound();
            var h = await _weather.GetHistoryAsync(p.Latitude, p.Longitude, dt);
            return Ok(h);
        }
    }
}
