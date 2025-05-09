import { User } from '../types';
import { mockUsers } from '../mockData';

class UserService {
  private users: User[] = [...mockUsers];
  private currentUser: User = this.users[0]; // Default to first user

  getUsers(): Promise<User[]> {
    return Promise.resolve([...this.users]);
  }

  getUserById(id: string): Promise<User | undefined> {
    return Promise.resolve(this.users.find(u => u.id === id));
  }

  getCurrentUser(): Promise<User> {
    return Promise.resolve(this.currentUser);
  }

  setCurrentUser(userId: string): Promise<User | null> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return Promise.resolve(null);
    
    this.currentUser = user;
    return Promise.resolve(user);
  }
}

const userService = new UserService();
export default userService;