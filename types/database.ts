/**
 * Database Types for Handl
 * Auto-generated to match Supabase schema
 */

// ============================================
// Enum Types
// ============================================

export type TaskStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled';
export type CallType = 'call_businesses' | 'call_specific_number';
export type PreferredCriteria = string; // Flexible - can be "cheapest", "fastest", "cheapest, best_rated", etc.
export type MessageRole = 'user' | 'assistant';
export type CallStatus = 'queued' | 'calling' | 'in_progress' | 'completed' | 'failed';

// ============================================
// Table Types
// ============================================

export interface User {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    phone_number: string | null;
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: string;
    user_id: string;
    title: string | null;
    status: TaskStatus;
    call_type: CallType | null;
    service: string | null;
    service_details: string | null;
    location: string | null;
    budget: string | null;
    time_constraints: string | null;
    preferred_criteria: PreferredCriteria | null;
    call_objective: string | null;
    questions_to_ask: string[] | null;
    additional_notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: string;
    task_id: string;
    role: MessageRole;
    content: Record<string, unknown>; // JSONB
    created_at: string;
}

export interface Call {
    id: string;
    task_id: string;
    vapi_call_id: string | null;
    phone_number: string;
    business_name: string | null;
    status: CallStatus;
    transcript: string | null;
    recording_url: string | null;
    started_at: string | null;
    ended_at: string | null;
    ended_reason: string | null;
    cost: number | null;
    created_at: string;
}

export interface CallAnalysis {
    id: string;
    call_id: string;
    summary: string | null;
    price: string | null;
    has_new_questions: boolean;
    new_questions: Record<string, unknown>[] | null; // JSONB array
    insights: string | null;
    created_at: string;
}

// ============================================
// Insert Types (for creating new records)
// ============================================

export type UserInsert = Omit<User, 'created_at' | 'updated_at'>;
export type TaskInsert = Partial<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>> & { user_id?: string };
export type MessageInsert = {
    task_id: string;
    role: MessageRole;
    content: Record<string, unknown>;
};
export type CallInsert = Omit<Call, 'id' | 'created_at' | 'status'> & { status?: CallStatus };
export type CallAnalysisInsert = Omit<CallAnalysis, 'id' | 'created_at' | 'has_new_questions'> & { has_new_questions?: boolean };

// ============================================
// Update Types (for partial updates)
// ============================================

export type UserUpdate = Partial<Omit<User, 'id' | 'created_at'>>;
export type TaskUpdate = Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>;
export type CallUpdate = Partial<Omit<Call, 'id' | 'task_id' | 'created_at'>>;

// ============================================
// Database Schema (for Supabase client typing)
// ============================================

export interface Database {
    public: {
        Tables: {
            users: {
                Row: User;
                Insert: UserInsert;
                Update: UserUpdate;
            };
            tasks: {
                Row: Task;
                Insert: TaskInsert;
                Update: TaskUpdate;
            };
            messages: {
                Row: Message;
                Insert: MessageInsert;
                Update: never;
            };
            calls: {
                Row: Call;
                Insert: CallInsert;
                Update: CallUpdate;
            };
            call_analyses: {
                Row: CallAnalysis;
                Insert: CallAnalysisInsert;
                Update: never;
            };
        };
        Enums: {
            task_status: TaskStatus;
            call_type: CallType;
            preferred_criteria: PreferredCriteria;
            message_role: MessageRole;
            call_status: CallStatus;
        };
    };
}
