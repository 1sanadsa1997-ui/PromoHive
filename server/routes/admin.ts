import express, { RequestHandler } from "express";
import { loadRules, saveRules } from "../config/promo-rules";
import fs from "fs/promises";
import path from "path";

const router = express.Router();

// Admin auth middleware: expects header 'x-admin-password' equal to process.env.ADMIN_PASSWORD
const adminAuth: RequestHandler = (req, res, next) => {
  const pw = process.env.ADMIN_PASSWORD;
  const provided = (req.headers["x-admin-password"] as string) || req.query.pw || req.headers["authorization"]?.toString().replace(/^Bearer\s+/i, "");
  if (!pw) {
    return res.status(500).json({ error: "Admin password not configured on server" });
  }
  if (!provided || provided !== pw) {
    return res.status(401).json({ error: "Unauthorized - invalid admin credentials" });
  }
  next();
};

// Helpers to persist simple data (users/tasks/admins/withdrawals)
const DATA_DIR = path.resolve(process.cwd(), "server", "data");
async function readJSON(name: string) {
  try {
    const file = path.join(DATA_DIR, name + ".json");
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}
async function writeJSON(name: string, data: any) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const file = path.join(DATA_DIR, name + ".json");
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

// Routes
router.use(adminAuth);

router.get("/rules", async (req, res) => {
  const rules = await loadRules();
  res.json(rules);
});

router.post("/rules", async (req, res) => {
  try {
    const incoming = req.body;
    const current = await loadRules();
    const merged = { ...current, ...incoming };
    await saveRules(merged as any);
    res.json({ ok: true, rules: merged });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Users: simple approve/reject queue
router.get("/users/pending", async (req, res) => {
  const users = (await readJSON("pending-users")) || [];
  res.json(users);
});

router.post("/users/:id/approve", async (req, res) => {
  const id = req.params.id;
  let users = (await readJSON("pending-users")) || [];
  const idx = users.findIndex((u: any) => String(u.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const [user] = users.splice(idx, 1);
  // Move to approved users
  const approved = (await readJSON("approved-users")) || [];
  user.approvedAt = new Date().toISOString();
  approved.push(user);
  await writeJSON("approved-users", approved);
  await writeJSON("pending-users", users);
  res.json({ ok: true, user });
});

router.post("/users/:id/reject", async (req, res) => {
  const id = req.params.id;
  const reason = req.body.reason || "Rejected by admin";
  let users = (await readJSON("pending-users")) || [];
  const idx = users.findIndex((u: any) => String(u.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const [user] = users.splice(idx, 1);
  const rejected = (await readJSON("rejected-users")) || [];
  user.rejectedAt = new Date().toISOString();
  user.rejectionReason = reason;
  rejected.push(user);
  await writeJSON("rejected-users", rejected);
  await writeJSON("pending-users", users);
  res.json({ ok: true, user });
});

// Tasks management (create/edit/delete)
router.get("/tasks", async (req, res) => {
  const tasks = (await readJSON("tasks")) || [];
  res.json(tasks);
});

router.post("/tasks", async (req, res) => {
  const payload = req.body;
  const tasks = (await readJSON("tasks")) || [];
  const id = tasks.length ? Math.max(...tasks.map((t: any) => t.id)) + 1 : 1;
  const task = { id, ...payload, createdAt: new Date().toISOString() };
  tasks.push(task);
  await writeJSON("tasks", tasks);
  res.json({ ok: true, task });
});

router.put("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  const tasks = (await readJSON("tasks")) || [];
  const idx = tasks.findIndex((t: any) => Number(t.id) === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  tasks[idx] = { ...tasks[idx], ...req.body, updatedAt: new Date().toISOString() };
  await writeJSON("tasks", tasks);
  res.json({ ok: true, task: tasks[idx] });
});

router.delete("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  let tasks = (await readJSON("tasks")) || [];
  tasks = tasks.filter((t: any) => Number(t.id) !== id);
  await writeJSON("tasks", tasks);
  res.json({ ok: true });
});

// Withdrawals
router.get("/withdrawals", async (req, res) => {
  const w = (await readJSON("withdrawals")) || [];
  res.json(w);
});
router.post("/withdrawals/:id/approve", async (req, res) => {
  const id = String(req.params.id);
  const w = (await readJSON("withdrawals")) || [];
  const idx = w.findIndex((x: any) => String(x.id) === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  w[idx].status = "approved";
  w[idx].approvedAt = new Date().toISOString();
  await writeJSON("withdrawals", w);
  res.json({ ok: true, withdrawal: w[idx] });
});

// Admins management
router.get("/admins", async (req, res) => {
  const admins = (await readJSON("admins")) || [];
  res.json(admins);
});
router.post("/admins", async (req, res) => {
  const admins = (await readJSON("admins")) || [];
  const id = admins.length ? Math.max(...admins.map((a: any) => a.id)) + 1 : 1;
  const admin = { id, ...req.body, createdAt: new Date().toISOString() };
  admins.push(admin);
  await writeJSON("admins", admins);
  res.json({ ok: true, admin });
});
router.put("/admins/:id", async (req, res) => {
  const id = Number(req.params.id);
  const admins = (await readJSON("admins")) || [];
  const idx = admins.findIndex((a: any) => Number(a.id) === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  admins[idx] = { ...admins[idx], ...req.body, updatedAt: new Date().toISOString() };
  await writeJSON("admins", admins);
  res.json({ ok: true, admin: admins[idx] });
});

// Deposit methods (links / wallets)
router.get("/deposit-methods", async (req, res) => {
  const m = (await readJSON("deposit-methods")) || [];
  res.json(m);
});
router.post("/deposit-methods", async (req, res) => {
  const m = (await readJSON("deposit-methods")) || [];
  const id = m.length ? Math.max(...m.map((x: any) => x.id)) + 1 : 1;
  const item = { id, ...req.body, createdAt: new Date().toISOString() };
  m.push(item);
  await writeJSON("deposit-methods", m);
  res.json({ ok: true, item });
});

export default router;
