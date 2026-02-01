/**
 * Database Helper Functions for Handl
 * Provides type-safe CRUD operations for all tables
 */

import { createClient } from '@/utils/supabase/client';
import type {
    Database,
    Task,
    TaskInsert,
    TaskUpdate,
    Message,
    MessageInsert,
    Call,
    CallInsert,
    CallUpdate,
    CallAnalysis,
    CallAnalysisInsert,
    User,
    UserUpdate,
} from '@/types/database';

// ============================================
// User Operations
// ============================================

export async function getCurrentUser(): Promise<User | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error fetching user:', error);
        return null;
    }
    return data;
}

export async function updateUser(updates: UserUpdate): Promise<User | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating user:', error);
        return null;
    }
    return data;
}

// ============================================
// Task Operations
// ============================================

export async function createTask(task: Omit<TaskInsert, 'user_id'>): Promise<Task | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('tasks')
        .insert({ ...task, user_id: user.id })
        .select()
        .single();

    if (error) {
        console.error('Error creating task:', error);
        return null;
    }
    return data;
}

export async function getTask(taskId: string): Promise<Task | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

    if (error) {
        console.error('Error fetching task:', error);
        return null;
    }
    return data;
}

export async function getTasks(): Promise<Task[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
    return data ?? [];
}

export async function updateTask(taskId: string, updates: TaskUpdate): Promise<Task | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

    if (error) {
        console.error('Error updating task:', error);
        return null;
    }
    return data;
}

export async function deleteTask(taskId: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

    if (error) {
        console.error('Error deleting task:', error);
        return false;
    }
    return true;
}

// ============================================
// Message Operations
// ============================================

export async function createMessage(message: MessageInsert): Promise<Message | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single();

    if (error) {
        console.error('Error creating message:', error);
        return null;
    }
    return data;
}

export async function getMessages(taskId: string): Promise<Message[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
    return data ?? [];
}

// ============================================
// Call Operations
// ============================================

export async function createCall(call: CallInsert): Promise<Call | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('calls')
        .insert(call)
        .select()
        .single();

    if (error) {
        console.error('Error creating call:', error);
        return null;
    }
    return data;
}

export async function getCall(callId: string): Promise<Call | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('id', callId)
        .single();

    if (error) {
        console.error('Error fetching call:', error);
        return null;
    }
    return data;
}

export async function getCallByVapiId(vapiCallId: string): Promise<Call | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('vapi_call_id', vapiCallId)
        .single();

    if (error) {
        console.error('Error fetching call by VAPI ID:', error);
        return null;
    }
    return data;
}

export async function getCalls(taskId: string): Promise<Call[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching calls:', error);
        return [];
    }
    return data ?? [];
}

export async function updateCall(callId: string, updates: CallUpdate): Promise<Call | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('calls')
        .update(updates)
        .eq('id', callId)
        .select()
        .single();

    if (error) {
        console.error('Error updating call:', error);
        return null;
    }
    return data;
}

export async function updateCallByVapiId(vapiCallId: string, updates: CallUpdate): Promise<Call | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('calls')
        .update(updates)
        .eq('vapi_call_id', vapiCallId)
        .select()
        .single();

    if (error) {
        console.error('Error updating call by VAPI ID:', error);
        return null;
    }
    return data;
}

// ============================================
// Call Analysis Operations
// ============================================

export async function createCallAnalysis(analysis: CallAnalysisInsert): Promise<CallAnalysis | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('call_analyses')
        .insert(analysis)
        .select()
        .single();

    if (error) {
        console.error('Error creating call analysis:', error);
        return null;
    }
    return data;
}

export async function getCallAnalysis(callId: string): Promise<CallAnalysis | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('call_analyses')
        .select('*')
        .eq('call_id', callId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching call analysis:', error);
        return null;
    }
    return data;
}

// ============================================
// Combined Operations (with joins)
// ============================================

export interface TaskWithCalls extends Task {
    calls: (Call & { analysis: CallAnalysis | null })[];
}

export async function getTaskWithCalls(taskId: string): Promise<TaskWithCalls | null> {
    const supabase = createClient();

    const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

    if (taskError || !task) {
        console.error('Error fetching task:', taskError);
        return null;
    }

    const { data: calls, error: callsError } = await supabase
        .from('calls')
        .select(`
            *,
            call_analyses (*)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

    if (callsError) {
        console.error('Error fetching calls:', callsError);
        return { ...task, calls: [] };
    }

    const callsWithAnalysis = (calls ?? []).map((call: any) => ({
        ...call,
        analysis: call.call_analyses?.[0] ?? null,
    }));

    return { ...task, calls: callsWithAnalysis };
}

export interface TaskSummary {
    id: string;
    title: string | null;
    status: Task['status'];
    service: string | null;
    created_at: string;
    call_count: number;
}

export async function getTaskSummaries(): Promise<TaskSummary[]> {
    const supabase = createClient();

    const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
            id,
            title,
            status,
            service,
            created_at,
            calls (id)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching task summaries:', error);
        return [];
    }

    return (tasks ?? []).map((task: any) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        service: task.service,
        created_at: task.created_at,
        call_count: task.calls?.length ?? 0,
    }));
}
