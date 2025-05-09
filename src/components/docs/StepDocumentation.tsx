import React from 'react';
import { WorkflowStep } from '../../types';
import Card from '../ui/Card';

interface StepDocumentationProps {
  step: WorkflowStep;
}

const StepDocumentation: React.FC<StepDocumentationProps> = ({ step }) => {
  const getStepDescription = (type: string): string => {
    switch (type) {
      case 'start':
        return 'Initiates the workflow execution. Every workflow must have exactly one start step.';
      case 'end':
        return 'Terminates the workflow execution. A workflow can have multiple end steps.';
      case 'task':
        return 'A human task that requires user input or action.';
      case 'service':
        return 'Calls an external service or API endpoint.';
      case 'script':
        return 'Executes custom code or business logic.';
      case 'decision':
        return 'Evaluates conditions to determine the next step.';
      case 'timer':
        return 'Introduces delays or schedules actions.';
      case 'message':
        return 'Sends notifications or messages to users.';
      case 'notification':
        return 'Triggers system notifications or alerts.';
      case 'error':
        return 'Handles error conditions and exceptions.';
      default:
        return 'Custom step type.';
    }
  };

  const renderConfigDocs = () => {
    switch (step.type) {
      case 'service':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Service Configuration</h4>
            <dl className="space-y-2">
              <dt className="text-sm font-medium text-gray-700">Endpoint</dt>
              <dd className="text-sm text-gray-600 ml-4">
                {step.config?.service?.endpoint || 'Not configured'}
              </dd>
              
              <dt className="text-sm font-medium text-gray-700">Method</dt>
              <dd className="text-sm text-gray-600 ml-4">
                {step.config?.service?.method || 'GET'}
              </dd>
              
              <dt className="text-sm font-medium text-gray-700">Headers</dt>
              <dd className="text-sm text-gray-600 ml-4">
                {Object.entries(step.config?.service?.headers || {}).map(([key, value]) => (
                  <div key={key}>{key}: {value}</div>
                ))}
              </dd>
            </dl>
          </div>
        );

      case 'script':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Script Configuration</h4>
            <dl className="space-y-2">
              <dt className="text-sm font-medium text-gray-700">Language</dt>
              <dd className="text-sm text-gray-600 ml-4">
                {step.config?.script?.language || 'javascript'}
              </dd>
              
              <dt className="text-sm font-medium text-gray-700">Code</dt>
              <dd className="text-sm font-mono bg-gray-50 p-2 rounded">
                {step.config?.script?.code || 'No code provided'}
              </dd>
            </dl>
          </div>
        );

      case 'task':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Form Configuration</h4>
            <div className="space-y-2">
              {step.config?.form?.fields.map((field, index) => (
                <div key={index} className="border rounded p-2">
                  <h5 className="text-sm font-medium text-gray-900">{field.label}</h5>
                  <dl className="mt-2 space-y-1">
                    <div className="flex">
                      <dt className="text-sm text-gray-500 w-20">Name:</dt>
                      <dd className="text-sm text-gray-900">{field.name}</dd>
                    </div>
                    <div className="flex">
                      <dt className="text-sm text-gray-500 w-20">Type:</dt>
                      <dd className="text-sm text-gray-900">{field.type}</dd>
                    </div>
                    <div className="flex">
                      <dt className="text-sm text-gray-500 w-20">Required:</dt>
                      <dd className="text-sm text-gray-900">{field.required ? 'Yes' : 'No'}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">{step.name}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {getStepDescription(step.type)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium text-gray-900">Step Type</h3>
            <p className="mt-1 text-gray-600">{step.type}</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">Position</h3>
            <p className="mt-1 text-gray-600">
              x: {step.position.x}, y: {step.position.y}
            </p>
          </div>
        </div>

        {step.config?.variables && step.config.variables.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Variables</h3>
            <div className="space-y-2">
              {step.config.variables.map((variable, index) => (
                <div key={index} className="border rounded p-2">
                  <dl className="space-y-1">
                    <div className="flex">
                      <dt className="text-sm text-gray-500 w-20">Name:</dt>
                      <dd className="text-sm text-gray-900">{variable.name}</dd>
                    </div>
                    <div className="flex">
                      <dt className="text-sm text-gray-500 w-20">Type:</dt>
                      <dd className="text-sm text-gray-900">{variable.type}</dd>
                    </div>
                    <div className="flex">
                      <dt className="text-sm text-gray-500 w-20">Source:</dt>
                      <dd className="text-sm text-gray-900">{variable.source}</dd>
                    </div>
                    <div className="flex">
                      <dt className="text-sm text-gray-500 w-20">Target:</dt>
                      <dd className="text-sm text-gray-900">{variable.target}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </div>
        )}

        {step.config?.errorHandlers && step.config.errorHandlers.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Error Handlers</h3>
            <div className="space-y-2">
              {step.config.errorHandlers.map((handler, index) => (
                <div key={index} className="border rounded p-2">
                  <h4 className="text-sm font-medium text-gray-900 capitalize">
                    {handler.type} Handler
                  </h4>
                  <pre className="mt-2 text-xs bg-gray-50 p-2 rounded">
                    {JSON.stringify(handler.config, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {renderConfigDocs()}
      </div>
    </Card>
  );
};

export default StepDocumentation;