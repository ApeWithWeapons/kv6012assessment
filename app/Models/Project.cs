using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace CloudWebApp.Models
{
    [Table("Projects")]
    public class Project
    {
        [Column("Project_id")]
        public int Id { get; set; }

        [Column("Project_name")]
        public string Title { get; set; }

        [Column("Description")]
        public string Description { get; set; }

        [Column("Manager")]
        public string Manager { get; set; }

        [Column("Location")]
        public string Location { get; set; }

        // the raw “lat, lon” string from your CSV
        [Column("Geolocation")]
        public string Geolocation { get; set; }

        // computed properties so your front‐end and services can still use latitude/longitude
        [NotMapped]
        public double Latitude
        {
            get
            {
                var parts = Geolocation.Split(',', StringSplitOptions.TrimEntries);
                return double.Parse(parts[0]);
            }
        }

        [NotMapped]
        public double Longitude
        {
            get
            {
                var parts = Geolocation.Split(',', StringSplitOptions.TrimEntries);
                return double.Parse(parts[1]);
            }
        }
    }
}
