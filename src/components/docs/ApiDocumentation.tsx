import React from 'react';
import Card from '../ui/Card';

const ApiDocumentation: React.FC = () => {
  const endpoints = [
    {
      method: 'GET',
      path: '/workflows',
      description: 'List all workflows',
      parameters: [],
      responses: [
        {
          code: 200,
          description: 'List of workflows',
          example: {
            data: [
              {
                id: 'uuid',
                name: 'Example Workflow',
                description: 'Description',
                version: '1.0',
                status: 'draft'
              }
            ]
          }
        }
      ]
    },
    {
      method: 'GET',
      path: '/workflows/:id',
      description: 'Get workflow by ID',
      parameters: [
        {
          name: 'id',
          type: 'string',
          in: 'path',
          required: true,
          description: 'Workflow ID'
        }
      ],
      responses: [
        {
          code: 200,
          description: 'Workflow details',
          example: {
            id: 'uuid',
            name: 'Example Workflow',
            description: 'Description',
            version: '1.0',
            status: 'draft',
            steps: [],
            transitions: []
          }
        }
      ]
    },
    {
      method: 'POST',
      path: '/workflows',
      description: 'Create new workflow',
      parameters: [
        {
          name: 'body',
          in: 'body',
          required: true,
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              version: { type: 'string' }
            }
          }
        }
      ],
      responses: [
        {
          code: 201,
          description: 'Created workflow',
          example: {
            id: 'uuid',
            name: 'New Workflow',
            status: 'draft'
          }
        }
      ]
    },
    {
      method: 'PUT',
      path: '/workflows/:id',
      description: 'Update workflow',
      parameters: [
        {
          name: 'id',
          type: 'string',
          in: 'path',
          required: true,
          description: 'Workflow ID'
        },
        {
          name: 'body',
          in: 'body',
          required: true,
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              version: { type: 'string' },
              status: { type: 'string' }
            }
          }
        }
      ],
      responses: [
        {
          code: 200,
          description: 'Updated workflow',
          example: {
            id: 'uuid',
            name: 'Updated Workflow'
          }
        }
      ]
    }
  ];

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">API Documentation</h2>
          <p className="mt-1 text-sm text-gray-500">
            Reference for the workflow management API endpoints
          </p>
        </div>

        <div className="space-y-8">
          {endpoints.map((endpoint, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-sm font-medium rounded ${
                  endpoint.method === 'GET' 
                    ? 'bg-blue-100 text-blue-800'
                    : endpoint.method === 'POST'
                    ? 'bg-green-100 text-green-800'
                    : endpoint.method === 'PUT'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {endpoint.method}
                </span>
                <code className="text-sm font-mono">{endpoint.path}</code>
              </div>

              <p className="text-sm text-gray-600">{endpoint.description}</p>

              {endpoint.parameters.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Parameters</h4>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Required</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {endpoint.parameters.map((param, paramIndex) => (
                          <tr key={paramIndex}>
                            <td className="px-4 py-2 text-sm font-mono">{param.name}</td>
                            <td className="px-4 py-2 text-sm">{param.type || 'object'}</td>
                            <td className="px-4 py-2 text-sm">{param.required ? 'Yes' : 'No'}</td>
                            <td className="px-4 py-2 text-sm">{param.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Responses</h4>
                <div className="space-y-4">
                  {endpoint.responses.map((response, responseIndex) => (
                    <div key={responseIndex}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          response.code >= 200 && response.code < 300
                            ? 'bg-green-100 text-green-800'
                            : response.code >= 400
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {response.code}
                        </span>
                        <span className="text-sm text-gray-600">{response.description}</span>
                      </div>
                      <pre className="bg-gray-50 rounded p-3 text-sm font-mono overflow-x-auto">
                        {JSON.stringify(response.example, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ApiDocumentation;