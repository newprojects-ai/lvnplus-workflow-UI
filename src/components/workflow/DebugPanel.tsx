import React, { useState } from 'react';
import { WorkflowDefinition, WorkflowInstance } from '../../types';
import Card from '../ui/Card';
import { Bug, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DebugPanelProps {
  workflow: WorkflowDefinition;
  instance?: WorkflowInstance;
}

interface DebugInfo {
  type: 'info' | 'warning' | 'error';
  message: string;
  details?: string[];
}

const DebugPanel: React.FC<DebugPanelProps> = ({ workflow, instance }) => {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const analyzeWorkflow = (): DebugInfo[] => {
    const issues: DebugInfo[] = [];

    // Check for basic workflow structure
    if (!workflow.steps.some(s => s.type === 'start')) {
      issues.push({
        type: 'error',
        message: 'Workflow missing start step'
      });
    }

    if (!workflow.steps.some(s => s.type === 'end')) {
      issues.push({
        type: 'error',
        message: 'Workflow missing end step'
      });
    }

    // Check for isolated steps
    workflow.steps.forEach(step => {
      const hasIncoming = workflow.transitions.some(t => t.to === step.id);
      const hasOutgoing = workflow.transitions.some(t => t.from === step.id);

      if (!hasIncoming && step.type !== 'start') {
        issues.push({
          type: 'warning',
          message: `Step "${step.name}" has no incoming transitions`
        });
      }

      if (!hasOutgoing && step.type !== 'end') {
        issues.push({
          type: 'warning',
          message: `Step "${step.name}" has no outgoing transitions`
        });
      }
    });

    // Check decision steps
    workflow.steps
      .filter(s => s.type === 'decision')
      .forEach(step => {
        const outgoingTransitions = workflow.transitions.filter(t => t.from === step.id);
        
        if (outgoingTransitions.length < 2) {
          issues.push({
            type: 'error',
            message: `Decision step "${step.name}" has fewer than 2 paths`
          });
        }

        const missingConditions = outgoingTransitions.filter(t => !t.condition);
        if (missingConditions.length > 0) {
          issues.push({
            type: 'warning',
            message: `Decision step "${step.name}" has transitions without conditions`,
            details: missingConditions.map(t => {
              const toStep = workflow.steps.find(s => s.id === t.to);
              return `Transition to "${toStep?.name || t.to}"`;
            })
          });
        }
      });

    // Check for proper step configuration
    workflow.steps.forEach(step => {
      switch (step.type) {
        case 'service':
          if (!step.config?.service?.endpoint) {
            issues.push({
              type: 'warning',
              message: `Service step "${step.name}" missing endpoint configuration`
            });
          }
          break;
        case 'script':
          if (!step.config?.script?.code) {
            issues.push({
              type: 'warning',
              message: `Script step "${step.name}" missing code`
            });
          }
          break;
        case 'timer':
          if (!step.config?.timer?.value) {
            issues.push({
              type: 'warning',
              message: `Timer step "${step.name}" missing timing configuration`
            });
          }
          break;
      }
    });

    // Check instance state if available
    if (instance) {
      const currentStep = workflow.steps.find(s => s.id === instance.currentStepId);
      if (!currentStep) {
        issues.push({
          type: 'error',
          message: 'Instance references non-existent step'
        });
      }

      // Check for long-running steps
      const currentStepHistory = instance.history.find(h => 
        h.stepId === instance.currentStepId && !h.exitedAt
      );
      if (currentStepHistory) {
        const duration = Date.now() - currentStepHistory.enteredAt.getTime();
        if (duration > 3600000) { // 1 hour
          issues.push({
            type: 'warning',
            message: `Current step "${currentStep?.name}" has been running for over an hour`
          });
        }
      }
    }

    return issues;
  };

  const issues = analyzeWorkflow();
  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;

  return (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Debug Information</h2>
            <p className="mt-1 text-sm text-gray-500">
              Analyze workflow structure and execution
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="autoRefresh" className="ml-2 text-sm text-gray-600">
                Auto-refresh
              </label>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center text-red-600">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {errorCount} errors
              </span>
              <span className="flex items-center text-amber-600">
                <Bug className="h-4 w-4 mr-1" />
                {warningCount} warnings
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {issues.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
              <p className="text-sm text-green-700">
                No issues detected in workflow configuration
              </p>
            </div>
          ) : (
            issues.map((issue, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 ${
                  issue.type === 'error'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-amber-50 border border-amber-200'
                }`}
              >
                <div className="flex items-center">
                  {issue.type === 'error' ? (
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                  ) : (
                    <Bug className="h-5 w-5 text-amber-600 mr-3" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${
                      issue.type === 'error' ? 'text-red-800' : 'text-amber-800'
                    }`}>
                      {issue.message}
                    </p>
                    {issue.details && (
                      <ul className={`mt-2 text-sm list-disc list-inside ${
                        issue.type === 'error' ? 'text-red-700' : 'text-amber-700'
                      }`}>
                        {issue.details.map((detail, i) => (
                          <li key={i}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {instance && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Instance Debug Data
            </h3>
            <pre className="bg-gray-50 rounded-lg p-4 text-sm font-mono overflow-x-auto">
              {JSON.stringify(instance, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DebugPanel;