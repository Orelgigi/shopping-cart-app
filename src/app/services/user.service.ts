import { Injectable } from '@angular/core';
import * as bcrypt from 'bcryptjs';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { CartItem } from './cart.service';

// User interface definition
export interface User {
  email: string;
  password: string;
  cart: BehaviorSubject<CartItem[]>;
  isLoggedIn: boolean;
}

// Injectable service for user management
@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Constants for local storage and password hashing
  private readonly USERS_KEY = 'registered_users';
  private readonly SALT_ROUNDS = 10;
  
  // Current user state
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Initialize current user from storage
    this.initializeCurrentUser();
  }

  // Initialize current user from storage
  private initializeCurrentUser(): void {
    try {
      const users = this.getUsers();
      const loggedInUser = users.find(u => u.isLoggedIn);
      if (loggedInUser) {
        this.currentUserSubject.next(loggedInUser);
      }
    } catch (error) {
      console.error('Error initializing current user:', error);
    }
  }

  // Hash password using bcrypt
  private async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.SALT_ROUNDS);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  // Compare plain password with hashed password
  private async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      throw new Error('Failed to compare passwords');
    }
  }

  // Save users to local storage
  private saveUsers(users: User[]): void {
    try {
      const plainUsers = users.map(u => ({
        email: u.email,
        password: u.password,
        cart: u.cart.value,
        isLoggedIn: u.isLoggedIn
      }));
      localStorage.setItem(this.USERS_KEY, JSON.stringify(plainUsers));
    } catch (error) {
      console.error('Error saving users:', error);
      throw new Error('Failed to save users');
    }
  }

  // Get users from local storage
  private getUsers(): User[] {
    try {
      const raw = localStorage.getItem(this.USERS_KEY);
      if (!raw) return [];

      const plainUsers = JSON.parse(raw);
      return plainUsers.map((user: any) => ({
        email: user.email,
        password: user.password,
        isLoggedIn: user.isLoggedIn,
        cart: new BehaviorSubject<CartItem[]>(user.cart || [])
      }));
    } catch (error) {
      console.error('Error getting users:', error);
      throw new Error('Failed to get users');
    }
  }

  // Register new user
  async registerUser(email: string, password: string): Promise<boolean> {
    try {
      const users = this.getUsers();
      if (users.find(u => u.email === email)) {
        throw new Error('User already exists');
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
    } catch (error) {
      console.error('Error registering user:', error);
      return false;
    }
  }

  // Check if user exists
  userExists(email: string): boolean {
    try {
      return this.getUsers().some(user => user.email === email);
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return false;
    }
  }

  // Login user
  async login(email: string, password: string): Promise<boolean> {
    try {
      const users = this.getUsers();
      const userIndex = users.findIndex(u => u.email === email);

      if (userIndex !== -1 && await this.comparePasswords(password, users[userIndex].password)) {
        users.forEach(u => u.isLoggedIn = false);
        users[userIndex].isLoggedIn = true;
        this.saveUsers(users);
        this.currentUserSubject.next(users[userIndex]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  }

  // Logout current user
  logout(): void {
    try {
      const users = this.getUsers();
      users.forEach(u => u.isLoggedIn = false);
      this.saveUsers(users);
      this.currentUserSubject.next(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  // Get currently logged in user
  getLoggedInUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Update user cart
  updateUserCart(user: User): void {
    try {
      const users = this.getUsers();
      const updatedUsers = users.map(u =>
        u.email === user.email ? {
          ...u,
          cart: new BehaviorSubject<CartItem[]>(user.cart.value),
          isLoggedIn: u.isLoggedIn
        } : u
      );
      this.saveUsers(updatedUsers);
    } catch (error) {
      console.error('Error updating user cart:', error);
    }
  }
}
