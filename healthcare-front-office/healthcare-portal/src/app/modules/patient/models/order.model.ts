export interface OrderLineRequest {
    medicineId: number;
    quantity: number;
}

export interface OrderRequest {
    userId: number;
    pharmacyId: number;
    deliveryMethod?: string;
    deliveryAddress?: string;
    paymentMethod?: string;
    prescriptionImage?: string;
    orderLines: OrderLineRequest[];
}

export interface OrderLineResponse {
    lineId: number;
    medicineId: number;
    medicineName: string;
    quantity: number;
    unitPrice: number;
}

export interface OrderResponse {
    orderId: number;
    orderDate: string;
    deliveryDate: string | null;
    totalAmount: number;
    orderStatus: string;
    pharmacyId: number;
    pharmacyName: string;
    userId: number;
    userName: string;
    deliveryMethod?: string;
    deliveryAddress?: string;
    paymentMethod?: string;
    prescriptionImage?: string;
    orderLines: OrderLineResponse[];
}

export interface PatientSpendingAnalytics {
    category: string;
    form: string;
    orderCount: number;
    totalUnits: number;
    totalSpent: number;
    mostBoughtMedicine: string;
}
