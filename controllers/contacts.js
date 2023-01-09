const { Contact, schemaValidationContact } = require("../models/contact");

const getAllContacts = async (req, res, next) => {
  const result = await Contact.find();
  res.status(200).json(result);
};

const getContactById = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await Contact.findById(contactId);
    res.json(result);
  } catch (error) {
    res.status(404).json({ message: "Not found" });
  }
};

const addNewContact = async (req, res, next) => {
  try {
    const value = await schemaValidationContact.schemaAdd.validateAsync(
      req.body
    );
    const { name, email, phone, favorite = false } = value;
    const result = await Contact.create({ name, email, phone, favorite });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      message: `missing required ${error.details[0].context.label} field`,
    });
  }
};

const removeContactById = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await Contact.findByIdAndRemove(contactId);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateContact = async (req, res, next) => {
  try {
    const value = await schemaValidationContact.schemaUpdate.validateAsync(
      req.body
    );

    const { contactId } = req.params;
    const result = await Contact.findByIdAndUpdate(contactId, value, {
      new: true,
    });
    res.status(200).json(result);
  } catch (error) {
    if (error.message === "Not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: "missing fields" });
  }
};

const updateStatusContact = async (req, res, next) => {
  try {
    const value =
      await schemaValidationContact.schemaUpdateFavorite.validateAsync(
        req.body
      );

    const { contactId } = req.params;
    const result = await Contact.findByIdAndUpdate(contactId, value, {
      new: true,
    });
    res.status(200).json(result);
  } catch (error) {
    if (error.message === "Not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: "missing field favorite" });
  }
};

module.exports = {
  getAllContacts,
  getContactById,
  addNewContact,
  removeContactById,
  updateContact,
  updateStatusContact,
};
