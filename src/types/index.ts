// ============================================================
// STMS — TypeScript Types (aligned with full schema)
// ============================================================

export type Role         = 'student' | 'admin'
export type TaskType     = 'assignment' | 'quiz' | 'project'
export type Priority     = 'low' | 'medium' | 'high'
export type Status       = 'pending' | 'ongoing' | 'done'
export type NotifType    = 'reminder' | 'status_change' | 'system'

// ─── Users (mirrors public.users) ────────────────────────────────────────────
export interface User {
  user_id:       number
  name:          string
  email:         string
  role:          Role
  avatar_url:    string | null
  is_active:     boolean
  last_login_at: string | null
  created_at:    string
}

// Profile is a lightweight alias used by auth context (maps auth.uid → user row)
export type Profile = User & { id: string } // id = auth uuid bridged to user_id

// ─── Subjects ────────────────────────────────────────────────────────────────
export interface Subject {
  subject_id:      number
  user_id:         number
  name:            string
  code:            string | null
  color_hex:       string
  instructor_name: string | null
  created_at:      string
}

export interface SubjectFormValues {
  name:            string
  code:            string
  color_hex:       string
  instructor_name: string
}

// ─── Tasks ───────────────────────────────────────────────────────────────────
export interface Task {
  task_id:      number
  user_id:      number
  subject_id:   number | null
  title:        string
  description:  string | null
  type:         TaskType
  priority:     Priority
  status:       Status
  due_date:     string
  is_deleted:   boolean
  completed_at: string | null
  created_at:   string
  updated_at:   string
  // joined relations
  subject?:     Pick<Subject, 'name' | 'color_hex' | 'code'>
  user?:        Pick<User, 'name' | 'email'>
}

export interface TaskFormValues {
  title:       string
  description: string
  type:        TaskType
  priority:    Priority
  status:      Status
  due_date:    string
  subject_id:  number | null
}

// ─── Task Comments ────────────────────────────────────────────────────────────
export interface TaskComment {
  comment_id: number
  task_id:    number
  user_id:    number
  content:    string
  created_at: string
  updated_at: string
  user?:      Pick<User, 'name'>
}

// ─── Attachments ─────────────────────────────────────────────────────────────
export interface Attachment {
  attachment_id: number
  task_id:       number
  user_id:       number
  file_name:     string
  file_url:      string
  file_type:     string | null
  file_size_kb:  number | null
  uploaded_at:   string
}

// ─── Tags ────────────────────────────────────────────────────────────────────
export interface Tag {
  tag_id:    number
  user_id:   number
  name:      string
  color_hex: string
  created_at: string
}

// ─── Notifications ────────────────────────────────────────────────────────────
export interface Notification {
  notification_id: number
  user_id:         number
  task_id:         number | null
  message:         string
  type:            NotifType
  is_read:         boolean
  scheduled_at:    string | null
  sent_at:         string | null
  created_at:      string
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export interface AuditLog {
  log_id:        number
  user_id:       number | null
  task_id:       number | null
  action:        string
  field_changed: string | null
  old_value:     string | null
  new_value:     string | null
  ip_address:    string | null
  changed_at:    string
}

// ─── Filters ─────────────────────────────────────────────────────────────────
export type TaskFilter = {
  status:     Status | 'all'
  type:       TaskType | 'all'
  subject_id: number | 'all'
  search:     string
}

// ─── User form (admin create) ─────────────────────────────────────────────────
export interface UserFormValues {
  name:     string
  email:    string
  password: string
  role:     Role
}

// ─── Supabase DB type map ─────────────────────────────────────────────────────
export type Database = {
  public: {
    Tables: {
      users: {
        Row:    User
        Insert: Omit<User, 'user_id' | 'created_at' | 'last_login_at'>
        Update: Partial<Omit<User, 'user_id' | 'created_at'>>
      }
      subjects: {
        Row:    Subject
        Insert: Omit<Subject, 'subject_id' | 'created_at'>
        Update: Partial<Omit<Subject, 'subject_id' | 'created_at' | 'user_id'>>
      }
      tasks: {
        Row:    Task
        Insert: Omit<Task, 'task_id' | 'created_at' | 'updated_at' | 'is_deleted' | 'completed_at' | 'subject' | 'user'>
        Update: Partial<Omit<Task, 'task_id' | 'created_at' | 'user_id' | 'subject' | 'user'>>
      }
      task_comments: {
        Row:    TaskComment
        Insert: Omit<TaskComment, 'comment_id' | 'created_at' | 'updated_at' | 'user'>
        Update: Partial<Pick<TaskComment, 'content'>>
      }
      tags: {
        Row:    Tag
        Insert: Omit<Tag, 'tag_id' | 'created_at'>
        Update: Partial<Pick<Tag, 'name' | 'color_hex'>>
      }
      notifications: {
        Row:    Notification
        Insert: Omit<Notification, 'notification_id' | 'created_at'>
        Update: Partial<Pick<Notification, 'is_read'>>
      }
      audit_logs: {
        Row:    AuditLog
        Insert: Omit<AuditLog, 'log_id' | 'changed_at'>
        Update: never
      }
    }
  }
}
