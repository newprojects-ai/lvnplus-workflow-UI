import React, { useState, useEffect, useRef } from 'react';
import { WorkflowDefinition, WorkflowInstance } from '../../types';

interface WorkflowVisualizerProps {
  workflow: WorkflowDefinition;
  instance?: WorkflowInstance;
  className?: string;
  isInteractive?: boolean;
}

const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({
  workflow,
  instance,
  className = '',
  isInteractive = false
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Calculate canvas size based on steps
  useEffect(() => {
    if (!canvasRef.current || !workflow.steps.length) return;
    
    // Find the dimensions of the workflow
    const minX = Math.min(...workflow.steps.map(step => step.position.x));
    const maxX = Math.max(...workflow.steps.map(step => step.position.x));
    const minY = Math.min(...workflow.steps.map(step => step.position.y));
    const maxY = Math.max(...workflow.steps.map(step => step.position.y));
    
    // Center the workflow in the canvas
    const canvasWidth = canvasRef.current.clientWidth;
    const canvasHeight = canvasRef.current.clientHeight;
    const workflowWidth = maxX - minX + 200; // Add padding
    const workflowHeight = maxY - minY + 200; // Add padding
    
    const initialScale = Math.min(
      canvasWidth / workflowWidth,
      canvasHeight / workflowHeight,
      1 // Don't scale up beyond 100%
    );
    
    setScale(initialScale);
    
    const initialPanX = (canvasWidth - workflowWidth * initialScale) / 2 - minX * initialScale + 50 * initialScale;
    const initialPanY = (canvasHeight - workflowHeight * initialScale) / 2 - minY * initialScale + 50 * initialScale;
    
    setPanOffset({ x: initialPanX, y: initialPanY });
  }, [workflow, canvasRef]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isInteractive) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isInteractive) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPanOffset({
      x: panOffset.x + dx,
      y: panOffset.y + dy
    });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!isInteractive) return;
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(Math.max(0.1, Math.min(2, scale * scaleFactor)));
  };

  const getStepColorByType = (type: string): string => {
    switch (type) {
      case 'start': return '#2ecc71'; // Green
      case 'end': return '#e74c3c'; // Red
      case 'task': return '#3498db'; // Blue
      case 'decision': return '#f39c12'; // Yellow
      default: return '#95a5a6'; // Gray
    }
  };

  const getStepStatus = (stepId: string): 'completed' | 'active' | 'pending' => {
    if (!instance) return 'pending';
    
    // Check if this is the current step
    if (instance.currentStepId === stepId) {
      return 'active';
    }
    
    // Check if this step exists in history and has an exit time
    const historyEntry = instance.history.find(h => h.stepId === stepId);
    if (historyEntry && historyEntry.exitedAt) {
      return 'completed';
    }
    
    return 'pending';
  };

  return (
    <div
      className={`relative border border-gray-300 bg-white rounded-lg overflow-hidden ${className}`}
      style={{ height: '500px' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      ref={canvasRef}
    >
      {isInteractive && (
        <div className="absolute top-2 right-2 z-10 bg-white rounded-md shadow p-1 flex space-x-1">
          <button
            onClick={() => setScale(scale + 0.1)}
            className="text-blue-600 hover:bg-blue-50 p-1 rounded"
          >
            +
          </button>
          <button
            onClick={() => setScale(Math.max(0.1, scale - 0.1))}
            className="text-blue-600 hover:bg-blue-50 p-1 rounded"
          >
            -
          </button>
          <button
            onClick={() => {
              setScale(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="text-blue-600 hover:bg-blue-50 p-1 rounded text-xs"
          >
            Reset
          </button>
        </div>
      )}
      
      <div
        className="absolute"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.2s',
          cursor: isInteractive ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
      >
        {/* Draw Transitions/Connections */}
        <svg width="3000" height="3000" className="absolute top-0 left-0 pointer-events-none">
          {workflow.transitions.map(transition => {
            const fromStep = workflow.steps.find(s => s.id === transition.from);
            const toStep = workflow.steps.find(s => s.id === transition.to);
            
            if (!fromStep || !toStep) return null;
            
            const fromX = fromStep.position.x + 60; // Half width of step
            const fromY = fromStep.position.y + 40; // Half height of step
            const toX = toStep.position.x + 60;
            const toY = toStep.position.y + 40;

            // Calculate arrow points
            const angle = Math.atan2(toY - fromY, toX - fromX);
            const arrowLength = 15;
            const arrowX1 = toX - arrowLength * Math.cos(angle - Math.PI / 6);
            const arrowY1 = toY - arrowLength * Math.sin(angle - Math.PI / 6);
            const arrowX2 = toX - arrowLength * Math.cos(angle + Math.PI / 6);
            const arrowY2 = toY - arrowLength * Math.sin(angle + Math.PI / 6);

            // Determine the color based on status
            let color = '#94a3b8'; // Default gray
            if (instance) {
              const fromStatus = getStepStatus(fromStep.id);
              const toStatus = getStepStatus(toStep.id);
              
              if (fromStatus === 'completed' && toStatus === 'completed') {
                color = '#2ecc71'; // Green for completed
              } else if (fromStatus === 'completed' && toStatus === 'active') {
                color = '#3498db'; // Blue for active
              }
            }
            
            return (
              <g key={transition.id}>
                <line
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke={color}
                  strokeWidth="2"
                  strokeDasharray={
                    transition.condition ? "5,5" : "none"
                  }
                />
                {/* Arrow head */}
                <polygon
                  points={`${toX},${toY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
                  fill={color}
                />
                
                {/* Condition text if present */}
                {transition.condition && (
                  <text
                    x={(fromX + toX) / 2}
                    y={(fromY + toY) / 2 - 10}
                    fill="#475569"
                    fontSize="12"
                    textAnchor="middle"
                    dy=".3em"
                    style={{ pointerEvents: 'none' }}
                  >
                    {transition.condition}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        
        {/* Draw Steps */}
        {workflow.steps.map(step => {
          const stepColor = getStepColorByType(step.type);
          const stepStatus = instance ? getStepStatus(step.id) : 'pending';
          
          let statusClass = '';
          switch(stepStatus) {
            case 'completed':
              statusClass = 'border-green-500 bg-green-50';
              break;
            case 'active':
              statusClass = 'border-blue-500 bg-blue-50 animate-pulse';
              break;
            default:
              statusClass = 'border-gray-300 bg-white';
          }
          
          return (
            <div
              key={step.id}
              className={`absolute rounded-md border-2 shadow-sm ${statusClass} flex flex-col items-center p-3 transition-colors duration-300`}
              style={{
                left: step.position.x,
                top: step.position.y,
                width: '120px',
                height: '80px',
                zIndex: 1
              }}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center mb-2"
                style={{ backgroundColor: stepColor }}
              >
                {step.type === 'start' && <span className="text-white">S</span>}
                {step.type === 'end' && <span className="text-white">E</span>}
                {step.type === 'task' && <span className="text-white">T</span>}
                {step.type === 'decision' && <span className="text-white">D</span>}
              </div>
              <span className="text-xs font-medium text-gray-900 text-center line-clamp-2">
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowVisualizer;