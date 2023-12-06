import express from "express";
const app = express();

import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import configurePassport from "./config/passport.js";
configurePassport(passport);

import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const PORT = process.env.PORT || 5000;

//enable Cross-origin resource sharing
app.use(cors());
import authRoute from "./routes/auth.js";
import verifyEmailRoute from "./routes/verifyEmail.js";
import bookListRoute from "./routes/bookList.js";
import bookRoute from "./routes/book.js";
import reviewRoute from "./routes/review.js";
import adminRoute from "./admin.js";

//connect to database
mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

//middleware
app.use("/admin", adminRoute);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//default route for testing deploy
app.get("/", (req, res) => {
  res.send("Hello World!");
});

//API docs
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "BookStore API",
      description: "BookStore API Information",
      contact: {
        name: "kniu3@uwo.ca",
      },
    },
  },
  apis: ["./routes/*.js"],
};
//routes
//public routes
app.use("/api/auth", authRoute);
app.use("/api/verify-email", verifyEmailRoute);

//private routes
app.use(
  "/api/book-list",
  passport.authenticate("jwt", { session: false }),
  bookListRoute
);
app.use(
  "/api/book",
  passport.authenticate("jwt", { session: false }),
  bookRoute
);
app.use(
  "/api/review",
  passport.authenticate("jwt", { session: false }),
  reviewRoute
);
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//listen the server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
