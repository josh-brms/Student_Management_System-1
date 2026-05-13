import { supabase } from './supabase'
import type { Tag } from '../types'

export async function fetchTags(userId: number): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as Tag[]
}

export async function createTag(userId: number, name: string, color_hex: string): Promise<Tag> {
  const { data, error } = await supabase
    .from('tags')
    .insert({ user_id: userId, name, color_hex })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Tag
}

export async function deleteTag(tagId: number): Promise<void> {
  const { error } = await supabase.from('tags').delete().eq('tag_id', tagId)
  if (error) throw new Error(error.message)
}

export async function fetchTaskTags(taskId: number): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('task_tags')
    .select('tag:tags(*)')
    .eq('task_id', taskId)
  if (error) throw new Error(error.message)
  return ((data ?? []).map((r: any) => r.tag).filter(Boolean)) as Tag[]
}

export async function addTagToTask(taskId: number, tagId: number): Promise<void> {
  const { error } = await supabase.from('task_tags').insert({ task_id: taskId, tag_id: tagId })
  if (error && !error.message.includes('duplicate')) throw new Error(error.message)
}

export async function removeTagFromTask(taskId: number, tagId: number): Promise<void> {
  const { error } = await supabase
    .from('task_tags')
    .delete()
    .eq('task_id', taskId)
    .eq('tag_id', tagId)
  if (error) throw new Error(error.message)
}
