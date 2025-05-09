import React, { useState } from 'react';
import { FormField } from '../../types';
import { Grip, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../ui/Button';

interface FormBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ fields, onChange }) => {
  const [expandedField, setExpandedField] = useState<string | null>(null);

  const addField = () => {
    const newField: FormField = {
      name: `field_${fields.length + 1}`,
      type: 'text',
      label: 'New Field',
      required: false
    };
    onChange([...fields, newField]);
  };

  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    onChange(newFields);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    onChange(newFields);
  };

  const moveField = (fromIndex: number, toIndex: number) => {
    const newFields = [...fields];
    const [movedField] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, movedField);
    onChange(newFields);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Form Fields</h3>
        <Button onClick={addField} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Field
        </Button>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="flex items-center p-4">
              <div className="cursor-move text-gray-400 hover:text-gray-600">
                <Grip className="h-5 w-5" />
              </div>
              
              <div className="flex-1 ml-3">
                <div className="font-medium text-gray-900">{field.label}</div>
                <div className="text-sm text-gray-500">{field.type}</div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setExpandedField(expandedField === field.name ? null : field.name)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  {expandedField === field.name ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={() => removeField(index)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {expandedField === field.name && (
              <div className="border-t border-gray-200 p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Field Name
                  </label>
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, { name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Label
                  </label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, { type: e.target.value as FormField['type'] })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Text Area</option>
                    <option value="select">Select</option>
                    <option value="radio">Radio</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="file">File</option>
                    <option value="date">Date</option>
                  </select>
                </div>

                {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Options
                    </label>
                    <div className="mt-1 space-y-2">
                      {field.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={option.label}
                            onChange={(e) => {
                              const newOptions = [...(field.options || [])];
                              newOptions[optionIndex] = {
                                ...newOptions[optionIndex],
                                label: e.target.value,
                                value: e.target.value.toLowerCase().replace(/\s+/g, '-')
                              };
                              updateField(index, { options: newOptions });
                            }}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                          <button
                            onClick={() => {
                              const newOptions = [...(field.options || [])];
                              newOptions.splice(optionIndex, 1);
                              updateField(index, { options: newOptions });
                            }}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOptions = [...(field.options || [])];
                          newOptions.push({ label: 'New Option', value: 'new-option' });
                          updateField(index, { options: newOptions });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Option
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(index, { required: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Required field
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}

        {fields.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">No fields added yet. Click "Add Field" to start building your form.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;