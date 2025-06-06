import React, { useState } from 'react';
import { WorkflowStep } from '../../types';
import Button from '../ui/Button';
import { 
  Plus, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Trash2,
  PlayCircle,
  Flag,
  CheckSquare,
  Code,
  GitBranch,
  Timer,
  MessageSquare,
  Bell,
  AlertTriangle,
  Workflow,
  Grid,
  Move
} from 'lucide-react';

interface CanvasToolbarProps {
  onAddElement: (type: WorkflowStep['type'], position?: { x: number; y: number }) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onDeleteSelected: () => void;
  hasSelection: boolean;
  scale: number;
  isReadOnly?: boolean;
}

const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  onAddElement,
  onZoomIn,
  onZoomOut,
  onResetView,
  onDeleteSelected,
  hasSelection,
  scale,
  isReadOnly = false
}) => {
  const [showElementMenu, setShowElementMenu] = useState(false);

  const elementTypes = [
    { type: 'start' as const, icon: PlayCircle, label: 'Start', color: 'text-green-600' },
    { type: 'task' as const, icon: CheckSquare, label: 'Task', color: 'text-blue-600' },
    { type: 'service' as const, icon: Workflow, label: 'Service', color: 'text-purple-600' },
    { type: 'script' as const, icon: Code, label: 'Script', color: 'text-gray-600' },
    { type: 'decision' as const, icon: GitBranch, label: 'Decision', color: 'text-amber-600' },
    { type: 'timer' as const, icon: Timer, label: 'Timer', color: 'text-cyan-600' },
    { type: 'message' as const, icon: MessageSquare, label: 'Message', color: 'text-indigo-600' },
    { type: 'notification' as const, icon: Bell, label: 'Notification', color: 'text-pink-600' },
    { type: 'error' as const, icon: AlertTriangle, label: 'Error', color: 'text-red-600' },
    { type: 'end' as const, icon: Flag, label: 'End', color: 'text-red-600' }
  ];

  const handleAddElement = (type: WorkflowStep['type']) => {
    onAddElement(type, { x: 200, y: 200 });
    setShowElementMenu(false);
  };

  return (
    <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
      {/* Main Toolbar */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-2">
        {/* Add Element */}
        {!isReadOnly && (
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowElementMenu(!showElementMenu)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Element
            </Button>
            
            {/* Element Menu */}
            {showElementMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 grid grid-cols-2 gap-1 min-w-[200px]">
                {elementTypes.map(({ type, icon: Icon, label, color }) => (
                  <button
                    key={type}
                    onClick={() => handleAddElement(type)}
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 text-left"
                  >
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="w-px h-6 bg-gray-300" />

        {/* Zoom Controls */}
        <Button variant="ghost" size="sm" onClick={onZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <span className="text-sm font-medium text-gray-600 min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        
        <Button variant="ghost" size="sm" onClick={onZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300" />

        {/* View Controls */}
        <Button variant="ghost" size="sm" onClick={onResetView}>
          <RotateCcw className="h-4 w-4" />
        </Button>

        {/* Delete Selected */}
        {!isReadOnly && hasSelection && (
          <>
            <div className="w-px h-6 bg-gray-300" />
            <Button variant="ghost" size="sm" onClick={onDeleteSelected} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Secondary Toolbar */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Grid className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Move className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CanvasToolbar;