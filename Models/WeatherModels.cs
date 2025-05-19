namespace CloudWebApp.Models
{
    public class CurrentWeather
    {
        public WeatherMain Main { get; set; }
        public Wind Wind { get; set; }
        public WeatherCondition[] Weather { get; set; }
    }

    public class ForecastWeather
    {
        public ForecastDay[] List { get; set; }
    }

    public class HistoricalWeather
    {
        public HourlyData[] Hourly { get; set; }
    }

    public class AirQualityResponse
    {
        public AirQuality[] List { get; set; }
    }

    public class WeatherMain
    {
        public double Temp { get; set; }
    }

    public class Wind
    {
        public double Speed { get; set; }
    }

    public class WeatherCondition
    {
        public string Main { get; set; }
    }

    public class ForecastDay
    {
        public long Dt { get; set; }
        public Temperature Temp { get; set; }
        public WeatherCondition[] Weather { get; set; }
    }

    public class Temperature
    {
        public double Day { get; set; }
    }

    public class HourlyData
    {
        public long Dt { get; set; }
        public double Temp { get; set; }
    }

    public class AirQuality
    {
        public int Aqi { get; set; }
    }
}
