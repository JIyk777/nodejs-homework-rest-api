const express = require("express");

const ctrl = require("../../controllers/contacts");

const { authenticate } = require("../../middlewares");

const router = express.Router();

router.get("/", authenticate, ctrl.getAllContacts);

router.get("/:contactId", authenticate, ctrl.getContactById);

router.post("/", authenticate, ctrl.addNewContact);

router.delete("/:contactId", authenticate, ctrl.removeContactById);

router.patch("/:contactId", authenticate, ctrl.updateContact);

router.patch("/:contactId/favorite", authenticate, ctrl.updateStatusContact);

module.exports = router;
