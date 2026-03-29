export interface Medicine {
    medicineId: number;
    medicineName: string;
    description: string;
    dosage: string;
    price: number;
    stock: number;
    minStockAlert: number;
    dateOfExpiration: string;
    available: boolean;
    imageUrls: string[];
    form?: string;
    activeIngredient: string;
}

export interface MedicineCreateRequest {
    medicineName: string;
    description: string;
    dosage: string;
    price: number;
    stock: number;
    minStockAlert: number;
    dateOfExpiration: string;
    form?: string;
    activeIngredient: string;
    pharmacyId: number;
}

export interface MedicineUpdateRequest {
    medicineName: string;
    description: string;
    dosage: string;
    price: number;
    stock: number;
    minStockAlert: number;
    dateOfExpiration: string;
    form?: string;
    activeIngredient: string;
    pharmacyId: number;
}
