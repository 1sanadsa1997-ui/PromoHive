import fs from "fs/promises";
import path from "path";

export interface PromoRules {
  levels: {
    level: number;
    rewardLimit: number; // USD
    benefits?: string[];
  }[];
  withdrawal: {
    minAmount: number;
    feesPercent: number;
  };
  autoApproval: {
    enabled: boolean;
    minApprovalRate?: number;
  };
  features: Record<string, any>;
}

const DATA_DIR = path.resolve(process.cwd(), "server", "data");
const FILE = path.join(DATA_DIR, "promo-rules.json");

const DEFAULT: PromoRules = {
  levels: [
    { level: 0, rewardLimit: 9.9, benefits: ["Starter"] },
    { level: 1, rewardLimit: 70, benefits: ["Unlimited tasks"] },
    { level: 2, rewardLimit: 130, benefits: ["Premium features"] },
    { level: 3, rewardLimit: 180, benefits: ["VIP benefits"] },
  ],
  withdrawal: {
    minAmount: 10,
    feesPercent: 1.0,
  },
  autoApproval: {
    enabled: false,
    minApprovalRate: 95,
  },
  features: {},
};

export async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // ignore
  }
}

export async function loadRules(): Promise<PromoRules> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as PromoRules;
    return parsed;
  } catch (err) {
    // write defaults
    await saveRules(DEFAULT);
    return DEFAULT;
  }
}

export async function saveRules(rules: PromoRules) {
  await ensureDataDir();
  await fs.writeFile(FILE, JSON.stringify(rules, null, 2), "utf8");
}

export async function resetRulesToDefault() {
  await saveRules(DEFAULT);
}

export default {
  loadRules,
  saveRules,
  resetRulesToDefault,
};
