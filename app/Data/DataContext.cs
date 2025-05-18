using Microsoft.EntityFrameworkCore;
using CloudWebApp.Models;

namespace CloudWebApp.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options)
            : base(options)
        {
        }

        public DbSet<Project> Projects { get; set; }
    }
}
