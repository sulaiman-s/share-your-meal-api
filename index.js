import dotenv from "dotenv";
dotenv.config();
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import dbConnection from "./configs/db_connection.js";
import userRoutes from "./routes/UserRoutes.js";
import foodRoutes from "./routes/FoodRoutes.js";
import orderRoutes from "./routes/OrderRoutes.js";
import imageRoutes from "./routes/ImageRoutes.js";
import ReviewRoutes from "./routes/ReviewRoutes.js";
import NotificationRoutes from "./routes/NotificationRoutes.js";
const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
// CORS POLICY
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(cors());
// JSON PARSER
app.use(express.json());

// DB CONNECTION
dbConnection(process.env.DATABASE_URL);

// ROUTES
app.use("/public", express.static("public"));

app.use("/api/images", imageRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", ReviewRoutes);
app.use("/api/notifications", NotificationRoutes);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
