import { supabase } from './supabase'
import type { Subject, SubjectFormValues } from '../types'

export async function fetchSubjects(userId: number): Promise<Subject[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as Subject[]
}

export async function createSubject(userId: number, values: SubjectFormValues): Promise<Subject> {
  const { data, error } = await supabase
    .from('subjects')
    .insert({ user_id: userId, ...values })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Subject
}

export async function updateSubject(subjectId: number, values: Partial<SubjectFormValues>): Promise<Subject> {
  const { data, error } = await supabase
    .from('subjects')
    .update(values)
    .eq('subject_id', subjectId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Subject
}

export async function deleteSubject(subjectId: number): Promise<void> {
  const { error } = await supabase.from('subjects').delete().eq('subject_id', subjectId)
  if (error) throw new Error(error.message)
}
