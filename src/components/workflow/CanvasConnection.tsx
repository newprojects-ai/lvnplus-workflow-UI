import React from 'react';
import { WorkflowTransition, WorkflowStep } from '../../types';

interface CanvasConnectionProps {
  transition: WorkflowTransition;
  fromStep?: WorkflowStep;
  toStep?: WorkflowStep;
  isSelected?: boolean;
  isTemporary?: boolean;
  onSelect?: () => void;
}

const CanvasConnection: React.FC<CanvasConnectionProps> = ({
  transition,
  fromStep,
  toStep,
  isSelected = false,
  isTemporary = false,
  onSelect
}) => {
  if (!fromStep) return null;

  // Calculate connection points
  const fromX = fromStep.position.x + (fromStep.type === 'decision' ? 32 : 48);
  const fromY = fromStep.position.y + (fromStep.type === 'decision' ? 32 : 64);
  
  let toX = fromX + 100;
  let toY = fromY;
  
  if (toStep) {
    toX = toStep.position.x + (toStep.type === 'decision' ? 32 : 48);
    toY = toStep.position.y + (toStep.type === 'decision' ? 32 : 0);
  }

  // Create curved path
  const dx = toX - fromX;
  const dy = toY - fromY;
  const controlX1 = fromX + dx * 0.5;
  const controlY1 = fromY;
  const controlX2 = fromX + dx * 0.5;
  const controlY2 = toY;

  const path = `M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`;

  // Calculate arrow position and angle
  const arrowX = toX;
  const arrowY = toY;
  const angle = Math.atan2(dy, dx);

  const strokeColor = isTemporary ? '#94a3b8' : isSelected ? '#3b82f6' : '#6b7280';
  const strokeWidth = isSelected ? 3 : 2;
  const strokeDasharray = isTemporary ? '5,5' : 'none';

  return (
    <g>
      {/* Connection Path */}
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        className={`transition-all duration-200 ${onSelect ? 'cursor-pointer hover:stroke-blue-500' : ''}`}
        onClick={onSelect}
      />
      
      {/* Arrow Head */}
      {!isTemporary && (
        <polygon
          points={`${arrowX},${arrowY} ${arrowX - 10 * Math.cos(angle - Math.PI/6)},${arrowY - 10 * Math.sin(angle - Math.PI/6)} ${arrowX - 10 * Math.cos(angle + Math.PI/6)},${arrowY - 10 * Math.sin(angle + Math.PI/6)}`}
          fill={strokeColor}
          className="transition-all duration-200"
        />
      )}
      
      {/* Condition Label */}
      {transition.condition && !isTemporary && (
        <g>
          <rect
            x={(fromX + toX) / 2 - 40}
            y={(fromY + toY) / 2 - 10}
            width="80"
            height="20"
            rx="10"
            fill="white"
            stroke={strokeColor}
            strokeWidth="1"
          />
          <text
            x={(fromX + toX) / 2}
            y={(fromY + toY) / 2 + 4}
            textAnchor="middle"
            fontSize="12"
            fill="#374151"
            className="pointer-events-none"
          >
            {transition.condition.length > 10 
              ? `${transition.condition.substring(0, 10)}...` 
              : transition.condition
            }
          </text>
        </g>
      )}
    </g>
  );
};

export default CanvasConnection;