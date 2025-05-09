import React, { useState } from 'react';
import { Task, User } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Search, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TaskListProps {
  tasks: Task[];
  users: User[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks, users }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const getUserById = (userId: string): User | undefined => {
    return users.find(user => user.id === userId);
  };

  const filteredTasks = tasks.filter(task => {
    const assignedUser = getUserById(task.assignedTo);
    const userName = assignedUser ? assignedUser.name.toLowerCase() : '';
    
    const matchesSearch = 
      task.stepName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      userName.includes(searchTerm.toLowerCase()) ||
      task.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const formatDate = (date?: Date): string => {
    if (!date) return 'No date';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getStatusBadgeVariant = (status: string): "default" | "success" | "warning" | "danger" | "info" | "outline" => {
    switch (status) {
      case 'pending': return 'warning';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getPriorityBadgeVariant = (priority: string): "default" | "success" | "warning" | "danger" | "info" | "outline" => {
    switch (priority) {
      case 'high': return 'danger';
      case 'normal': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority: string): JSX.Element => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'normal': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'low': return <Clock className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const isDueSoon = (dueDate?: Date): boolean => {
    if (!dueDate) return false;
    const today = new Date();
    const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining <= 2 && daysRemaining >= 0;
  };

  const isOverdue = (dueDate?: Date): boolean => {
    if (!dueDate) return false;
    const today = new Date();
    return dueDate < today;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center mb-6">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No tasks found matching your criteria</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const assignedUser = getUserById(task.assignedTo);
            const dueSoonClass = isDueSoon(task.dueDate) ? 'text-amber-600 font-medium' : '';
            const overdueClass = isOverdue(task.dueDate) ? 'text-red-600 font-medium' : '';
            
            return (
              <Card key={task.id} className="flex flex-col">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    {getPriorityIcon(task.priority)}
                    <h3 className="font-medium text-gray-900 ml-2">{task.stepName}</h3>
                  </div>
                  <Badge 
                    label={task.status} 
                    variant={getStatusBadgeVariant(task.status)}
                  />
                </div>
                
                <p className="text-sm text-gray-600 mt-2">Instance: {task.instanceId}</p>
                
                <div className="flex justify-between items-center mt-4">
                  {assignedUser && (
                    <div className="flex items-center">
                      <img 
                        src={assignedUser.avatar}
                        alt={assignedUser.name}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <span className="text-sm text-gray-600">{assignedUser.name}</span>
                    </div>
                  )}
                  
                  <Badge 
                    label={task.priority} 
                    variant={getPriorityBadgeVariant(task.priority)}
                    size="sm"
                  />
                </div>
                
                {task.dueDate && (
                  <p className={`text-sm mt-2 ${dueSoonClass} ${overdueClass}`}>
                    Due: {formatDate(task.dueDate)}
                    {isDueSoon(task.dueDate) && !isOverdue(task.dueDate) && ' (Soon)'}
                    {isOverdue(task.dueDate) && ' (Overdue)'}
                  </p>
                )}
                
                <div className="flex justify-end mt-auto pt-4 border-t border-gray-100">
                  <Link to={`/tasks/${task.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                  
                  {task.status === 'pending' && (
                    <Link to={`/tasks/${task.id}/complete`}>
                      <Button variant="primary" size="sm" className="ml-2">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Complete
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TaskList;