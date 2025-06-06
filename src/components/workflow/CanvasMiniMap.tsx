import React from 'react';
import { WorkflowDefinition } from '../../types';

interface CanvasMiniMapProps {
  workflow: WorkflowDefinition;
  canvasSize: { width: number; height: number };
  scale: number;
  offset: { x: number; y: number };
  onOffsetChange: (offset: { x: number; y: number }) => void;
}

const CanvasMiniMap: React.FC<CanvasMiniMapProps> = ({
  workflow,
  canvasSize,
  scale,
  offset,
  onOffsetChange
}) => {
  const miniMapSize = { width: 200, height: 150 };
  
  // Calculate bounds of all elements
  const bounds = workflow.steps.reduce(
    (acc, step) => ({
      minX: Math.min(acc.minX, step.position.x),
      maxX: Math.max(acc.maxX, step.position.x + 100),
      minY: Math.min(acc.minY, step.position.y),
      maxY: Math.max(acc.maxY, step.position.y + 80)
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  );

  if (workflow.steps.length === 0) {
    bounds.minX = 0;
    bounds.maxX = 1000;
    bounds.minY = 0;
    bounds.maxY = 800;
  }

  const workflowWidth = bounds.maxX - bounds.minX;
  const workflowHeight = bounds.maxY - bounds.minY;
  
  const scaleX = miniMapSize.width / workflowWidth;
  const scaleY = miniMapSize.height / workflowHeight;
  const miniScale = Math.min(scaleX, scaleY, 0.2);

  const handleMiniMapClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / miniScale - canvasSize.width / (2 * scale);
    const y = (e.clientY - rect.top) / miniScale - canvasSize.height / (2 * scale);
    
    onOffsetChange({ x: -x * scale, y: -y * scale });
  };

  return (
    <div className="absolute bottom-4 right-4 z-30">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
        <div className="text-xs font-medium text-gray-600 mb-2">Mini Map</div>
        <div
          className="relative bg-gray-50 border border-gray-200 rounded cursor-pointer"
          style={{ width: miniMapSize.width, height: miniMapSize.height }}
          onClick={handleMiniMapClick}
        >
          {/* Workflow Elements */}
          {workflow.steps.map(step => (
            <div
              key={step.id}
              className="absolute bg-blue-500 rounded"
              style={{
                left: (step.position.x - bounds.minX) * miniScale,
                top: (step.position.y - bounds.minY) * miniScale,
                width: 8,
                height: 6
              }}
            />
          ))}
          
          {/* Viewport Indicator */}
          <div
            className="absolute border-2 border-red-500 bg-red-100 bg-opacity-30"
            style={{
              left: (-offset.x / scale - bounds.minX) * miniScale,
              top: (-offset.y / scale - bounds.minY) * miniScale,
              width: (canvasSize.width / scale) * miniScale,
              height: (canvasSize.height / scale) * miniScale
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CanvasMiniMap;