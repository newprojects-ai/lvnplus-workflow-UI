import React, { useState } from 'react';
import { WorkflowDefinition, WorkflowInstance } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Play, Pause, SkipForward, RefreshCw } from 'lucide-react';

interface WorkflowSimulatorProps {
  workflow: WorkflowDefinition;
  onInstanceUpdate?: (instance: WorkflowInstance) => void;
}

const WorkflowSimulator: React.FC<WorkflowSimulatorProps> = ({
  workflow,
  onInstanceUpdate
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [instance, setInstance] = useState<WorkflowInstance | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };

  const startSimulation = () => {
    const startStep = workflow.steps.find(s => s.type === 'start');
    if (!startStep) {
      addLog('Error: No start step found');
      return;
    }

    const newInstance: WorkflowInstance = {
      id: `sim-${Date.now()}`,
      definitionId: workflow.id,
      status: 'active',
      currentStepId: startStep.id,
      data: {},
      history: [{
        stepId: startStep.id,
        stepName: startStep.name,
        enteredAt: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setInstance(newInstance);
    onInstanceUpdate?.(newInstance);
    setIsRunning(true);
    addLog('Simulation started');
  };

  const stepForward = () => {
    if (!instance) return;

    const currentStep = workflow.steps.find(s => s.id === instance.currentStepId);
    if (!currentStep) {
      addLog('Error: Current step not found');
      return;
    }

    // Find next step
    const transitions = workflow.transitions.filter(t => t.from === currentStep.id);
    if (transitions.length === 0) {
      if (currentStep.type === 'end') {
        setInstance(prev => prev ? {
          ...prev,
          status: 'completed',
          updatedAt: new Date()
        } : null);
        setIsRunning(false);
        addLog('Workflow completed');
        return;
      }
      addLog('Error: No transitions found from current step');
      return;
    }

    // For decision steps, evaluate conditions
    let nextTransition = transitions[0];
    if (currentStep.type === 'decision' && transitions.length > 1) {
      // Simulate condition evaluation
      nextTransition = transitions.find(t => {
        if (!t.condition) return false;
        try {
          // Simple condition evaluation (for simulation)
          return Math.random() > 0.5;
        } catch (e) {
          return false;
        }
      }) || transitions[0];
    }

    const nextStep = workflow.steps.find(s => s.id === nextTransition.to);
    if (!nextStep) {
      addLog('Error: Next step not found');
      return;
    }

    // Update history
    const currentHistory = instance.history.find(h => 
      h.stepId === currentStep.id && !h.exitedAt
    );
    if (currentHistory) {
      currentHistory.exitedAt = new Date();
    }

    // Create new instance
    const updatedInstance: WorkflowInstance = {
      ...instance,
      currentStepId: nextStep.id,
      history: [
        ...instance.history,
        {
          stepId: nextStep.id,
          stepName: nextStep.name,
          enteredAt: new Date()
        }
      ],
      updatedAt: new Date()
    };

    setInstance(updatedInstance);
    onInstanceUpdate?.(updatedInstance);
    addLog(`Moved to step: ${nextStep.name}`);
  };

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Workflow Simulator</h2>
          <p className="mt-1 text-sm text-gray-500">
            Test and debug your workflow execution
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant={isRunning ? 'danger' : 'primary'}
            onClick={() => {
              if (!isRunning) {
                startSimulation();
              } else {
                setIsRunning(false);
                addLog('Simulation paused');
              }
            }}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={stepForward}
            disabled={!instance || instance.status === 'completed'}
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Step Forward
          </Button>

          <Button
            variant="ghost"
            onClick={() => {
              setInstance(null);
              setLogs([]);
              setIsRunning(false);
              addLog('Simulation reset');
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-600">Speed:</span>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="rounded-md border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={5}>5x</option>
            </select>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h3 className="text-sm font-medium text-gray-700">Simulation Logs</h3>
          </div>
          <div className="h-48 overflow-y-auto p-4 space-y-1 font-mono text-sm">
            {logs.map((log, index) => (
              <div key={index} className="text-gray-600">{log}</div>
            ))}
            {logs.length === 0 && (
              <div className="text-gray-400 italic">No logs yet</div>
            )}
          </div>
        </div>

        {instance && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Current State</h3>
              <div className="mt-2 bg-gray-50 rounded-lg p-4">
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm font-medium text-gray-900">
                      {instance.status}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Current Step</dt>
                    <dd className="mt-1 text-sm font-medium text-gray-900">
                      {workflow.steps.find(s => s.id === instance.currentStepId)?.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Steps Completed</dt>
                    <dd className="mt-1 text-sm font-medium text-gray-900">
                      {instance.history.filter(h => h.exitedAt).length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Time Elapsed</dt>
                    <dd className="mt-1 text-sm font-medium text-gray-900">
                      {Math.round((new Date().getTime() - instance.createdAt.getTime()) / 1000)}s
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default WorkflowSimulator;