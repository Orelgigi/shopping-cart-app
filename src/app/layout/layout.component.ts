// Import necessary Angular modules and services
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; 
import { UserService } from '../services/user.service';
import { CartService } from '../services/cart.service';

// Component decorator with metadata
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  // Constructor with dependency injection for required services
  constructor(
    private userService: UserService,    // Service for user management
    private router: Router,              // Service for navigation
    protected cartService: CartService   // Service for cart management
  ) {}

  // Method to handle user logout
  logout(): void {
    // Clear user session
    this.userService.logout();
    // Clear cart contents
    this.cartService.clearCart();
    // Navigate to login page
    this.router.navigate(['/login']);
  }
}
