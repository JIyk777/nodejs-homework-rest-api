const { Schema, model } = require("mongoose");
const Joi = require("joi");

const contactSchema = new Schema({
  name: {
    type: String,
    required: [true, "Set name for contact"],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  
});

const Contact = model("contact", contactSchema);

const schemaUpdate = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  phone: Joi.string(),
  favorite: Joi.boolean(),
}).min(1);

const schemaUpdateFavorite = Joi.object({
  favorite: Joi.boolean(),
}).min(1);

const schemaAdd = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
});

const schemaValidationContact = {
  schemaUpdate,
  schemaUpdateFavorite,
  schemaAdd,
};

module.exports = {
  Contact,
  schemaValidationContact,
};
