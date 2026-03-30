import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Medicine } from '../models/medicine.model';

@Injectable({ providedIn: 'root' })
export class CartService {
    private cartItems = new BehaviorSubject<CartItem[]>([]);
    cartItems$ = this.cartItems.asObservable();

    private isCartOpen = new BehaviorSubject<boolean>(false);
    isCartOpen$ = this.isCartOpen.asObservable();

    constructor() { }

    toggleCart() {
        this.isCartOpen.next(!this.isCartOpen.value);
    }

    openCart() {
        this.isCartOpen.next(true);
    }

    closeCart() {
        this.isCartOpen.next(false);
    }

    addToCart(medicine: Medicine, quantity: number = 1) {
        const currentItems = this.cartItems.value;
        const existingItem = currentItems.find(item => item.medicine.medicineId === medicine.medicineId);

        if (existingItem) {
            existingItem.quantity += quantity;
            if (existingItem.quantity > medicine.stock) {
                existingItem.quantity = medicine.stock;
            }
        } else {
            currentItems.push({ medicine, quantity });
        }

        this.cartItems.next([...currentItems]);
    }

    removeFromCart(medicineId: number) {
        const updatedItems = this.cartItems.value.filter(item => item.medicine.medicineId !== medicineId);
        this.cartItems.next(updatedItems);
    }

    updateQuantity(medicineId: number, quantity: number) {
        const currentItems = this.cartItems.value;
        const item = currentItems.find(i => i.medicine.medicineId === medicineId);
        if (item) {
            item.quantity = quantity;
            if (item.quantity > item.medicine.stock) item.quantity = item.medicine.stock;
            if (item.quantity < 1) item.quantity = 1;
            this.cartItems.next([...currentItems]);
        }
    }

    clearCart() {
        this.cartItems.next([]);
    }

    getTotalAmount(): number {
        return this.cartItems.value.reduce((total, item) => total + (item.medicine.price * item.quantity), 0);
    }

    getItemCount(): number {
        return this.cartItems.value.reduce((count, item) => count + item.quantity, 0);
    }

    getItems(): CartItem[] {
        return this.cartItems.value;
    }

    getPharmacyId(): number {
        const items = this.cartItems.value;
        return items.length > 0 ? items[0].medicine.pharmacyId : 0;
    }
}
