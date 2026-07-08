import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Keeping public properties for backward compatibility
  username: string = '';
  password: string = '';

  private allUsers: any[] = [];
  private isLoaded = false;

  constructor() {
    // Synchronously check session to make username immediately available
    const sessionUserStr = localStorage.getItem('shopease_current_user');
    if (sessionUserStr) {
      try {
        const user = JSON.parse(sessionUserStr);
        this.username = user.username;
        this.password = user.password;
      } catch (e) {}
    }
    this.initUserSession();
  }

  private async initUserSession() {
    await this.ensureUsersLoaded();
    const sessionUserStr = localStorage.getItem('shopease_current_user');
    if (sessionUserStr) {
      try {
        const user = JSON.parse(sessionUserStr);
        this.setCurrentUser(user);
      } catch (e) {
        console.error('Failed to parse current user session', e);
      }
    }
  }

  private setCurrentUser(user: any | null) {
    if (user) {
      this.username = user.username;
      this.password = user.password;
      localStorage.setItem('shopease_current_user', JSON.stringify(user));
    } else {
      this.username = '';
      this.password = '';
      localStorage.removeItem('shopease_current_user');
    }
  }

  getCurrentUser() {
    const sessionUserStr = localStorage.getItem('shopease_current_user');
    return sessionUserStr ? JSON.parse(sessionUserStr) : null;
  }

  async ensureUsersLoaded(): Promise<any[]> {
    if (this.isLoaded) {
      return this.allUsers;
    }

    let seedUsers: any[] = [];
    try {
      const response = await fetch('/data/users.json');
      if (response.ok) {
        seedUsers = await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch seed users from users.json', error);
      // Fallback seed user
      seedUsers = [{ username: 'Vimal', password: '12345', fullName: 'Vimaladharsan', email: 'vimal@example.com' }];
    }

    const localUsersStr = localStorage.getItem('shopease_users');
    let localUsers: any[] = [];
    if (localUsersStr) {
      try {
        localUsers = JSON.parse(localUsersStr);
      } catch (e) {
        console.error('Failed to parse local users', e);
      }
    }

    // Combine seed users and local storage users. Ensure uniqueness by username.
    const userMap = new Map<string, any>();
    seedUsers.forEach(u => userMap.set(u.username.toLowerCase(), u));
    localUsers.forEach(u => userMap.set(u.username.toLowerCase(), u));

    this.allUsers = Array.from(userMap.values());
    this.isLoaded = true;
    return this.allUsers;
  }

  async login(usernameInput: string, passwordInput: string): Promise<boolean> {
    await this.ensureUsersLoaded();
    const user = this.allUsers.find(
      u => u.username.toLowerCase() === usernameInput.toLowerCase() && u.password === passwordInput
    );

    if (user) {
      this.setCurrentUser(user);
      return true;
    }
    return false;
  }

  async register(newUser: any): Promise<{ success: boolean; message: string }> {
    await this.ensureUsersLoaded();
    const usernameLower = newUser.username.toLowerCase();
    
    const exists = this.allUsers.some(u => u.username.toLowerCase() === usernameLower);
    if (exists) {
      return { success: false, message: 'Username is already taken' };
    }

    // Add to all users
    this.allUsers.push(newUser);

    // Save to local storage users
    const localUsersStr = localStorage.getItem('shopease_users');
    let localUsers: any[] = [];
    if (localUsersStr) {
      try {
        localUsers = JSON.parse(localUsersStr);
      } catch (e) {}
    }
    localUsers.push(newUser);
    localStorage.setItem('shopease_users', JSON.stringify(localUsers));

    return { success: true, message: 'Registration successful' };
  }
  getPurchaseHistory(): any[] {
  const currentUser = this.getCurrentUser();
  return currentUser?.purchaseHistory || [];
}

addPurchase(order: any) {
  const currentUser = this.getCurrentUser();
  if (!currentUser) return;

  if (!currentUser.purchaseHistory) {
    currentUser.purchaseHistory = [];
  }

  currentUser.purchaseHistory.push(order);

  // Update current session
  this.setCurrentUser(currentUser);

  // Update stored users
  const localUsersStr = localStorage.getItem('shopease_users');
  if (localUsersStr) {
    const users = JSON.parse(localUsersStr);

    const index = users.findIndex(
      (u: any) =>
        u.username.toLowerCase() === currentUser.username.toLowerCase()
    );

    if (index !== -1) {
      users[index] = currentUser;
      localStorage.setItem('shopease_users', JSON.stringify(users));
    }
  }
}
  logout() {
    this.setCurrentUser(null);
  }
}
