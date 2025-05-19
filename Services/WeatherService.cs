using System.Linq;
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
            _key  = config["OpenWeather:ApiKey"];
            _http = http;
        }

        // --- One Call daily models (paid plan) ---
        private class OneCallForecast
        {
            public DailyForecast[] daily { get; set; }
        }
        private class DailyForecast
        {
            public long dt { get; set; }
            public DailyTemp temp { get; set; }
            public WeatherCondition[] weather { get; set; }
        }
        private class DailyTemp { public double day { get; set; } }
        // ------------------------------------------

        // --- 3-hour forecast models (free plan) ---
        private class ThreeHourForecast
        {
            public ThreeHourEntry[] list { get; set; }
        }
        private class ThreeHourEntry
        {
            public long dt { get; set; }
            public WeatherMain main { get; set; }
            public WeatherCondition[] weather { get; set; }
        }

        public async Task<CurrentWeather?> GetCurrentAsync(double lat, double lon)
        {
            var url = $"https://api.openweathermap.org/data/2.5/weather" +
                      $"?lat={lat}&lon={lon}" +
                      $"&units=metric&appid={_key}";
            return await _http.GetFromJsonAsync<CurrentWeather>(url);
        }

        public async Task<ForecastWeather?> GetForecastAsync(double lat, double lon)
        {
            // 1) One Call daily
            try
            {
                var ocUrl = $"https://api.openweathermap.org/data/2.5/onecall" +
                            $"?lat={lat}&lon={lon}" +
                            $"&exclude=current,minutely,hourly,alerts" +
                            $"&units=metric&appid={_key}";
                var ocRoot = await _http.GetFromJsonAsync<OneCallForecast>(ocUrl);
                if (ocRoot?.daily?.Any() ?? false)
                {
                    var days = ocRoot.daily
                        .Take(8)
                        .Select(d => new ForecastDay {
                            Dt      = d.dt,
                            Temp    = new Temperature { Day = d.temp.day },
                            Weather = d.weather
                        })
                        .ToArray();
                    return new ForecastWeather { List = days };
                }
            }
            catch
            {
                // ignore and fallback
            }

            // 2) Fallback to 3-hour forecast
            try
            {
                var fhUrl = $"https://api.openweathermap.org/data/2.5/forecast" +
                            $"?lat={lat}&lon={lon}" +
                            $"&units=metric&appid={_key}";
                var fhRoot = await _http.GetFromJsonAsync<ThreeHourForecast>(fhUrl);
                if (fhRoot?.list?.Any() ?? false)
                {
                    var days = fhRoot.list
                        .Take(8)
                        .Select(f => new ForecastDay {
                            Dt      = f.dt,
                            Temp    = new Temperature { Day = f.main.Temp },
                            Weather = f.weather
                        })
                        .ToArray();
                    return new ForecastWeather { List = days };
                }
            }
            catch
            {
                // ignore
            }

            // If both fail, return empty
            return new ForecastWeather { List = new ForecastDay[0] };
        }

        /// <summary>
        /// Historical weather (last 5 days) via Time Machine
        /// </summary>
        public async Task<HistoricalWeather?> GetHistoryAsync(double lat, double lon, long timestamp)
        {
            try
            {
                var url = $"https://api.openweathermap.org/data/2.5/onecall/timemachine" +
                          $"?lat={lat}&lon={lon}&dt={timestamp}" +
                          $"&units=metric&appid={_key}";
                return await _http.GetFromJsonAsync<HistoricalWeather>(url);
            }
            catch
            {
                return null;
            }
        }
    }
}
