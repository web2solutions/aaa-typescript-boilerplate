export interface RequestCreateOrganization {
  name: string;
  address?: Record<string, any>[];
  phone?: Record<string, any>[];
  email?: Record<string, any>[];
  users?: string[];
}
