export const PROTOCOL_VERSION = "1" as const;

export type ServiceName =
  | "agent-core"
  | "inference-service"
  | "memory-service"
  | "portal";

export interface HealthResponse {
  protocolVersion: typeof PROTOCOL_VERSION;
  service: ServiceName;
  status: "ok";
}

export function healthResponse(service: ServiceName): HealthResponse {
  return {
    protocolVersion: PROTOCOL_VERSION,
    service,
    status: "ok",
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    requestId?: string;
  };
}

export interface CloudDirectoryRecordV1 {
  type: "merka.cloud.directory.v1";
  cloudId: string;
}

export interface CloudDirectoryRegistrationRequestV1 {
  signedRecord: string;
}

export interface CloudDirectoryEntryV1 {
  record: CloudDirectoryRecordV1;
  signedRecord: string;
  createdAt: string;
}

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatCompletionRequest {
  model?: string;
  messages: readonly ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: readonly {
    index: number;
    message: {
      role: "assistant";
      content: string;
    };
    finishReason: string | null;
  }[];
}

export type DocumentMetadata = Readonly<
  Record<string, string | number | boolean | null>
>;

export interface IndexDocument {
  id: string;
  text: string;
  metadata?: DocumentMetadata;
}

export interface IndexDocumentsRequest {
  dataset: string;
  documents: readonly IndexDocument[];
}

export interface MemorySearchRequest {
  dataset: string;
  query: string;
  scope: "global" | "local";
  entityIds?: readonly string[];
}

export interface MemorySearchResponse {
  answer: string;
  context: unknown;
}
