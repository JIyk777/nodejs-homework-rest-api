const express = require("express");

const ctrl = require("../../controllers/contacts");

const router = express.Router();

router.get("/", ctrl.getAllContacts);

router.get("/:contactId", ctrl.getContactById);

router.post("/", ctrl.addNewContact);

router.delete("/:contactId", ctrl.removeContactById);

router.patch("/:contactId", ctrl.updateContact);

router.patch("/:contactId/favorite", ctrl.updateStatusContact);

module.exports = router;
