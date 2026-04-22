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
    form?: string | null;
    activeIngredient: string;
    category?: string | null;
}

export interface MedicineCreateRequest {
    medicineName: string;
    description: string;
    dosage: string | null;
    price: number;
    stock: number;
    minStockAlert: number;
    dateOfExpiration: string;
    form?: string | null;
    activeIngredient: string | null;
    pharmacyId: number;
    category?: string | null;
}

export interface MedicineUpdateRequest {
    medicineName: string;
    description: string;
    dosage: string | null;
    price: number;
    stock: number;
    minStockAlert: number;
    dateOfExpiration: string;
    form?: string | null;
    activeIngredient: string | null;
    pharmacyId: number;
    category?: string | null;
}
