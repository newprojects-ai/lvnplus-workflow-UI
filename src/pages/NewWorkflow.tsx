import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import WorkflowVisualizer from '../components/workflow/WorkflowVisualizer';
import ValidationPanel from '../components/workflow/ValidationPanel';
import StepConfigPanel from '../components/workflow/StepConfigPanel';
import WorkflowToolbar from '../components/workflow/WorkflowToolbar';
import RoleGuard from '../components/auth/RoleGuard';
import { WorkflowDefinition, WorkflowStep, WorkflowTransition } from '../types';
import { workflowService } from '../services';
import { useUser } from '../context/UserContext';
import { Save, Plus, Workflow } from 'lucide-react';

const NewWorkflow: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowDefinition>({
    id: '',
    name: '',
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

      if (workflow.steps.length < 2) {
        setError('Workflow must have at least a start and end step');
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

  const addStep = (type: WorkflowStep['type']) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      name: type === 'start' ? 'Start' : type === 'end' ? 'End' : `New ${type} Step`,
      type,
      position: {
        x: 100 + workflow.steps.length * 200,
        y: 200
      }
    };

    if (type === 'task') {
      newStep.config = {
        form: {
          fields: []
        }
      };
    }

    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));
  };

  const addTransition = (fromId: string, toId: string) => {
    const newTransition: WorkflowTransition = {
      id: `transition-${Date.now()}`,
      from: fromId,
      to: toId
    };

    setWorkflow(prev => ({
      ...prev,
      transitions: [...prev.transitions, newTransition]
    }));
  };

  const handleStepMove = (stepId: string, newPosition: { x: number; y: number }) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId ? { ...step, position: newPosition } : step
      )
    }));
  };

  const handleStepDelete = (stepId: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId),
      transitions: prev.transitions.filter(t => 
        t.from !== stepId && t.to !== stepId
      )
    }));
  };

  const handleTransitionCreate = (fromId: string, toId: string) => {
    // Prevent self-transitions
    if (fromId === toId) return;
    
    // Prevent duplicate transitions
    if (workflow.transitions.some(t => t.from === fromId && t.to === toId)) return;
    
    const newTransition = {
      id: `transition-${Date.now()}`,
      from: fromId,
      to: toId
    };

    setWorkflow(prev => ({
      ...prev,
      transitions: [...prev.transitions, newTransition]
    }));
  };

  const handleTransitionDelete = (transitionId: string) => {
    setWorkflow(prev => ({
      ...prev,
      transitions: prev.transitions.filter(t => t.id !== transitionId)
    }));
  };

  return (
    <Layout requiredPermissions={['workflow:create']}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Workflow</h1>
        <p className="text-gray-600 mt-1">Design your workflow process</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Workflow Name
                </label>
                <input
                  type="text"
                  value={workflow.name}
                  onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter workflow name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={workflow.description}
                  onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Describe the purpose of this workflow"
                />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Workflow Design</h2>
              <div className="flex gap-2">
                <RoleGuard permissions={['workflow:edit']}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addStep('task')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Task
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addStep('decision')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Decision
                  </Button>
                </RoleGuard>
              </div>
            </div>

            {workflow.steps.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Workflow className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No steps added</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding a start step</p>
                <div className="mt-6">
                  <Button onClick={() => addStep('start')}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Start Step
                  </Button>
                </div>
              </div>
            ) : (
              <DndProvider backend={HTML5Backend}>
                <WorkflowToolbar onAddStep={addStep} />
                <WorkflowVisualizer
                  workflow={workflow}
                  isInteractive={true}
                  onStepMove={handleStepMove}
                  onStepDelete={handleStepDelete}
                  onTransitionCreate={handleTransitionCreate}
                  onTransitionDelete={handleTransitionDelete}
                  onStepSelect={setSelectedStep}
                  selectedStepId={selectedStep}
                />
              </DndProvider>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {selectedStep ? (
            <StepConfigPanel
              step={workflow.steps.find(s => s.id === selectedStep)!}
              onUpdate={(updates) => updateStep(selectedStep, updates)}
            />
          ) : (
            <Card>
              <div className="text-center py-6">
                <p className="text-gray-500">Select a step to configure its properties</p>
              </div>
            </Card>
          )}

          <ValidationPanel workflow={workflow} />

          <Card>
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Workflow Details</h2>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Version</h3>
                <p className="mt-1 text-lg font-medium">{workflow.version}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1 text-lg font-medium capitalize">{workflow.status}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Steps</h3>
                <p className="mt-1 text-lg font-medium">{workflow.steps.length}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Transitions</h3>
                <p className="mt-1 text-lg font-medium">{workflow.transitions.length}</p>
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/workflows')}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              isLoading={isLoading}
            >
              <Save className="h-4 w-4 mr-1" />
              Save Workflow
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NewWorkflow;