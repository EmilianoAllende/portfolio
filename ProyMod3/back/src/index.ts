import server from "./server";
import { PORT } from "./config/envs";
import { initializeDataSource } from "./config/data.source";

const port = PORT ? PORT : 3001;

try {
  initializeDataSource();
  server.listen(PORT, () => {
    console.log(`Server listen on port ${port}`);
  });
} catch (error) {
  console.error("Error de servidor");
};