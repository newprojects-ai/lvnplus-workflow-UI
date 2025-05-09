import React from 'react';
import { WorkflowDefinition, WorkflowStep } from '../../types';
import Card from '../ui/Card';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ValidationPanelProps {
  workflow: WorkflowDefinition;
}

interface ValidationRule {
  id: string;
  name: string;
  validate: (workflow: WorkflowDefinition) => ValidationResult;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
  details?: string[];
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({ workflow }) => {
  const validationRules: ValidationRule[] = [
    {
      id: 'start-end',
      name: 'Start and End Steps',
      validate: (wf) => {
        const startSteps = wf.steps.filter(s => s.type === 'start');
        const endSteps = wf.steps.filter(s => s.type === 'end');
        
        if (startSteps.length === 0) {
          return {
            isValid: false,
            message: 'Workflow must have a start step',
          };
        }
        
        if (startSteps.length > 1) {
          return {
            isValid: false,
            message: 'Workflow cannot have multiple start steps',
          };
        }
        
        if (endSteps.length === 0) {
          return {
            isValid: false,
            message: 'Workflow must have at least one end step',
          };
        }
        
        return {
          isValid: true,
          message: 'Start and end steps are valid',
        };
      }
    },
    {
      id: 'connectivity',
      name: 'Step Connectivity',
      validate: (wf) => {
        const startStep = wf.steps.find(s => s.type === 'start');
        if (!startStep) return { isValid: true, message: 'No start step to check' };
        
        // Find all reachable steps from start
        const reachableSteps = new Set<string>();
        const stack = [startStep.id];
        
        while (stack.length > 0) {
          const currentId = stack.pop()!;
          reachableSteps.add(currentId);
          
          const outgoingTransitions = wf.transitions.filter(t => t.from === currentId);
          for (const transition of outgoingTransitions) {
            if (!reachableSteps.has(transition.to)) {
              stack.push(transition.to);
            }
          }
        }
        
        const unreachableSteps = wf.steps
          .filter(s => !reachableSteps.has(s.id))
          .map(s => s.name);
        
        return {
          isValid: unreachableSteps.length === 0,
          message: unreachableSteps.length === 0 
            ? 'All steps are reachable'
            : 'Some steps are not reachable',
          details: unreachableSteps.length > 0 
            ? [`Unreachable steps: ${unreachableSteps.join(', ')}`]
            : undefined
        };
      }
    },
    {
      id: 'decision-paths',
      name: 'Decision Paths',
      validate: (wf) => {
        const decisionSteps = wf.steps.filter(s => s.type === 'decision');
        const invalidDecisions: string[] = [];
        
        for (const step of decisionSteps) {
          const outgoingTransitions = wf.transitions.filter(t => t.from === step.id);
          
          // Check if there are at least two paths
          if (outgoingTransitions.length < 2) {
            invalidDecisions.push(`${step.name} (needs at least two paths)`);
            continue;
          }
          
          // Check if all paths have conditions
          const missingConditions = outgoingTransitions.some(t => !t.condition);
          if (missingConditions) {
            invalidDecisions.push(`${step.name} (missing conditions)`);
          }
        }
        
        return {
          isValid: invalidDecisions.length === 0,
          message: invalidDecisions.length === 0
            ? 'All decision steps are valid'
            : 'Some decision steps are invalid',
          details: invalidDecisions
        };
      }
    },
    {
      id: 'step-config',
      name: 'Step Configuration',
      validate: (wf) => {
        const invalidSteps: string[] = [];
        
        for (const step of wf.steps) {
          switch (step.type) {
            case 'service':
              if (!step.config?.service?.endpoint) {
                invalidSteps.push(`${step.name} (missing endpoint)`);
              }
              break;
            case 'script':
              if (!step.config?.script?.code) {
                invalidSteps.push(`${step.name} (missing code)`);
              }
              break;
            case 'timer':
              if (!step.config?.timer?.value) {
                invalidSteps.push(`${step.name} (missing timer value)`);
              }
              break;
            case 'message':
              if (!step.config?.message?.template || !step.config?.message?.recipients?.length) {
                invalidSteps.push(`${step.name} (missing template or recipients)`);
              }
              break;
          }
        }
        
        return {
          isValid: invalidSteps.length === 0,
          message: invalidSteps.length === 0
            ? 'All steps are properly configured'
            : 'Some steps are missing configuration',
          details: invalidSteps
        };
      }
    }
  ];

  const results = validationRules.map(rule => ({
    ...rule,
    result: rule.validate(workflow)
  }));

  const isValid = results.every(r => r.result.isValid);

  return (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Workflow Validation</h2>
            <p className="mt-1 text-sm text-gray-500">
              Check if your workflow meets all requirements
            </p>
          </div>
          <div className={`flex items-center ${isValid ? 'text-green-600' : 'text-amber-600'}`}>
            {isValid ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 mr-2" />
            )}
            <span className="text-sm font-medium">
              {isValid ? 'Valid Workflow' : 'Issues Found'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {results.map(({ id, name, result }) => (
            <div 
              key={id}
              className={`p-4 rounded-lg ${
                result.isValid 
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-amber-50 border border-amber-200'
              }`}
            >
              <div className="flex items-center">
                {result.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                )}
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">{name}</h3>
                  <p className={`text-sm ${
                    result.isValid ? 'text-green-700' : 'text-amber-700'
                  }`}>
                    {result.message}
                  </p>
                  {result.details && result.details.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                      {result.details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ValidationPanel;