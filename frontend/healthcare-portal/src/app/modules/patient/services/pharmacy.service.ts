import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Product {
    id: string;
    name: string;
    description: string;
    price: string;
    numPrice: number;
    prescription: boolean;
    category: string;
    image: string | null;
}

export interface CartItem extends Product {
    qty: number;
}

@Injectable({
    providedIn: 'root'
})
export class PharmacyService {
    private products: Product[] = [
        { id: '1', name: 'Panadol', description: 'Pain and fever relief 500mg', price: '4.99 DT', numPrice: 4.99, prescription: false, category: 'Pain Relief', image: 'assets/images/c9b2d742f5b5357a88dab364c9d68735ae5f9dd9.png' },
        { id: '2', name: 'Aspegic', description: 'Aspirin 100mg sachets', price: '6.50 DT', numPrice: 6.50, prescription: false, category: 'Pain Relief', image: null }, // Fallback emoji
        { id: '3', name: 'Doliprane', description: 'Paracetamol 1000mg tablets', price: '3.99 DT', numPrice: 3.99, prescription: false, category: 'Pain Relief', image: 'assets/images/a3383f842247592892fc1f809864deda459b5c11.png' },
        { id: '4', name: 'Augmentin', description: 'Amoxicillin/Clavulanate 1g', price: '12.99 DT', numPrice: 12.99, prescription: true, category: 'Antibiotics', image: 'assets/images/86017bfab5d99136c46eee837fe8cf5b8d940305.png' },
        { id: '5', name: 'Clamoxyl', description: 'Amoxicillin 500mg capsules', price: '8.99 DT', numPrice: 8.99, prescription: true, category: 'Antibiotics', image: 'assets/images/0f5cbb233e211d98f170f2d2d76366530b242dd1.png' },
        { id: '6', name: 'Clavumoccid', description: 'Broad spectrum antibiotic', price: '14.50 DT', numPrice: 14.50, prescription: true, category: 'Antibiotics', image: 'assets/images/c68025eee36bf7e3cd605611477c9786383c211e.png' },
        { id: '7', name: 'Fluoxine', description: 'Antidepressant medication', price: '18.99 DT', numPrice: 18.99, prescription: true, category: 'Pain Relief', image: 'assets/images/3d36d0d3c014a37814d435fca16568477eae951c.png' },
        { id: '8', name: 'Zalerg', description: 'Antihistamine for allergies', price: '7.99 DT', numPrice: 7.99, prescription: false, category: 'Allergy', image: 'assets/images/e65dad7790e4f9aea4513a1f2fceded87cbc8d93.png' },
        { id: '9', name: 'Vitascorbol', description: 'Vitamin C 1000mg effervescent', price: '9.99 DT', numPrice: 9.99, prescription: false, category: 'Vitamins', image: 'assets/images/f15f61c596c19e3d7d99c65db597c76f663d8e42.png' },
        { id: '10', name: 'Chronobiane', description: 'Melatonin sleep supplement', price: '11.50 DT', numPrice: 11.50, prescription: false, category: 'Vitamins', image: 'assets/images/6734f0b1a385d09e67786ee5083049f304d8e6af.png' },
        { id: '11', name: 'Citrate de Betaine', description: 'Digestive comfort solution', price: '5.99 DT', numPrice: 5.99, prescription: false, category: 'Digestive', image: 'assets/images/0e9cc64d52eab020d732227208277c5f57ca6b05.png' },
        { id: '12', name: 'Flavonoides', description: 'Vascular health supplement', price: '13.99 DT', numPrice: 13.99, prescription: false, category: 'Vitamins', image: 'assets/images/1b2b30d74a9fa4ec0703fef2aae824fe4be4a9f7.png' },
        { id: '13', name: 'Complem Energie', description: 'Energy and vitality complex', price: '15.99 DT', numPrice: 15.99, prescription: false, category: 'Vitamins', image: 'assets/images/6b9b7ba8db59410f00d60c8ce7722263001d8125.png' },
        { id: '14', name: 'Lysopaine', description: 'Sore throat lozenges', price: '6.99 DT', numPrice: 6.99, prescription: false, category: 'Pain Relief', image: 'assets/images/41da1a847a7e2c20eafe0af7cc3ca733cd9a5dfa.png' }
    ];

    private cartItems = new BehaviorSubject<CartItem[]>([]);
    cartItems$ = this.cartItems.asObservable();

    getProducts() { return this.products; }
    getProduct(id: string) { return this.products.find(p => p.id === id); }

    addToCart(product: Product, qty: number = 1) {
        const currentCart = this.cartItems.value;
        const existing = currentCart.find(i => i.id === product.id);
        if (existing) {
            existing.qty += qty;
        } else {
            currentCart.push({ ...product, qty });
        }
        this.cartItems.next([...currentCart]);
    }

    getCartTotal() {
        return this.cartItems.value.reduce((acc, item) => acc + (item.numPrice * item.qty), 0);
    }

    getCartCount() {
        return this.cartItems.value.reduce((acc, item) => acc + item.qty, 0);
    }
}
