using System.Collections.Generic;
using System.Threading.Tasks;
using CloudWebApp.Models;

namespace CloudWebApp.Data
{
    public interface IProjectRepository
    {
        Task<IEnumerable<Project>> GetAllAsync();
        Task<Project?> GetByIdAsync(int id);
    }
}
