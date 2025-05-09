import React, { useState } from 'react';
import { WorkflowStep } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Play, RefreshCw } from 'lucide-react';

interface StepTesterProps {
  step: WorkflowStep;
  onComplete?: (output: any) => void;
}

const StepTester: React.FC<StepTesterProps> = ({ step, onComplete }) => {
  const [input, setInput] = useState<string>('{}');
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const executeStep = async () => {
    setIsLoading(true);
    setError(null);
    setOutput(null);

    try {
      let inputData = JSON.parse(input);
      let result: any;

      switch (step.type) {
        case 'service':
          if (!step.config?.service?.endpoint) {
            throw new Error('Service endpoint not configured');
          }
          
          // Simulate service call
          await new Promise(resolve => setTimeout(resolve, 1000));
          result = { status: 'success', data: { message: 'Service call simulated' } };
          break;

        case 'script':
          if (!step.config?.script?.code) {
            throw new Error('Script code not configured');
          }

          // Simulate script execution
          const code = step.config.script.code;
          if (step.config.script.language === 'javascript') {
            // Execute in sandbox
            const fn = new Function('input', code);
            result = fn(inputData);
          } else {
            throw new Error('Python execution not supported in simulation');
          }
          break;

        case 'task':
          if (!step.config?.form?.fields) {
            throw new Error('Form not configured');
          }

          // Validate form data
          for (const field of step.config.form.fields) {
            if (field.required && !inputData[field.name]) {
              throw new Error(`Required field ${field.name} is missing`);
            }
          }

          result = { ...inputData, validated: true };
          break;

        default:
          result = { ...inputData, stepType: step.type };
      }

      setOutput(JSON.stringify(result, null, 2));
      onComplete?.(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Step Tester</h2>
          <p className="mt-1 text-sm text-gray-500">
            Test individual step execution with sample data
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Input Data (JSON)
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={executeStep}
            isLoading={isLoading}
          >
            <Play className="h-4 w-4 mr-2" />
            Execute Step
          </Button>

          <Button
            variant="ghost"
            onClick={() => {
              setInput('{}');
              setOutput(null);
              setError(null);
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        )}

        {output && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Output</h3>
            <pre className="bg-gray-50 rounded-lg p-4 text-sm font-mono overflow-x-auto">
              {output}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StepTester;