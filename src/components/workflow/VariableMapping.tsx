import React, { useState } from 'react';
import { WorkflowStep } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';

interface VariableMappingProps {
  step: WorkflowStep;
  onUpdate: (updates: Partial<WorkflowStep>) => void;
}

interface Variable {
  name: string;
  type: 'input' | 'output';
  source: string;
  target: string;
  transform?: string;
}

const VariableMapping: React.FC<VariableMappingProps> = ({ step, onUpdate }) => {
  const [variables, setVariables] = useState<Variable[]>(
    step.config?.variables || []
  );

  const handleVariableChange = (index: number, updates: Partial<Variable>) => {
    const updatedVariables = [...variables];
    updatedVariables[index] = { ...updatedVariables[index], ...updates };
    
    setVariables(updatedVariables);
    onUpdate({
      config: {
        ...step.config,
        variables: updatedVariables
      }
    });
  };

  const addVariable = () => {
    const newVariable: Variable = {
      name: '',
      type: 'input',
      source: '',
      target: ''
    };
    
    setVariables([...variables, newVariable]);
    onUpdate({
      config: {
        ...step.config,
        variables: [...variables, newVariable]
      }
    });
  };

  const removeVariable = (index: number) => {
    const updatedVariables = variables.filter((_, i) => i !== index);
    setVariables(updatedVariables);
    onUpdate({
      config: {
        ...step.config,
        variables: updatedVariables
      }
    });
  };

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Variable Mapping</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure how data flows in and out of this step
          </p>
        </div>

        <div className="space-y-4">
          {variables.map((variable, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">
                  Variable {index + 1}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariable(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={variable.name}
                    onChange={(e) => handleVariableChange(index, { name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Variable name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={variable.type}
                    onChange={(e) => handleVariableChange(index, { type: e.target.value as 'input' | 'output' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="input">Input</option>
                    <option value="output">Output</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Source
                  </label>
                  <input
                    type="text"
                    value={variable.source}
                    onChange={(e) => handleVariableChange(index, { source: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Source path"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Target
                  </label>
                  <input
                    type="text"
                    value={variable.target}
                    onChange={(e) => handleVariableChange(index, { target: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Target path"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Transform (Optional)
                  </label>
                  <textarea
                    value={variable.transform || ''}
                    onChange={(e) => handleVariableChange(index, { transform: e.target.value })}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono"
                    placeholder="JavaScript transformation function"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addVariable}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Variable Mapping
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default VariableMapping;