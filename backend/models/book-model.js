import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subTitle: { type: String },
    authors:  {type: String, required: true },
    description: { type: String },
    categories: { type: String },
    publisher: { type: String },
    publishedDate: { type: String },
    pageCount: { type: String },
    language: { type: String },
    salePrice: { type: Object },
    imgSrc: { type: String },
    selfLink: { type: String },
});

const Book = mongoose.model("Book", bookSchema);
export default Book;
