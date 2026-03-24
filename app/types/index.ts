// app/types/index.ts

// ==================== AUTH TYPES ====================
export interface SuperAdmin {
    id: string;
    fullName: string;
    email: string;
    username: string;
    role: 'super_admin';
}

export interface LoginCredentials {
    username?: string;
    email?: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    data: SuperAdmin;
    message?: string;
}

export interface AuthState {
    user: SuperAdmin | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

// ==================== COMPANY TYPES ====================
export interface Company {
    _id: string;
    name: string;
    logo?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };
    subscriptionStatus: 'active' | 'expired' | 'cancelled' | 'trial';
    isActive: boolean;
    billing?: {
        plan: string;
        startDate: string;
        expiryDate: string;
    };
    stats?: {
        admins: number;
        employees: number;
        employers: number;
        jobDemands: number;
        workers: number;
        subAgents: number;
    };
    createdAt: string;
    updatedAt: string;
}

// ==================== USER TYPES ====================
export interface User {
    _id: string;
    fullName: string;
    email: string;
    contactNumber: string;
    address?: string;
    role: 'admin' | 'employee';
    isBlocked: boolean;
    companyId?: string;
    company?: {
        _id: string;
        name: string;
        logo?: string;
        isActive?: boolean;
    };
    createdAt: string;
}

// ==================== EMPLOYER TYPES ====================
export interface Employer {
    _id: string;
    employerName: string;
    country: string;
    contact: string;
    address: string;
    status: string;
    notes?: string;
    companyId: string;
    company?: {
        _id: string;
        name: string;
        logo?: string;
    };
    createdBy?: {
        _id: string;
        fullName: string;
    };
    stats?: {
        jobDemands: number;
        workers: number;
    };
    deleted: boolean;
    deletedAt?: string;
    createdAt: string;
}

// ==================== JOB DEMAND TYPES ====================
export interface JobDemand {
    _id: string;
    jobTitle: string;
    requiredWorkers: number;
    tenure?: string;
    description?: string;
    salary?: string;
    skills?: string[];
    deadline: string;
    status: 'open' | 'in-progress' | 'closed';
    employerId: string;
    employer?: {
        _id: string;
        employerName: string;
    };
    companyId: string;
    company?: {
        _id: string;
        name: string;
        logo?: string;
    };
    workers?: Array<{
        _id: string;
        name: string;
        status: string;
    }>;
    assignedCount: number;
    remainingPositions: number;
    documents?: Array<{
        name: string;
        category: string;
        hasFile: boolean;
        uploadedAt: string;
    }>;
    deleted: boolean;
    deletedAt?: string;
    createdAt: string;
}

// ==================== WORKER TYPES ====================
export interface Worker {
    _id: string;
    name: string;
    passportNumber?: string;
    citizenshipNumber?: string;
    contact: string;
    address?: string;
    email?: string;
    country?: string;
    status: 'pending' | 'processing' | 'deployed' | 'rejected';
    currentStage: string;
    dob?: string;
    stageTimeline?: Array<{
        stage: string;
        status: string;
        date: string;
        notes?: string;
    }>;
    companyId: string;
    company?: {
        _id: string;
        name: string;
        logo?: string;
    };
    employerId?: string;
    employer?: {
        _id: string;
        employerName: string;
        country?: string;
    };
    jobDemandId?: string;
    jobDemand?: {
        _id: string;
        jobTitle: string;
    };
    subAgentId?: string;
    subAgent?: {
        _id: string;
        name: string;
    };
    createdBy?: {
        _id: string;
        fullName: string;
    };
    documents?: Array<{
        name: string;
        category: string;
        fileName: string;
        fileSize: string;
        hasFile: boolean;
        uploadedAt: string;
    }>;
    deleted: boolean;
    deletedAt?: string;
    __masked?: boolean;
    createdAt: string;
}

// ==================== SUB AGENT TYPES ====================
export interface SubAgent {
    _id: string;
    name: string;
    country: string;
    contact: string;
    status: 'active' | 'inactive' | 'pending';
    companyId: string;
    company?: {
        _id: string;
        name: string;
        logo?: string;
    };
    createdBy?: {
        _id: string;
        fullName: string;
    };
    workers?: Array<any>;
    workerCount: number;
    deleted: boolean;
    deletedAt?: string;
    createdAt: string;
}

// ==================== AUDIT LOG TYPES ====================
export interface AuditLog {
    _id: string;
    superAdminId: {
        _id: string;
        fullName: string;
        email: string;
    };
    action: string;
    targetId?: string;
    targetType?: string;
    reason?: string;
    ipAddress: string;
    userAgent: string;
    timestamp: string;
    metadata?: any;
}

// ==================== STATS TYPES ====================
export interface SystemStats {
    companies: {
        total: number;
        byStatus: Record<string, number>;
    };
    users: {
        total: number;
        byRole: Record<string, number>;
    };
    employers: {
        active: number;
        deleted: number;
    };
    jobDemands: {
        active: number;
        deleted: number;
    };
    workers: {
        active: number;
        deleted: number;
        byStatus: Record<string, number>;
    };
    subAgents: {
        active: number;
        deleted: number;
    };
}

// ==================== PAGINATION TYPES ====================
export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    companyId?: string;
    includeDeleted?: boolean;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    meta?: {
        showingDeleted?: boolean;
        masked?: boolean;
        note?: string;
    };
}

// ==================== API RESPONSE TYPES ====================
export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    message?: string;
}

export interface ApiErrorResponse {
    success: false;
    message: string;
    error?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;