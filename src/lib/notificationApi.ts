import { supabase } from './supabase'
import type { Notification } from '../types'

export async function fetchNotifications(userId: number): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw new Error(error.message)
  return (data ?? []) as Notification[]
}

export async function markAllRead(userId: number): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) throw new Error(error.message)
}

export async function markOneRead(notificationId: number): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('notification_id', notificationId)

  if (error) throw new Error(error.message)
}

export async function countUnread(userId: number): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) return 0
  return count ?? 0
}
