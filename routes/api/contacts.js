const express = require("express");
const contacts = require("../../models/contacts");
const router = express.Router();
const Joi = require("joi");

const schemaUpdate = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  phone: Joi.string(),
}).min(1);

const schemaAdd = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
});

router.get("/", async (req, res, next) => {
  const result = await contacts.listContacts();
  res.status(200).json(result);
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    console.log(contactId);
    const result = await contacts.getContactById(contactId);
    res.json(result);
  } catch (error) {
    res.status(404).json({ message: "Not found" });
  }
});

router.post("/", async (req, res, next) => {
  try {
    const value = await schemaAdd.validateAsync(req.body);
    const { name, email, phone } = value;
    console.log(name);
    const result = await contacts.addContact(name, email, phone);
    res.status(201).json(result);
  } catch (error) {
    console.log(error.details);
    res.status(400).json({
      message: `missing required ${error.details[0].context.label} field`,
    });
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await contacts.removeContact(contactId);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.patch("/:contactId", async (req, res, next) => {
  try {
    const value = await schemaUpdate.validateAsync(req.body);

    const { contactId } = req.params;
    const result = await contacts.updateContact(contactId, value);
    res.status(200).json(result);
  } catch (error) {
    console.log(error.message);
    if (error.message === "Not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: "missing fields" });
  }
});

module.exports = router;
