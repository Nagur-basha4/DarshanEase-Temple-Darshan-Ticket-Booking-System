import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, adminsTable } from "@workspace/db";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router: IRouter = Router();

// POST /api/auth/login
router.post("/auth/login", async (req, res): Promise<void> => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required." });
    return;
  }

  const [admin] = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.username, String(username)));

  if (!admin) {
    res.status(401).json({ error: "Invalid credentials." });
    return;
  }

  const valid = await bcrypt.compare(String(password), admin.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials." });
    return;
  }

  req.session.adminId = admin.id;
  req.session.adminUsername = admin.username;

  res.json({ id: admin.id, username: admin.username });
});

// POST /api/auth/logout
router.post("/auth/logout", requireAdmin, (req, res): void => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// GET /api/auth/me
router.get("/auth/me", (req, res): void => {
  if (!req.session?.adminId) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }
  res.json({ id: req.session.adminId, username: req.session.adminUsername });
});

export default router;
