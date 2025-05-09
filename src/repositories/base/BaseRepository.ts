import { SupabaseClient } from '@supabase/supabase-js';
import { IRepository } from '../interfaces/IRepository';

export abstract class BaseRepository<T> implements IRepository<T> {
  protected supabase: SupabaseClient;
  protected tableName: string;

  constructor(supabase: SupabaseClient, tableName: string) {
    this.supabase = supabase;
    this.tableName = tableName;
  }

  async getAll(): Promise<T[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select();

    if (error) throw error;
    return data as T[];
  }

  async getById(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select()
      .eq('id', id)
      .single();

    if (error) return null;
    return data as T;
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const { data: created, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return created as T;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const { data: updated, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return updated as T;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    return !error;
  }

  protected abstract mapToModel(data: any): T;
  protected abstract mapFromModel(model: T): any;
}