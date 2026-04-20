// AETHEM Backend TypeScript Types

// User model
export interface User {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

// Subscription model
export interface Subscription {
    id: string;
    userId: string;
    startDate: Date;
    endDate: Date;
    status: 'active' | 'inactive' | 'cancelled';
    plan: string;
}

// Payment model
export interface Payment {
    id: string;
    userId: string;
    amount: number;
    status: 'completed' | 'pending' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}

// AI model
export interface AIModel {
    id: string;
    name: string;
    description: string;
    version: string;
    createdAt: Date;
    updatedAt: Date;
}