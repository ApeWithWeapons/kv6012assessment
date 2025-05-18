using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudWebApp.Models;
using Microsoft.Extensions.Configuration;

namespace CloudWebApp.Services
{
    public class AirQualityService
    {
        private readonly string _key;
        private readonly HttpClient _http;

        public AirQualityService(IConfiguration config, HttpClient http)
        {
            _key = config["OpenWeather:ApiKey"];
            _http = http;
        }

        public async Task<AirQuality?> GetCurrentAsync(double lat, double lon)
        {
            var url = $"https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={_key}";
            var data = await _http.GetFromJsonAsync<AirQualityResponse>(url);
            return data?.List?.FirstOrDefault();
        }
    }
}
