using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using kv6012assessment.Models;

namespace kv6012assessment.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IConfiguration _config;
    public ProjectsController(IConfiguration config) => _config = config;

    [HttpGet]
    public async Task<IEnumerable<Project>> Get()
    {
        await using var conn = new SqlConnection(
            _config.GetConnectionString("ProjectsDb"));
        return await conn.QueryAsync<Project>("SELECT * FROM Projects");
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Project>> Get(int id)
    {
        await using var conn = new SqlConnection(
            _config.GetConnectionString("ProjectsDb"));
        var project = await conn.QueryFirstOrDefaultAsync<Project>(
            "SELECT * FROM Projects WHERE Id = @id", new { id });
        return project is null ? NotFound() : Ok(project);
    }
}