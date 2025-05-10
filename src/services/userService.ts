import { supabase } from '../repositories/supabase/SupabaseClient';
import { User } from '../types';

class UserService {
  async getUsers(): Promise<User[]> {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        avatar,
        user_roles (
          roles (
            name
          )
        )
      `);

    if (error) throw error;
    
    return users.map(user => ({
      id: user.id,
      name: user.name || 'Unknown User',
      email: user.email,
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}`,
      role: user.user_roles?.[0]?.roles?.name || 'user'
    }));
  }

  async getUserById(id: string): Promise<User | undefined> {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        avatar,
        user_roles (
          roles (
            name
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) return undefined;
    
    return {
      id: user.id,
      name: user.name || 'Unknown User',
      email: user.email,
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}`,
      role: user.user_roles?.[0]?.roles?.name || 'user'
    };
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return null;
    
    return this.getUserById(user.id);
  }

  async setCurrentUser(userId: string): Promise<User | null> {
    const user = await this.getUserById(userId);
    if (!user) return null;
    
    return user;
  }
}

const userService = new UserService();
export default userService;