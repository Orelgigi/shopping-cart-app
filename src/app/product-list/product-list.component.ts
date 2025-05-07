import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../services/cart.service';
import { UserService } from '../services/user.service';
export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {
  products: Product[] = ProductListComponent.getProducts();

  constructor(private cartService: CartService) {
  }

  addToCart(product: Product) {
    const item: CartItem = {...product, quantity: 1 };
    this.cartService.addToCart(item);
  }

  static getProducts(): Product[] {
    return [
      { id: 1, name: 'Green Hat', price: 92, image: 'assets/images/green_hat.jpg' },
      { id: 2, name: 'T shirt monky', price: 92, image: 'assets/images/T_shirt_man.jpg' },
      { id: 3, name: 'T shirt white', price: 92, image: 'assets/images/T_shirt_white.jpg' },
      { id: 4, name: 'Shoes vans', price: 92, image: 'assets/images/shoes_vans.jpg' },
      { id: 5, name: 'Classic jeans', price: 92, image: 'assets/images/classic_jeans.jpg' },
      { id: 6, name: ' Men`s pants', price: 92, image: 'assets/images/mens_panel.jpg' },
      { id: 7, name: 'First step shoes', price: 92, image: 'assets/images/first_step_shoes.jpg' },
  
    ];
  }
}
