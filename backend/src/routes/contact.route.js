import express from "express";
import Contact from "../models/contact.model.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    const contact = new Contact({ name, email, message });
    await contact.save();
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

export default router;
