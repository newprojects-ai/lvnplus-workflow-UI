import React from 'react';
import { WorkflowStep } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';

interface TaskConfigPanelProps {
  step: WorkflowStep;
  onUpdate: (updates: Partial<WorkflowStep>) => void;
}

const TaskConfigPanel: React.FC<TaskConfigPanelProps> = ({ step, onUpdate }) => {
  const renderServiceConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Service Type</label>
        <select
          value={step.config?.service?.type || 'rest'}
          onChange={(e) => onUpdate({
            config: {
              ...step.config,
              service: {
                ...step.config?.service,
                type: e.target.value as 'rest' | 'graphql' | 'grpc'
              }
            }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="rest">REST</option>
          <option value="graphql">GraphQL</option>
          <option value="grpc">gRPC</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Endpoint</label>
        <input
          type="text"
          value={step.config?.service?.endpoint || ''}
          onChange={(e) => onUpdate({
            config: {
              ...step.config,
              service: {
                ...step.config?.service,
                endpoint: e.target.value
              }
            }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="https://api.example.com/endpoint"
        />
      </div>

      {step.config?.service?.type === 'rest' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Method</label>
          <select
            value={step.config?.service?.method || 'GET'}
            onChange={(e) => onUpdate({
              config: {
                ...step.config,
                service: {
                  ...step.config?.service,
                  method: e.target.value
                }
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Headers</label>
        <div className="mt-1 space-y-2">
          {Object.entries(step.config?.service?.headers || {}).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <input
                type="text"
                value={key}
                onChange={(e) => {
                  const newHeaders = { ...step.config?.service?.headers };
                  delete newHeaders[key];
                  newHeaders[e.target.value] = value;
                  onUpdate({
                    config: {
                      ...step.config,
                      service: {
                        ...step.config?.service,
                        headers: newHeaders
                      }
                    }
                  });
                }}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Header name"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => onUpdate({
                  config: {
                    ...step.config,
                    service: {
                      ...step.config?.service,
                      headers: {
                        ...step.config?.service?.headers,
                        [key]: e.target.value
                      }
                    }
                  }
                })}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Header value"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newHeaders = { ...step.config?.service?.headers };
                  delete newHeaders[key];
                  onUpdate({
                    config: {
                      ...step.config,
                      service: {
                        ...step.config?.service,
                        headers: newHeaders
                      }
                    }
                  });
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdate({
              config: {
                ...step.config,
                service: {
                  ...step.config?.service,
                  headers: {
                    ...step.config?.service?.headers,
                    '': ''
                  }
                }
              }
            })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Header
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Request Body</label>
        <textarea
          value={step.config?.service?.body || ''}
          onChange={(e) => onUpdate({
            config: {
              ...step.config,
              service: {
                ...step.config?.service,
                body: e.target.value
              }
            }
          })}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Request body (JSON)"
        />
      </div>
    </div>
  );

  const renderScriptConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Language</label>
        <select
          value={step.config?.script?.language || 'javascript'}
          onChange={(e) => onUpdate({
            config: {
              ...step.config,
              script: {
                ...step.config?.script,
                language: e.target.value as 'javascript' | 'python'
              }
            }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Code</label>
        <textarea
          value={step.config?.script?.code || ''}
          onChange={(e) => onUpdate({
            config: {
              ...step.config,
              script: {
                ...step.config?.script,
                code: e.target.value
              }
            }
          })}
          rows={8}
          className="mt-1 block w-full font-mono rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder={step.config?.script?.language === 'python' ? 
            '# Write your Python code here\ndef execute(data):\n    return data' :
            '// Write your JavaScript code here\nfunction execute(data) {\n  return data;\n}'
          }
        />
      </div>
    </div>
  );

  const renderTimerConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Timer Type</label>
        <select
          value={step.config?.timer?.type || 'delay'}
          onChange={(e) => onUpdate({
            config: {
              ...step.config,
              timer: {
                ...step.config?.timer,
                type: e.target.value as 'delay' | 'schedule'
              }
            }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="delay">Delay</option>
          <option value="schedule">Schedule</option>
        </select>
      </div>

      {step.config?.timer?.type === 'delay' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700">Delay Duration</label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={step.config?.timer?.value || ''}
              onChange={(e) => onUpdate({
                config: {
                  ...step.config,
                  timer: {
                    ...step.config?.timer,
                    value: e.target.value
                  }
                }
              })}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., 5m, 2h, 1d"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Use format: 30s (seconds), 5m (minutes), 2h (hours), 1d (days)
          </p>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cron Expression</label>
            <input
              type="text"
              value={step.config?.timer?.value || ''}
              onChange={(e) => onUpdate({
                config: {
                  ...step.config,
                  timer: {
                    ...step.config?.timer,
                    value: e.target.value
                  }
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="*/5 * * * *"
            />
            <p className="mt-1 text-sm text-gray-500">
              Use cron format: minute hour day month weekday
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Timezone</label>
            <select
              value={step.config?.timer?.timezone || 'UTC'}
              onChange={(e) => onUpdate({
                config: {
                  ...step.config,
                  timer: {
                    ...step.config?.timer,
                    timezone: e.target.value
                  }
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
            </select>
          </div>
        </>
      )}
    </div>
  );

  const renderMessageConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Message Type</label>
        <select
          value={step.config?.message?.type || 'email'}
          onChange={(e) => onUpdate({
            config: {
              ...step.config,
              message: {
                ...step.config?.message,
                type: e.target.value as 'email' | 'sms' | 'push'
              }
            }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="push">Push Notification</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Template</label>
        <textarea
          value={step.config?.message?.template || ''}
          onChange={(e) => onUpdate({
            config: {
              ...step.config,
              message: {
                ...step.config?.message,
                template: e.target.value
              }
            }
          })}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Enter message template with {{variables}}"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Recipients</label>
        <div className="mt-1 space-y-2">
          {(step.config?.message?.recipients || []).map((recipient, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={recipient}
                onChange={(e) => {
                  const newRecipients = [...(step.config?.message?.recipients || [])];
                  newRecipients[index] = e.target.value;
                  onUpdate({
                    config: {
                      ...step.config,
                      message: {
                        ...step.config?.message,
                        recipients: newRecipients
                      }
                    }
                  });
                }}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter recipient"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newRecipients = [...(step.config?.message?.recipients || [])];
                  newRecipients.splice(index, 1);
                  onUpdate({
                    config: {
                      ...step.config,
                      message: {
                        ...step.config?.message,
                        recipients: newRecipients
                      }
                    }
                  });
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdate({
              config: {
                ...step.config,
                message: {
                  ...step.config?.message,
                  recipients: [...(step.config?.message?.recipients || []), '']
                }
              }
            })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Recipient
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Step Configuration</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure the settings for this {step.type} step.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Step Name</label>
          <input
            type="text"
            value={step.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        {step.type === 'service' && renderServiceConfig()}
        {step.type === 'script' && renderScriptConfig()}
        {step.type === 'timer' && renderTimerConfig()}
        {step.type === 'message' && renderMessageConfig()}
      </div>
    </Card>
  );
};

export default TaskConfigPanel;