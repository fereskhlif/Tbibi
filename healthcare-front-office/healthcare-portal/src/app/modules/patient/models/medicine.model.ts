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
}
