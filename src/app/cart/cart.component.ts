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
  // Observable to track cart items changes
  cartItems = new BehaviorSubject<CartItem[]>([]);
  
  // Get all available products
  products: Product[] = ProductListComponent.getProducts();
  
  // Array to store cart items with their product details
  cartItemsAll: { product: Product; quantity: number }[] = [];
  
  // Track total price and items count
  totalPrice: number = 0;
  totalItems: number = 0;
  
  // Constructor with dependency injection
  constructor(private cartService: CartService, private userService: UserService) {
    // Subscribe to cart changes
    this.cartService.getCartItems().subscribe(items => {
      // Update cart items
      this.cartItems.next(items);
      // Update totals
      this.totalItems = this.cartService.getTotalItems();
      this.totalPrice = this.cartService.getTotalPrice();
    });
    
    // Initialize cart items with product details
    this.cartItemsAll = this.cartItems.value.map(item => ({
      product: this.products.find(p => p.id === item.id),
      quantity: item.quantity
    })).filter(item => item.product !== undefined) as { product: Product; quantity: number }[];
  }

  // Method to remove item from cart
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

  // Method to add item to cart
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
