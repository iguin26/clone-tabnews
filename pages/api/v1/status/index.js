import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const rawServerVersion = await database.query("SHOW server_version;");
  const serverVersion = rawServerVersion.rows[0].server_version;

  const rawMaxConnections = await database.query("SHOW max_connections;");
  const maxConnections = rawMaxConnections.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;

  const rawOpenedConnections = await database.query({
    text: "SELECT COUNT(*)::int as open_connections FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const openedConnections = rawOpenedConnections.rows[0].open_connections;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: serverVersion,
        max_connections: parseInt(maxConnections),
        opened_connections: openedConnections,
      },
    },
  });
}

export default status;
