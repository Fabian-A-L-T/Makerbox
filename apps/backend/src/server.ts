import app from "./app";
import { backPort, backUrl } from "./config/app";

// --- Start ---
app.listen(backPort, () => {
  console.log(`🚀 Backend running at ${backUrl}`);
});
