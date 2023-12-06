import AdminJS from "adminjs";
import * as AdminJSMongoose from "@adminjs/mongoose";
import AdminJSExpress from "@adminjs/express";
import Connect from "connect-pg-simple";
import User from "./models/user-model.js";
import Book from "./models/book-model.js";
import Review from "./models/review-model.js";
import BookList from "./models/booklist-model.js";

const DEFAULT_ADMIN = {
  email: "kniu3@uwo.ca",
  password: "123456",
};

const authenticate = async (email, password) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

AdminJS.registerAdapter(AdminJSMongoose);

const adminJsOptions = {
  resources: [User, Book, Review, BookList],
  rootPath: "/admin",
};
const adminJs = new AdminJS(adminJsOptions);
const router = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
  authenticate,
  cookieName: 'adminjs',
  cookiePassword: 'sessionsecret'
});

export default router;
