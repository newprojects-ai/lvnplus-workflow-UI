import { supabase } from '../repositories/supabase/SupabaseClient';
import { User } from '../types';

class UserService {
  async getUsers(): Promise<User[]> {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, avatar');

    if (error) throw error;
    
    return users.map(user => ({
      id: user.id,
      name: user.name || 'Unknown User',
      email: user.email,
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}`,
      role: 'user' // Default role, will be updated by getUserRole if needed
    }));
  }

  async getUserRole(userId: string): Promise<string> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('roles (name)')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return 'user';
    return data.roles?.name || 'user';
  }

  async getUserById(id: string): Promise<User | undefined> {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, avatar')
      .eq('id', id)
      .single();

    if (error) return undefined;
    
    const role = await this.getUserRole(id);
    
    return {
      id: user.id,
      name: user.name || 'Unknown User',
      email: user.email,
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}`,
      role
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