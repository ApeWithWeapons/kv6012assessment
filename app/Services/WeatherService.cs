using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudWebApp.Models;
using Microsoft.Extensions.Configuration;

namespace CloudWebApp.Services
{
    public class WeatherService
    {
        private readonly string _key;
        private readonly HttpClient _http;

        public WeatherService(IConfiguration config, HttpClient http)
        {
            _key = config["OpenWeather:ApiKey"];
            _http = http;
        }

        public async Task<CurrentWeather?> GetCurrentAsync(double lat, double lon)
        {
            var url = $"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={_key}&units=metric";
            return await _http.GetFromJsonAsync<CurrentWeather>(url);
        }

        public async Task<ForecastWeather?> GetForecastAsync(double lat, double lon)
        {
            var url = $"https://api.openweathermap.org/data/2.5/forecast/daily?lat={lat}&lon={lon}&cnt=8&appid={_key}&units=metric";
            return await _http.GetFromJsonAsync<ForecastWeather>(url);
        }

        public async Task<HistoricalWeather?> GetHistoryAsync(double lat, double lon, long timestamp)
        {
            var url = $"https://api.openweathermap.org/data/2.5/onecall/timemachine?lat={lat}&lon={lon}&dt={timestamp}&appid={_key}&units=metric";
            return await _http.GetFromJsonAsync<HistoricalWeather>(url);
        }
    }
}
