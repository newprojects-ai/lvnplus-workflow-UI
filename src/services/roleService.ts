import { supabase } from '../repositories/supabase/SupabaseClient';

export interface Role {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  roleId: string;
  permission: string;
}

class RoleService {
  async getRoles(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data.map(this.mapToRole);
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new Error('Invalid UUID format for user ID');
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        role:roles (*)
      `)
      .eq('user_id', userId);
      
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data) return [];
    
    return data.map(item => this.mapToRole(item.role));
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    // Validate UUID format for both IDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId) || !uuidRegex.test(roleId)) {
      throw new Error('Invalid UUID format');
    }

    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role_id: roleId });
      
    if (error) throw error;
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    // Validate UUID format for both IDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId) || !uuidRegex.test(roleId)) {
      throw new Error('Invalid UUID format');
    }

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId);
      
    if (error) throw error;
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(roleId)) {
      throw new Error('Invalid UUID format for role ID');
    }

    const { data, error } = await supabase
      .from('role_permissions')
      .select('*')
      .eq('role_id', roleId);
      
    if (error) throw error;
    return data.map(this.mapToPermission);
  }

  private mapToRole(data: any): Role {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapToPermission(data: any): Permission {
    return {
      id: data.id,
      roleId: data.role_id,
      permission: data.permission
    };
  }
}

export const roleService = new RoleService();