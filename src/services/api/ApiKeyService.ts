import { supabase } from '../../repositories/supabase/SupabaseClient';
import { v4 as uuidv4 } from 'uuid';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  userId: string;
  scopes: string[];
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class ApiKeyService {
  async createApiKey(name: string, userId: string, scopes: string[] = []): Promise<ApiKey> {
    const key = `wf_${uuidv4().replace(/-/g, '')}`;
    
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        name,
        key,
        user_id: userId,
        scopes
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToApiKey(data);
  }

  async getApiKeys(userId: string): Promise<ApiKey[]> {
    const { data, error } = await supabase
      .from('api_keys')
      .select()
      .eq('user_id', userId);

    if (error) throw error;
    return data.map(this.mapToApiKey);
  }

  async revokeApiKey(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    return !error;
  }

  private mapToApiKey(data: any): ApiKey {
    return {
      id: data.id,
      name: data.name,
      key: data.key,
      userId: data.user_id,
      scopes: data.scopes,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}

export const apiKeyService = new ApiKeyService();