var builder = DistributedApplication.CreateBuilder(args);

// PostgreSQL database with pgAdmin
var postgres = builder.AddPostgres("postgres")
    .WithPgAdmin()
    .WithDataVolume();

var heatmapdb = postgres.AddDatabase("heatmapdb");

// API service
var api = builder.AddProject<Projects.HeatTheMap_Api>("api")
    .WithReference(heatmapdb)
    .WithEnvironment("Ollama__BaseUrl", "http://localhost:11434")
    .WaitFor(heatmapdb)
    .WithExternalHttpEndpoints();

// Web frontend (React + Vite)
builder.AddNpmApp("web", "./HeatTheMap.Web")
    .WithReference(api)
    .WithEnvironment("VITE_API_URL", api.GetEndpoint("http"))
    .WithHttpEndpoint(port: 5173, env: "PORT")
    .WithExternalHttpEndpoints()
    .PublishAsDockerFile();

builder.Build().Run();