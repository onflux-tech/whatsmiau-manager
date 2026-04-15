import pb from "./pocketbase";

type Method = "GET" | "POST" | "PUT" | "DELETE";

async function proxyFetch<T = unknown>(
  method: Method,
  wid: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `/api/proxy/${wid}${path}`;

  const headers: Record<string, string> = {
    Authorization: pb.authStore.token,
  };

  const init: RequestInit = { method, headers };

  if (method !== "GET" && body === undefined) {
    body = {};
  }

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  const res = await fetch(url, init);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Proxy error ${res.status}`);
  }

  const ct = res.headers.get("Content-Type") || "";
  if (ct.includes("application/json")) {
    return res.json() as Promise<T>;
  }

  return res as unknown as T;
}

// Instance operations
export const proxy = {
  listInstances: (wid: string) => proxyFetch<InstanceItem[]>("GET", wid, "/instance"),

  createInstance: (wid: string, data: { instanceName: string }) =>
    proxyFetch("POST", wid, "/instance", data),

  deleteInstance: (wid: string, iid: string) => proxyFetch("DELETE", wid, `/instance/${iid}`),

  connect: (wid: string, iid: string, data?: { number?: string }) =>
    proxyFetch<ConnectResponse>("POST", wid, `/instance/${iid}/connect`, data),

  logout: (wid: string, iid: string) => proxyFetch("POST", wid, `/instance/${iid}/logout`, {}),

  getWebhook: (wid: string, iid: string) =>
    proxyFetch<{ webhook: WebhookConfig }>("GET", wid, `/webhook/${iid}`).then((r) => r.webhook),

  setWebhook: (wid: string, iid: string, data: Partial<WebhookConfig>) =>
    proxyFetch("POST", wid, `/webhook/${iid}`, { webhook: data }),

  getInstanceFull: (wid: string, iid: string) =>
    proxyFetch<InstanceFull[]>("GET", wid, "/instance").then(
      (list) => list.find((i) => i.id === iid) ?? null,
    ),

  updateInstance: (wid: string, iid: string, data: InstanceUpdatePayload) =>
    proxyFetch("PUT", wid, `/instance/${iid}`, data),

  syncInstances: (wid: string) => proxyFetch("POST", wid, "/sync"),

  sendMessage: (wid: string, iid: string, type: string, body: unknown) =>
    proxyFetch("POST", wid, `/instance/${iid}/message/${type}`, body),

  checkNumber: (wid: string, iid: string, numbers: string[]) =>
    proxyFetch<{ exists: boolean; jid: string }[]>(
      "POST",
      wid,
      `/instance/${iid}/chat/check-number`,
      { numbers },
    ),
};

async function alertFetch<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `/api/alerts${path}`;
  const headers: Record<string, string> = { Authorization: pb.authStore.token };
  const init: RequestInit = { method, headers };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Alert API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const alertApi = {
  list: (params: { workspace?: string; unread?: boolean } = {}) => {
    const qs = new URLSearchParams();
    if (params.workspace) qs.set("workspace", params.workspace);
    if (params.unread) qs.set("unread", "true");
    return alertFetch<Alert[]>("GET", `?${qs.toString()}`);
  },

  markRead: (id: string) => alertFetch("PATCH", `/${id}/read`),

  markAllRead: (workspace?: string) => {
    const qs = workspace ? `?workspace=${workspace}` : "";
    return alertFetch<{ marked: number }>("PATCH", `/read-all${qs}`);
  },

  clearRead: (workspace?: string) => {
    const qs = workspace ? `?workspace=${workspace}` : "";
    return alertFetch<{ deleted: number }>("DELETE", `${qs}`);
  },
};

// Types
interface InstanceItem {
  id: string;
  name: string;
  status: string;
  phone: string;
}

export interface ConnectResponse {
  base64?: string;
  pairingCode?: string;
  connected?: boolean;
  message?: string;
}

export interface WebhookConfig {
  url: string;
  enabled?: boolean;
  events?: string[];
  byEvents?: boolean;
  base64?: boolean;
}

export interface ProxyConfig {
  proxyHost: string;
  proxyPort: string;
  proxyProtocol: string;
  proxyUsername: string;
  proxyPassword: string;
}

export interface InstanceFull {
  id: string;
  remoteJID?: string;
  webhook?: WebhookConfig;
  proxyHost?: string;
  proxyPort?: string;
  proxyProtocol?: string;
  proxyUsername?: string;
  proxyPassword?: string;
}

interface InstanceUpdatePayload {
  proxyHost?: string;
  proxyPort?: string;
  proxyProtocol?: string;
  proxyUsername?: string;
  proxyPassword?: string;
}

export interface Alert {
  id: string;
  workspace: string;
  instance_snapshot: string;
  instance_name: string;
  kind: "disconnected" | "reconnected" | "qr_pending";
  read: boolean;
  created: string;
}
