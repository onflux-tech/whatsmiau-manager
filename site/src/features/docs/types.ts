import type { LucideIcon } from "lucide-react";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type AuthType = "required" | "public";

export interface ApiParameter {
  name: string;
  type: string;
  required?: boolean;
  description: string;
  example?: string;
}

export interface ApiRequestBody {
  contentType: string;
  fields: ApiParameter[];
}

export interface ApiEndpoint {
  id: string;
  title: string;
  method: HttpMethod;
  path: string;
  description: string;
  auth: AuthType;
  parameters?: ApiParameter[];
  queryParams?: ApiParameter[];
  requestBody?: ApiRequestBody;
  responseExample?: string;
  curlExample: string;
  jsExample: string;
  streaming?: boolean;
  websocket?: boolean;
}

export interface ApiGroup {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  endpoints: ApiEndpoint[];
}
