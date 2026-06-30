export interface ISecurityAuditEvent {
  id: string;
  name: string;
  outcome: 'success' | 'failed' | 'denied';
  occurredAt: string;
  payload: Record<string, unknown>;
}

export interface ISecurityAuditRepository {
  record(event: ISecurityAuditEvent): Promise<void>;
  getAll(): Promise<ISecurityAuditEvent[]>;
  clear(): Promise<void>;
}
