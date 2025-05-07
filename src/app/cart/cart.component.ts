import { Component } from '@angular/core';
import { CartService, CartItem } from '../services/cart.service';
import { ProductListComponent, Product } from '../product-list/product-list.component';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../services/user.service';
@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})

export class CartComponent {
  cartItems = new BehaviorSubject<CartItem[]>([]);
  products: Product[] = ProductListComponent.getProducts();
  cartItemsAll: { product: Product; quantity: number }[] = [];
  totalPrice: number = 0;
  totalItems: number = 0;
  
  constructor(private cartService: CartService,private userService: UserService) {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems.next(items);
      this.totalItems = this.cartService.getTotalItems();
      this.totalPrice = this.cartService.getTotalPrice();
    });
  this.cartItemsAll = this.cartItems.value.map(item => ({
    product: this.products.find(p => p.id === item.id),
    quantity: item.quantity
  })).filter(item => item.product !== undefined) as { product: Product; quantity: number }[];
  }

  removeToCart(product: Product): void {
    // Call service to remove item from cart
    this.cartService.removeFromCart(product.id);
    
    // Subscribe to cart updates to refresh the view
    this.cartService.getCartItems().subscribe(items => {
      // Update the cart items observable
      this.cartItems.next(items);
      
      // Update total items count and price
      this.totalItems = this.cartService.getTotalItems();
      this.totalPrice = this.cartService.getTotalPrice();
      
      // Update cart items with product details for display
      this.cartItemsAll = this.cartItems.value.map(item => ({
        product: this.products.find(p => p.id === item.id),
        quantity: item.quantity
      })).filter(item => item.product !== undefined) as { product: Product; quantity: number }[];
    });
  }

  addToCart(product: Product): void {
    // Find the item in current cart
    const item = this.cartItems.value.find(item => item.id === product.id);
    
    // Add item to cart through service
    this.cartService.addToCart(item as CartItem);
    
    // Subscribe to cart updates to refresh the view
    this.cartService.getCartItems().subscribe(items => {
      // Update the cart items observable
      this.cartItems.next(items);
      
      // Update total items count and price
      this.totalItems = this.cartService.getTotalItems();
      this.totalPrice = this.cartService.getTotalPrice();
      
      // Update cart items with product details for display
      this.cartItemsAll = this.cartItems.value.map(item => ({
        product: this.products.find(p => p.id === item.id),
        quantity: item.quantity
      })).filter(item => item.product !== undefined) as { product: Product; quantity: number }[];
    });
  }
}
