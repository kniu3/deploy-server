import Joi from 'joi';

const registerValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(30).required(),
        isActive: Joi.boolean().required(),
    });
    return schema.validate(data);
};

const localLoginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(30).required(),
    });
    return schema.validate(data);
};

const bookListValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(30).required(),
        description: Joi.string().min(3).max(30),
        visibility: Joi.string().valid("public", "private").required(),
        user: Joi.string().required(),
    });
    return schema.validate(data);
}

const bookValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string().min(3).required(),
        subTitle: Joi.string().min(3),
        authors: Joi.string().required(),
        description: Joi.string().min(3),
        categories: Joi.string(),
        publisher: Joi.string(),
        publishedDate: Joi.string(),
        pageCount: Joi.string(),
        language: Joi.string(),
        salePrice: Joi.object(),
        imgSrc: Joi.string(),
        selfLink: Joi.string(),
    });
    return schema.validate(data);
}

const reviewValidation = (data) => {
    const schema = Joi.object({
        user: Joi.string().required(),
        booklist: Joi.string().required(),
        review: Joi.string().min(3).required(),
    });
    return schema.validate(data);
}

export default {
    registerValidation,
    localLoginValidation,
    bookListValidation,
    bookValidation,
    reviewValidation,
};
