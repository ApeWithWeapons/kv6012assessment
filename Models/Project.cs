using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace CloudWebApp.Models
{
    [Table("Projects")]
    public class Project
    {
        [Column("Project_id")]
        public byte Id { get; set; }

        [Column("Project_name")]
        public string Title { get; set; }

        [Column("Description")]
        public string Description { get; set; }

        [Column("Manager")]
        public string Manager { get; set; }

        [Column("Location")]
        public string Location { get; set; }

        // Raw "lat,lon" string from CSV
        [Column("Geolocation")]
        public string Geolocation { get; set; }

        // Computed from Geolocation, not stored in the database
        [NotMapped]
        public double Latitude
        {
            get
            {
                var parts = Geolocation
                    .Split(',', StringSplitOptions.TrimEntries);
                return double.Parse(parts[0]);
            }
        }

        [NotMapped]
        public double Longitude
        {
            get
            {
                var parts = Geolocation
                    .Split(',', StringSplitOptions.TrimEntries);
                return double.Parse(parts[1]);
            }
        }
    }
}
