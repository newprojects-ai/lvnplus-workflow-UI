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
    onAddElement(type);
    setShowElementMenu(false);
  };

  return (
    <div className="absolute top-4 left-4 z-40 flex flex-col gap-2">
      {/* Main Toolbar */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 flex items-center gap-3">
        {/* Add Element */}
        <div className="relative">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowElementMenu(!showElementMenu)}
            className="flex items-center gap-2 font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Element
          </Button>
          
          {/* Element Menu */}
          {showElementMenu && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 grid grid-cols-2 gap-2 min-w-[280px] z-50">
              <div className="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Workflow Elements
              </div>
              {elementTypes.map(({ type, icon: Icon, label, color }) => (
                <button
                  key={type}
                  onClick={() => handleAddElement(type)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left border border-gray-100 hover:border-gray-200 transition-all"
                >
                  <div className={`p-2 rounded-lg bg-gray-50 ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-8 bg-gray-300" />

        {/* Zoom Controls */}
        <Button variant="outline" size="sm" onClick={onZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center bg-gray-50 px-2 py-1 rounded">
          {Math.round(scale * 100)}%
        </span>
        
        <Button variant="outline" size="sm" onClick={onZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-gray-300" />

        {/* View Controls */}
        <Button variant="outline" size="sm" onClick={onResetView}>
          <RotateCcw className="h-4 w-4" />
        </Button>

        {/* Delete Selected */}
        {hasSelection && (
          <>
            <div className="w-px h-8 bg-gray-300" />
            <Button variant="outline" size="sm" onClick={onDeleteSelected} className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300">
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-2 flex items-center gap-2">
        <div className="text-xs text-gray-500 px-2">Quick Add:</div>
        <Button variant="ghost" size="sm" onClick={() => handleAddElement('start')} title="Add Start">
          <PlayCircle className="h-4 w-4 text-green-600" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleAddElement('task')} title="Add Task">
          <CheckSquare className="h-4 w-4 text-blue-600" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleAddElement('decision')} title="Add Decision">
          <GitBranch className="h-4 w-4 text-amber-600" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleAddElement('end')} title="Add End">
          <Flag className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    </div>
  );
};

export default CanvasToolbar;