import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import WorkflowCanvas from '../components/workflow/WorkflowCanvas';
import ValidationPanel from '../components/workflow/ValidationPanel';
import StepConfigPanel from '../components/workflow/StepConfigPanel';
import RoleGuard from '../components/auth/RoleGuard';
import { WorkflowDefinition, WorkflowStep } from '../types';
import { workflowService } from '../services';
import { useUser } from '../context/UserContext';
import { Save, ArrowLeft } from 'lucide-react';

const NewWorkflow: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowDefinition>({
    id: '',
    name: 'New Workflow',
    description: '',
    version: '1.0',
    status: 'draft',
    steps: [],
    transitions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: currentUser?.id || ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!workflow.name.trim()) {
        setError('Workflow name is required');
        return;
      }

      if (workflow.steps.length === 0) {
        setError('Workflow must have at least one step');
        return;
      }

      const savedWorkflow = await workflowService.createWorkflow(workflow);
      navigate(`/workflows/${savedWorkflow.id}`);
    } catch (err) {
      setError('Failed to save workflow');
      console.error('Error saving workflow:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkflowChange = (updatedWorkflow: WorkflowDefinition) => {
    setWorkflow(updatedWorkflow);
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));
  };

  const selectedStepData = selectedStep 
    ? workflow.steps.find(s => s.id === selectedStep)
    : null;

  return (
    <Layout requiredPermissions={['workflow:create']}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/workflows')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Workflows
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Workflow</h1>
            <p className="text-gray-600">Design your automated business process</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/workflows')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            isLoading={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Workflow
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Main Canvas Area */}
        <div className="xl:col-span-3">
          <Card className="h-full p-0 overflow-hidden relative">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <input
                    type="text"
                    value={workflow.name}
                    onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                    className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                    placeholder="Enter workflow name"
                  />
                  <div className="mt-1">
                    <input
                      type="text"
                      value={workflow.description}
                      onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
                      className="text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full"
                      placeholder="Add a description..."
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {workflow.steps.length} steps, {workflow.transitions.length} connections
                </div>
              </div>
            </div>
            
            <div className="h-[calc(100%-80px)] relative">
              <WorkflowCanvas
                workflow={workflow}
                onWorkflowChange={handleWorkflowChange}
                selectedStepId={selectedStep}
                onStepSelect={setSelectedStep}
                isReadOnly={false}
              />
            </div>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="space-y-6 overflow-y-auto">
          {selectedStepData ? (
            <StepConfigPanel
              step={selectedStepData}
              onUpdate={(updates) => updateStep(selectedStep!, updates)}
            />
          ) : (
            <Card>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Save className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Step Selected</h3>
                <p className="text-gray-500 text-sm">
                  Select a step from the canvas to configure its properties and settings.
                </p>
              </div>
            </Card>
          )}

          <ValidationPanel workflow={workflow} />

          {error && (
            <Card>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NewWorkflow;