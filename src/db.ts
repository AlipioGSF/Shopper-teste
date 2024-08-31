import { Client } from "pg";

const client = new Client({
  host: "postgres-data", // Nome do serviço no Docker Compose
  user: "postgres",
  password: "a123",
  database: "shopper",
  port: 5432,
});

client
  .connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Connection error", err.stack));

export default client;
