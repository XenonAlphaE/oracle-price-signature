// server.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const swaggerUi = require("swagger-ui-express");

const solSignatureRoutes = require('./routes/solSignatureRoutes')

const app = express();
const PORT = 7001;
const KEYSTORE_DIR = path.join(process.cwd(),  "keys");
const PUBLIC_DIR = path.join(process.cwd(), "public");

// Ensure folders exist
fs.mkdirSync(KEYSTORE_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_DIR, { recursive: true });


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files from /public
app.use("/public", express.static(PUBLIC_DIR));


app.use('/api/solana', solSignatureRoutes);


const swaggerOutputPath = path.resolve(process.cwd(), "swagger-output.json");

if (fs.existsSync(swaggerOutputPath)) {
  const swaggerDocument = require(swaggerOutputPath);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log(`Swagger is running on http://localhost:${PORT}/api-docs`);

} else {
  console.warn("Swagger output file not found. Please generate it first.");
}


// ✅ Catch-all: always return 200 for any other route
app.use((req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
