export interface OrderLineRequest {
    medicineId: number;
    quantity: number;
}

export interface OrderRequest {
    userId: number;
    pharmacyId: number;
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
    orderLines: OrderLineResponse[];
}
