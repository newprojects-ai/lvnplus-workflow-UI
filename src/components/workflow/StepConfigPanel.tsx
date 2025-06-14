import React from 'react';
import { WorkflowStep } from '../../types';
import FormBuilder from './FormBuilder';
import TaskConfigPanel from './TaskConfigPanel';
import VariableMapping from './VariableMapping';
import ErrorHandling from './ErrorHandling';
import Card from '../ui/Card';

interface StepConfigPanelProps {
  step: WorkflowStep;
  onUpdate: (updates: Partial<WorkflowStep>) => void;
}

const StepConfigPanel: React.FC<StepConfigPanelProps> = ({ step, onUpdate }) => {
  const updateStepConfig = (fields: any) => {
    onUpdate({
      config: {
        ...step.config,
        form: {
          fields
        }
      }
    });
  };

  return (
    <Card className="h-full">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Step Configuration</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure the form fields and behavior for this step.
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

        {step.type === 'task' ? (
          <FormBuilder
            fields={step.config?.form?.fields || []}
            onChange={updateStepConfig}
          />
        ) : step.type === 'decision' ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Decision steps use conditions defined in the workflow transitions.
                </p>
              </div>
            </div>
          </div>
        ) : ['service', 'script', 'timer', 'message'].includes(step.type) ? (
          <TaskConfigPanel step={step} onUpdate={onUpdate} />
        ) : null}

        {/* Show Variable Mapping for all step types except start/end */}
        {!['start', 'end'].includes(step.type) && (
          <VariableMapping step={step} onUpdate={onUpdate} />
        )}

        {/* Show Error Handling for all step types except start/end/decision */}
        {!['start', 'end', 'decision'].includes(step.type) && (
          <ErrorHandling step={step} onUpdate={onUpdate} />
        )}
      </div>
    </Card>
  );
};

export default StepConfigPanel;