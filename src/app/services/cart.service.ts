import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserService, User } from './user.service';
export interface CartItem {
  id: number;
  quantity: number;
  price: number;
  name: string;
  image: string;
}


@Injectable({
  providedIn: 'root'
})
export class CartService {
  constructor(private userService: UserService) { }

  private getCurrentUser(): User | null {
    const user = this.userService.getLoggedInUser();
    if (!user) {
      console.log('No logged-in user found');
    }
    return user;
  }

  getCartItems(): Observable<CartItem[]> {
    const user = this.getCurrentUser();
    return user ? user.cart.asObservable() : new BehaviorSubject<CartItem[]>([]).asObservable();
  }

  addToCart(item: CartItem): void {
    const user = this.getCurrentUser();
    if (!user) return;

    const currentItems = user.cart.value;
    const existingItem = currentItems.find(i => i.id === item.id);

    if (existingItem) {
      existingItem.quantity += 1;
      user.cart.next([...currentItems]);
    } else {
      user.cart.next([...currentItems, { ...item, quantity: 1 }]);
    }

    this.saveCart(user);
  }

  removeFromCart(itemId: number): void {
    const user = this.getCurrentUser();
    if (!user) return;

    const currentItems = user.cart.value;
    const item = currentItems.find(i => i.id === itemId);

    if (item && item.quantity > 1) {
      const updated = currentItems.map(i =>
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );
      user.cart.next(updated);
    } else {
      user.cart.next(currentItems.filter(i => i.id !== itemId));
    }
    this.saveCart(user);
  }

  clearCart(): void {
    const user = this.getCurrentUser();
    if (!user) return;

    user.cart.next([]);
    this.saveCart(user);
  }

  getTotalItems(): number {
    const user = this.getCurrentUser();
    if (!user) return 0;

    return user.cart.value.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalPrice(): number {
    const user = this.getCurrentUser();
    if (!user) return 0;

    return user.cart.value.reduce((total, item) => total + item.quantity * item.price, 0);
  }

   saveCart(user: User): void {
    const users = this.userService.getUsers();

    const updatedUsers = users.map(u =>
      u.email === user.email ? {
        ...u,
        cart: new BehaviorSubject<CartItem[]>(user.cart.value), // refresh cart
        isLoggedIn: u.isLoggedIn
      } : u
    );

    // save using internal userService method
    (this.userService as any).saveUsers(updatedUsers);
  }
}
