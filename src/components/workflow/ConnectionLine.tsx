import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ConnectionLineProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  type?: 'straight' | 'curved' | 'orthogonal';
  color?: string;
  dashed?: boolean;
  condition?: string;
  isHighlighted?: boolean;
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
  isHighlighted = false,
  onClick
}) => {
  const getPath = () => {
    switch (type) {
      case 'straight':
        return `M ${fromX} ${fromY} L ${toX} ${toY}`;
      
      case 'curved':
        const dx = toX - fromX;
        const dy = toY - fromY;
        const controlX1 = fromX + dx * 0.4;
        const controlY1 = fromY + dy * 0.1;
        const controlX2 = fromX + dx * 0.6;
        const controlY2 = fromY + dy * 0.9;
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

  // Calculate midpoint for flow indicator
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;

  return (
    <g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* Highlight/Glow effect for hover */}
      {isHighlighted && (
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeOpacity="0.2"
          className="transition-all duration-300"
        />
      )}
      
      {/* Main connection line */}
      <path
        className="transition-all duration-300 hover:opacity-75"
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={isHighlighted ? "4" : "3"}
        strokeDasharray={dashed ? "5,5" : "none"}
        filter="url(#glow)"
      />
      
      {/* Flow direction indicator */}
      <circle
        cx={midX}
        cy={midY}
        r="12"
        fill="white"
        stroke={color}
        strokeWidth="2"
        className="transition-all duration-300"
      />
      <ArrowRight
        x={midX - 6}
        y={midY - 6}
        className="w-3 h-3"
        style={{ color }}
      />
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <polygon
        points={arrowPoints.map(point => point.join(',')).join(' ')}
        fill={color}
        className="transition-all duration-300"
        filter="url(#glow)"
      />
      {condition && (
        <g transform={`translate(${(fromX + toX) / 2}, ${(fromY + toY) / 2 - 15})`}>
          <rect
            x="-60"
            y="-12"
            width="120"
            height="24"
            rx="4"
            fill="white"
            stroke={color}
            strokeWidth="1"
            className="opacity-95"
          />
          <text
            x="0"
            y="0"
            fill="#475569"
            fontSize="12"
            fontWeight="500"
            textAnchor="middle" 
            dy=".3em"
            className="pointer-events-none font-medium"
          >
            {condition}
          </text>
        </g>
      )}
    </g>
  );
};

export default ConnectionLine;