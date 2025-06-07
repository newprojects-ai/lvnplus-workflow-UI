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
  ChevronDown,
  Grid3X3,
  Move,
  MousePointer
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
  snapToGrid?: boolean;
  onToggleSnap?: () => void;
}

const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  onAddElement,
  onZoomIn,
  onZoomOut,
  onResetView,
  onDeleteSelected,
  hasSelection,
  scale,
  isReadOnly = false,
  snapToGrid = true,
  onToggleSnap
}) => {
  const [showElementMenu, setShowElementMenu] = useState(false);
  const [selectedTool, setSelectedTool] = useState<'select' | 'pan'>('select');

  const elementTypes = [
    { type: 'start' as const, icon: PlayCircle, label: 'Start', color: 'text-green-600', description: 'Begin workflow execution' },
    { type: 'task' as const, icon: CheckSquare, label: 'Task', color: 'text-blue-600', description: 'Human task requiring input' },
    { type: 'service' as const, icon: Workflow, label: 'Service', color: 'text-purple-600', description: 'Call external API or service' },
    { type: 'script' as const, icon: Code, label: 'Script', color: 'text-gray-600', description: 'Execute custom code' },
    { type: 'decision' as const, icon: GitBranch, label: 'Decision', color: 'text-amber-600', description: 'Conditional branching logic' },
    { type: 'timer' as const, icon: Timer, label: 'Timer', color: 'text-cyan-600', description: 'Delay or schedule execution' },
    { type: 'message' as const, icon: MessageSquare, label: 'Message', color: 'text-indigo-600', description: 'Send email or SMS' },
    { type: 'notification' as const, icon: Bell, label: 'Notification', color: 'text-pink-600', description: 'System notification' },
    { type: 'error' as const, icon: AlertTriangle, label: 'Error', color: 'text-red-600', description: 'Handle errors and exceptions' },
    { type: 'end' as const, icon: Flag, label: 'End', color: 'text-red-600', description: 'Complete workflow execution' }
  ];

  const handleAddElement = (type: WorkflowStep['type']) => {
    onAddElement(type);
    setShowElementMenu(false);
  };

  if (isReadOnly) return null;

  return (
    <>
      {/* Main Toolbar */}
      <div className="absolute top-4 left-4 z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-3">
        <div className="flex items-center gap-3">
          {/* Tool Selection */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={selectedTool === 'select' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTool('select')}
              className="px-2 py-1"
              title="Select Tool (V)"
            >
              <MousePointer className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedTool === 'pan' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTool('pan')}
              className="px-2 py-1"
              title="Pan Tool (H)"
            >
              <Move className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* Add Element Dropdown */}
          <div className="relative">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowElementMenu(!showElementMenu)}
              className="flex items-center gap-2 px-3 py-2"
            >
              <Plus className="h-4 w-4" />
              Add Element
              <ChevronDown className="h-3 w-3" />
            </Button>
            
            {/* Element Menu */}
            {showElementMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 grid grid-cols-2 gap-2 min-w-[380px] z-60">
                <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 pb-2 border-b border-gray-100">
                  Workflow Elements
                </div>
                {elementTypes.map(({ type, icon: Icon, label, color, description }) => (
                  <button
                    key={type}
                    onClick={() => handleAddElement(type)}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 text-left border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group"
                  >
                    <div className={`p-1.5 rounded-md bg-gray-50 group-hover:bg-white ${color} transition-colors`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{label}</div>
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={onZoomOut} title="Zoom Out (Ctrl + -)">
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <div className="text-xs font-medium text-gray-700 min-w-[50px] text-center bg-gray-50 px-2 py-1 rounded border">
              {Math.round(scale * 100)}%
            </div>
            
            <Button variant="outline" size="sm" onClick={onZoomIn} title="Zoom In (Ctrl + +)">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* View Controls */}
          <Button variant="outline" size="sm" onClick={onResetView} title="Reset View (Ctrl + 0)">
            <RotateCcw className="h-4 w-4" />
          </Button>

          {/* Grid Toggle */}
          <Button 
            variant={snapToGrid ? "primary" : "outline"} 
            size="sm" 
            onClick={onToggleSnap} 
            title="Toggle Grid Snap (Ctrl + G)"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>

          {/* Delete Selected */}
          {hasSelection && (
            <>
              <div className="w-px h-6 bg-gray-300" />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onDeleteSelected} 
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
                title="Delete Selected (Del)"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Overlay to close menu when clicking outside */}
      {showElementMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowElementMenu(false)}
        />
      )}
    </>
  );
};

export default CanvasToolbar;