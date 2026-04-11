export interface Workspace {
  id: string;
  name: string;
  url: string;
  api_key: string;
  icon: string;
  icon_color: string;
  icon_file: string;
  order: number;
  created: string;
  updated: string;
  collectionId?: string;
  collectionName?: string;
}

export interface HealthCheck {
  id: string;
  workspace: string;
  status: "up" | "down" | "auth_error";
  latency_ms: number;
  instances_total: number;
  instances_connected: number;
  created: string;
  updated: string;
}

export interface InstanceSnapshot {
  id: string;
  workspace: string;
  instance_id: string;
  name: string;
  status: "open" | "connecting" | "qr-code" | "closed";
  phone: string;
  created: string;
  updated: string;
}
