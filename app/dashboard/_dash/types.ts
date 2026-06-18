export type User = { id: string; email: string; paymentStatus: string };

export type DashSite = {
  id: string;
  name: string;
  fav: string;
  color: string;
  status: "live" | "draft";
  domain: string | null;
  vercel: string;
  edits: number;
  updated: string;
  accent: string;
  weight: number;
  createdAt: string;
};

export type Invoice = {
  id: string;
  date: string;
  desc: string;
  amount: number;
  type: "site" | "edit";
};

export type VercelConnection = {
  connected: boolean;
  account: string | null;
  email: string | null;
  teamId: string | null;
  since: string | null;
};

export type PageId =
  | "overview"
  | "analytics"
  | "domains"
  | "profile"
  | "security"
  | "connected"
  | "billing"
  | "notifications";
