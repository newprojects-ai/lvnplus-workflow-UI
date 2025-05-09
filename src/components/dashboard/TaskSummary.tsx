import React from 'react';
import { Task, User } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TaskSummaryProps {
  tasks: Task[];
  users: User[];
}

const TaskSummary: React.FC<TaskSummaryProps> = ({ tasks, users }) => {
  // Filter tasks to only show pending ones and sort by priority
  const pendingTasks = [...tasks]
    .filter(task => task.status === 'pending')
    .sort((a, b) => {
      const priorityRank = { high: 0, normal: 1, low: 2 };
      return priorityRank[a.priority] - priorityRank[b.priority];
    })
    .slice(0, 5);

  const getUserById = (userId: string): User | undefined => {
    return users.find(user => user.id === userId);
  };

  const formatDate = (date?: Date): string => {
    if (!date) return 'No date';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getPriorityClass = (priority: string): string => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card 
      title="Your Tasks" 
      className="h-full"
      footer={
        <div className="flex justify-end">
          <Link to="/tasks">
            <Button variant="ghost" className="text-sm">
              View all tasks <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-3">
        {pendingTasks.length === 0 ? (
          <div className="text-center text-gray-500 py-6">No pending tasks</div>
        ) : (
          pendingTasks.map(task => {
            const assignedUser = getUserById(task.assignedTo);
            
            return (
              <div key={task.id} className="p-3 bg-white border border-gray-200 rounded-md hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{task.stepName}</h4>
                    <p className="text-sm text-gray-600 mt-1">From workflow instance #{task.instanceId.split('-')[1]}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityClass(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center">
                    {assignedUser && (
                      <>
                        <img 
                          src={assignedUser.avatar}
                          alt={assignedUser.name}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span className="text-xs text-gray-600">{assignedUser.name}</span>
                      </>
                    )}
                  </div>
                  {task.dueDate && (
                    <span className="text-xs text-gray-600">Due {formatDate(task.dueDate)}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default TaskSummary;