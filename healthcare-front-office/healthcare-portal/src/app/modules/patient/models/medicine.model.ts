export interface Medicine {
    medicineId: number;
    medicineName: string;
    description: string;
    dosage: string;
    price: number;
    stock: number;
    minStockAlert: number;
    dateOfExpiration?: string;
    expirationDate?: string;
    available: boolean;
    pharmacyId: number;
    imageUrls: string[];
    pharmacy?: any; // Add pharmacy object for global search branding
    form?: string;
}

export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number;
    sort: any;
    numberOfElements: number;
    first: boolean;
    empty: boolean;
}
