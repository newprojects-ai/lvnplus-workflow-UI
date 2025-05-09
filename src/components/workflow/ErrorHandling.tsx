import React from 'react';
import { WorkflowStep } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';

interface ErrorHandlingProps {
  step: WorkflowStep;
  onUpdate: (updates: Partial<WorkflowStep>) => void;
}

interface ErrorHandler {
  type: 'retry' | 'fallback' | 'notification';
  config: {
    maxRetries?: number;
    retryDelay?: number;
    fallbackValue?: string;
    notificationTemplate?: string;
    recipients?: string[];
  };
}

const ErrorHandling: React.FC<ErrorHandlingProps> = ({ step, onUpdate }) => {
  const errorHandlers = step.config?.errorHandlers || [];

  const addErrorHandler = (type: ErrorHandler['type']) => {
    const newHandler: ErrorHandler = {
      type,
      config: {}
    };

    onUpdate({
      config: {
        ...step.config,
        errorHandlers: [...errorHandlers, newHandler]
      }
    });
  };

  const updateErrorHandler = (index: number, updates: Partial<ErrorHandler>) => {
    const updatedHandlers = [...errorHandlers];
    updatedHandlers[index] = { ...updatedHandlers[index], ...updates };

    onUpdate({
      config: {
        ...step.config,
        errorHandlers: updatedHandlers
      }
    });
  };

  const removeErrorHandler = (index: number) => {
    const updatedHandlers = errorHandlers.filter((_, i) => i !== index);
    onUpdate({
      config: {
        ...step.config,
        errorHandlers: updatedHandlers
      }
    });
  };

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Error Handling</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure how errors should be handled in this step
          </p>
        </div>

        <div className="space-y-4">
          {errorHandlers.map((handler, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700 capitalize">
                  {handler.type} Handler
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeErrorHandler(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              {handler.type === 'retry' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Max Retries
                    </label>
                    <input
                      type="number"
                      value={handler.config.maxRetries || 3}
                      onChange={(e) => updateErrorHandler(index, {
                        config: { ...handler.config, maxRetries: parseInt(e.target.value) }
                      })}
                      min={1}
                      max={10}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Retry Delay (seconds)
                    </label>
                    <input
                      type="number"
                      value={handler.config.retryDelay || 5}
                      onChange={(e) => updateErrorHandler(index, {
                        config: { ...handler.config, retryDelay: parseInt(e.target.value) }
                      })}
                      min={1}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              )}

              {handler.type === 'fallback' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fallback Value
                  </label>
                  <textarea
                    value={handler.config.fallbackValue || ''}
                    onChange={(e) => updateErrorHandler(index, {
                      config: { ...handler.config, fallbackValue: e.target.value }
                    })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Enter fallback value (JSON)"
                  />
                </div>
              )}

              {handler.type === 'notification' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Notification Template
                    </label>
                    <textarea
                      value={handler.config.notificationTemplate || ''}
                      onChange={(e) => updateErrorHandler(index, {
                        config: { ...handler.config, notificationTemplate: e.target.value }
                      })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Error notification template with {{variables}}"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Recipients
                    </label>
                    <div className="mt-1 space-y-2">
                      {(handler.config.recipients || []).map((recipient, recipientIndex) => (
                        <div key={recipientIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={recipient}
                            onChange={(e) => {
                              const newRecipients = [...(handler.config.recipients || [])];
                              newRecipients[recipientIndex] = e.target.value;
                              updateErrorHandler(index, {
                                config: { ...handler.config, recipients: newRecipients }
                              });
                            }}
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Enter recipient"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newRecipients = [...(handler.config.recipients || [])];
                              newRecipients.splice(recipientIndex, 1);
                              updateErrorHandler(index, {
                                config: { ...handler.config, recipients: newRecipients }
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
                        onClick={() => {
                          const newRecipients = [...(handler.config.recipients || []), ''];
                          updateErrorHandler(index, {
                            config: { ...handler.config, recipients: newRecipients }
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Recipient
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => addErrorHandler('retry')}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Retry
            </Button>
            <Button
              variant="outline"
              onClick={() => addErrorHandler('fallback')}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Fallback
            </Button>
            <Button
              variant="outline"
              onClick={() => addErrorHandler('notification')}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Notification
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ErrorHandling;