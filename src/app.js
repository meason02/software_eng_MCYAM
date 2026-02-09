const express = require("express");
const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Food Waste Management App – Docker scaffold running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
