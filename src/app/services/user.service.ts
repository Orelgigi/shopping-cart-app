import { Injectable } from '@angular/core';
import * as bcrypt from 'bcryptjs';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from './cart.service';

export interface User {
  email: string;
  password: string;
  cart: BehaviorSubject<CartItem[]>;
  isLoggedIn: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USERS_KEY = 'registered_users';
  private readonly SALT_ROUNDS = 10;

  constructor() { }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  private async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /** Convert and save only plain cart array, not BehaviorSubject */
  private saveUsers(users: User[]): void {
    const plainUsers = users.map(u => ({
      email: u.email,
      password: u.password,
      cart: u.cart.value, // save only array
      isLoggedIn: u.isLoggedIn
    }));
    localStorage.setItem(this.USERS_KEY, JSON.stringify(plainUsers));
  }

  /** Converts plain user object to User with BehaviorSubject */
  getUsers(): User[] {
    const raw = localStorage.getItem(this.USERS_KEY);
    if (!raw) return [];

    const plainUsers = JSON.parse(raw);
    return plainUsers.map((user: any) => ({
      email: user.email,
      password: user.password,
      isLoggedIn: user.isLoggedIn,
      cart: new BehaviorSubject<CartItem[]>(user.cart || [])
    }));
  }

  async registerUser(email: string, password: string): Promise<boolean> {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) {
      console.log('User already exists');
      return false;
    }

    const hashedPassword = await this.hashPassword(password);
    const newUser: User = {
      email,
      password: hashedPassword,
      isLoggedIn: false,
      cart: new BehaviorSubject<CartItem[]>([])
    };

    users.push(newUser);
    this.saveUsers(users);
    return true;
  }

  userExists(email: string): boolean {
    return this.getUsers().some(user => user.email === email);
  }

  async login(email: string, password: string): Promise<boolean> {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex !== -1 && await this.comparePasswords(password, users[userIndex].password)) {
      users.forEach(u => u.isLoggedIn = false); // log out all users
      users[userIndex].isLoggedIn = true;
      this.saveUsers(users);
      return true;
    }

    return false;
  }

  logout(): void {
    const users = this.getUsers();
    users.forEach(u => u.isLoggedIn = false);
    this.saveUsers(users);
  }

  isLoggedIn(): boolean {
    return this.getLoggedInUser() !== null;
  }

  getLoggedInUser(): User | null {
    const users = this.getUsers();
    return users.find(u => u.isLoggedIn) || null;
  }
}
