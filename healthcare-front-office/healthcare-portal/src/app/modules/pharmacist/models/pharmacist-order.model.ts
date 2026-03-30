export interface PharmacistOrderLine {
    lineId: number;
    quantity: number;
    unitPrice: number;
    medicineId: number;
    medicineName: string;
}

export interface PharmacistOrder {
    orderId: number;
    orderDate: string;
    deliveryDate: string | null;
    totalAmount: number;
    orderStatus: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'DELIVERED' | 'CANCELLED' | 'REJECTED';
    pharmacyId: number;
    pharmacyName: string;
    userId: number;
    userName: string;
    orderLines: PharmacistOrderLine[];
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'DELIVERED' | 'CANCELLED' | 'REJECTED';
