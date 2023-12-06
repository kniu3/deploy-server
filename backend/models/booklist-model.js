import mongoose from "mongoose";

const bookListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  books: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
  }],
  visibility: {
    type: String,
    enum: ["public", "private"],
    default: "public",
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
  }],
  last_edited: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

bookListSchema.methods.isPrivate = function () {
  return this.visibility === "private";
}

bookListSchema.methods.isPublic = function () {
  return this.visibility === "public";
}

bookListSchema.pre("save", async function (next) {
  this.last_edited = Date.now();
  next();
});

const BookList = mongoose.model("BookList", bookListSchema);

export default BookList;
