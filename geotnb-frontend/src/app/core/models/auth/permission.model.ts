export interface Permission {
    id: string;
    name: string;
    description: string;
    module: string;
    resource: string;
    action: PermissionAction;
    isActive: boolean;
  }
  
  export enum PermissionAction {
    CREATE = 'create',
    READ = 'read',
    UPDATE = 'update',
    DELETE = 'delete',
    EXECUTE = 'execute',
    VALIDATE = 'validate',
    PUBLISH = 'publish'
  }
  
  export interface RolePermission {
    roleId: string;
    permissionId: string;
    isGranted: boolean;
    grantedBy?: string;
    grantedAt?: Date;
  }
  
  export interface PermissionGroup {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
  }