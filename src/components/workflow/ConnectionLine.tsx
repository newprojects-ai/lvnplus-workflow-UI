import React from 'react';

interface ConnectionLineProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  type?: 'straight' | 'curved' | 'orthogonal';
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
  type = 'curved',
  color = '#94a3b8',
  dashed = false,
  condition,
  onClick
}) => {
  const getPath = () => {
    switch (type) {
      case 'straight':
        return `M ${fromX} ${fromY} L ${toX} ${toY}`;
      
      case 'curved':
        const dx = toX - fromX;
        const controlX1 = fromX + dx * 0.25;
        const controlY1 = fromY;
        const controlX2 = fromX + dx * 0.75;
        const controlY2 = toY;
        return `M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`;
      
      case 'orthogonal':
        const midX = (fromX + toX) / 2;
        return `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`;
      
      default:
        return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    }
  };

  // Calculate arrow points
  const getArrowPoints = () => {
    let angle;
    if (type === 'orthogonal') {
      angle = toY > fromY ? Math.PI/2 : -Math.PI/2;
    } else {
      angle = Math.atan2(toY - fromY, toX - fromX);
    }
    
    const arrowLength = 15;
    const arrowWidth = 8;
    
    return [
      [toX, toY],
      [
        toX - arrowLength * Math.cos(angle - Math.PI/6),
        toY - arrowLength * Math.sin(angle - Math.PI/6)
      ],
      [
        toX - arrowLength * Math.cos(angle + Math.PI/6),
        toY - arrowLength * Math.sin(angle + Math.PI/6)
      ]
    ];
  };
  const path = getPath();
  const arrowPoints = getArrowPoints();

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