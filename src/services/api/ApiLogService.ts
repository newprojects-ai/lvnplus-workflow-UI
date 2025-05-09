import { supabase } from '../../repositories/supabase/SupabaseClient';

export interface ApiLog {
  id: string;
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  requestBody?: any;
  responseBody?: any;
  createdAt: Date;
}

class ApiLogService {
  async logApiCall(
    apiKeyId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    requestBody?: any,
    responseBody?: any
  ): Promise<void> {
    const { error } = await supabase
      .from('api_logs')
      .insert({
        api_key_id: apiKeyId,
        endpoint,
        method,
        status_code: statusCode,
        request_body: requestBody,
        response_body: responseBody
      });

    if (error) throw error;
  }

  async getApiLogs(apiKeyId: string): Promise<ApiLog[]> {
    const { data, error } = await supabase
      .from('api_logs')
      .select()
      .eq('api_key_id', apiKeyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToApiLog);
  }

  private mapToApiLog(data: any): ApiLog {
    return {
      id: data.id,
      apiKeyId: data.api_key_id,
      endpoint: data.endpoint,
      method: data.method,
      statusCode: data.status_code,
      requestBody: data.request_body,
      responseBody: data.response_body,
      createdAt: new Date(data.created_at)
    };
  }
}

export const apiLogService = new ApiLogService();