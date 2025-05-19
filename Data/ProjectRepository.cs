using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CloudWebApp.Models;

namespace CloudWebApp.Data
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly DataContext _context;

        public ProjectRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Project>> GetAllAsync() =>
            await _context.Projects.AsNoTracking().ToListAsync();

        public async Task<Project?> GetByIdAsync(int id) =>
            await _context.Projects
                          .AsNoTracking()
                          .FirstOrDefaultAsync(p => p.Id == id);
    }
}
