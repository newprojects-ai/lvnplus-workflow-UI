import React from 'react';

interface ConnectionLineProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color?: string;
  dashed?: boolean;
  condition?: string;
  onClick?: () => void;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({
  fromX,
  fromY,
  toX,
  toY,
  color = '#94a3b8',
  dashed = false,
  condition,
  onClick
}) => {
  // Calculate control points for the curved line
  const dx = toX - fromX;
  const dy = toY - fromY;
  const controlX1 = fromX + dx * 0.25;
  const controlY1 = fromY;
  const controlX2 = fromX + dx * 0.75;
  const controlY2 = toY;

  // Calculate arrow points
  const angle = Math.atan2(toY - controlY2, toX - controlX2);
  const arrowLength = 15;
  const arrowWidth = 8;

  const arrowPoints = [
    [toX, toY],
    [
      toX - arrowLength * Math.cos(angle - Math.PI / 6),
      toY - arrowLength * Math.sin(angle - Math.PI / 6)
    ],
    [
      toX - arrowLength * Math.cos(angle + Math.PI / 6),
      toY - arrowLength * Math.sin(angle + Math.PI / 6)
    ]
  ];

  // Create path for curved line
  const path = `M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`;

  return (
    <g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray={dashed ? "5,5" : "none"}
        className="transition-colors duration-200"
      />
      <polygon
        points={arrowPoints.map(point => point.join(',')).join(' ')}
        fill={color}
        className="transition-colors duration-200"
      />
      {condition && (
        <text
          x={(fromX + toX) / 2}
          y={(fromY + toY) / 2 - 10}
          fill="#475569"
          fontSize="12"
          textAnchor="middle"
          dy=".3em"
          className="pointer-events-none"
        >
          {condition}
        </text>
      )}
    </g>
  );
};

export default ConnectionLine;