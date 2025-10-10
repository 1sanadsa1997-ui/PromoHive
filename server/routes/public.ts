import express from "express";
import rulesModule from "../config/promo-rules";

const router = express.Router();

// Public API: return rules suitable for client consumption (hide internal levels like level 0)
router.get("/rules", async (req, res) => {
  try {
    const rules = await rulesModule.loadRules();
    // Return a filtered copy for public consumption: remove level 0 entries
    const publicRules = {
      ...rules,
      levels: (rules.levels || []).filter((l) => l.level !== 0),
    };
    res.json(publicRules);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? String(err) });
  }
});

export default router;
