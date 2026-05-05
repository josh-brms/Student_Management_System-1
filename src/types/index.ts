// ============================================================
// STMS — TypeScript Types
// ============================================================

export type Role = 'student' | 'admin'
export type TaskType = 'assignment' | 'quiz' | 'project'
export type Priority = 'low' | 'medium' | 'high'
export type Status = 'pending' | 'ongoing' | 'done'

export interface Profile {
  id: string
  name: string
  role: Role
  created_at: string
  updated_at: string
  // joined from auth.users via Supabase admin API (admin view only)
  email?: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  type: TaskType
  priority: Priority
  status: Status
  due_date: string | null
  created_at: string
  updated_at: string
  // joined
  profile?: Pick<Profile, 'name' | 'email'>
}

export interface TaskFormValues {
  title: string
  description: string
  type: TaskType
  priority: Priority
  status: Status
  due_date: string
}

export interface UserFormValues {
  name: string
  email: string
  password: string
  role: Role
}

export type TaskFilter = {
  status: Status | 'all'
  type: TaskType | 'all'
  search: string
}

// Supabase Database type map (mirrors the schema)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'profile'>
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'user_id' | 'profile'>>
      }
    }
  }
}
