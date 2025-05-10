import { supabase } from '../repositories/supabase/SupabaseClient';
import { User } from '../types';

class UserService {
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        avatar,
        roles:user_roles(
          role:roles(
            name
          )
        )
      `);

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return data.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name || 'Unnamed User',
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}`,
      role: user.roles?.[0]?.role?.name || 'user'
    }));
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.error('Error getting current user:', error);
      return null;
    }

    // Get user's roles
    const { data: roles } = await supabase
      .from('user_roles')
      .select(`
        role:roles(
          name
        )
      `)
      .eq('user_id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name || 'Unnamed User',
      avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || 'U')}`,
      role: roles?.role?.name || 'user'
    };
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        avatar,
        roles:user_roles(
          role:roles(
            name
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching user:', error);
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name || 'Unnamed User',
      avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'U')}`,
      role: data.roles?.[0]?.role?.name || 'user'
    };
  }
}

const userService = new UserService();
export default userService;