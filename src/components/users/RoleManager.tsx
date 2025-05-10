import React, { useState, useEffect } from 'react';
import { Role, roleService } from '../../services/roleService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Shield, Plus, Trash2 } from 'lucide-react';

interface RoleManagerProps {
  userId: string;
  onUpdate?: () => void;
}

const RoleManager: React.FC<RoleManagerProps> = ({ userId, onUpdate }) => {
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const [allRoles, currentRoles] = await Promise.all([
          roleService.getRoles(),
          roleService.getUserRoles(userId)
        ]);
        
        setAvailableRoles(allRoles);
        setUserRoles(currentRoles);
      } catch (error) {
        console.error('Error loading roles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoles();
  }, [userId]);

  const handleAssignRole = async (roleId: string) => {
    try {
      await roleService.assignRole(userId, roleId);
      const updatedRoles = await roleService.getUserRoles(userId);
      setUserRoles(updatedRoles);
      onUpdate?.();
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      await roleService.removeRole(userId, roleId);
      const updatedRoles = await roleService.getUserRoles(userId);
      setUserRoles(updatedRoles);
      onUpdate?.();
    } catch (error) {
      console.error('Error removing role:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">User Roles</h2>
          <Shield className="h-5 w-5 text-gray-400" />
        </div>

        <div className="space-y-4">
          {userRoles.map(role => (
            <div
              key={role.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <h3 className="font-medium text-gray-900">{role.name}</h3>
                {role.description && (
                  <p className="text-sm text-gray-500">{role.description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveRole(role.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}

          {userRoles.length === 0 && (
            <p className="text-center text-gray-500 py-4">No roles assigned</p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Available Roles
          </h3>
          <div className="space-y-2">
            {availableRoles
              .filter(role => !userRoles.some(ur => ur.id === role.id))
              .map(role => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {role.name}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAssignRole(role.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Assign
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RoleManager;