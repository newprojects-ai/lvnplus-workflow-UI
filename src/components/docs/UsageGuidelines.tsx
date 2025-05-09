import React from 'react';
import Card from '../ui/Card';

const UsageGuidelines: React.FC = () => {
  const guidelines = [
    {
      category: 'Workflow Design',
      items: [
        {
          title: 'Start with a Clear Goal',
          description: 'Define the purpose and expected outcome of your workflow before starting the design.'
        },
        {
          title: 'Keep it Simple',
          description: 'Start with the minimum necessary steps and add complexity only when needed.'
        },
        {
          title: 'Use Descriptive Names',
          description: 'Give clear, meaningful names to steps and transitions that reflect their purpose.'
        },
        {
          title: 'Document Decisions',
          description: 'Add comments and documentation to explain complex decision logic or business rules.'
        }
      ]
    },
    {
      category: 'Step Configuration',
      items: [
        {
          title: 'Validate Inputs',
          description: 'Define required fields and validation rules for task forms.'
        },
        {
          title: 'Handle Errors',
          description: 'Configure error handlers for steps that might fail, especially external services.'
        },
        {
          title: 'Set Timeouts',
          description: 'Define appropriate timeouts for service calls and long-running operations.'
        },
        {
          title: 'Use Variables',
          description: 'Leverage variable mapping to pass data between steps effectively.'
        }
      ]
    },
    {
      category: 'Testing & Deployment',
      items: [
        {
          title: 'Test Thoroughly',
          description: 'Use the simulator to test different paths and edge cases.'
        },
        {
          title: 'Version Control',
          description: 'Use semantic versioning for workflows and document changes.'
        },
        {
          title: 'Stage Changes',
          description: 'Test changes in a staging environment before publishing to production.'
        },
        {
          title: 'Monitor Performance',
          description: 'Keep track of execution times and success rates.'
        }
      ]
    },
    {
      category: 'Best Practices',
      items: [
        {
          title: 'Regular Backups',
          description: 'Export and backup workflow definitions regularly.'
        },
        {
          title: 'Review Permissions',
          description: 'Regularly audit who has access to create and modify workflows.'
        },
        {
          title: 'Clean Up',
          description: 'Archive or delete unused workflows and clean up test instances.'
        },
        {
          title: 'Stay Updated',
          description: 'Keep up with new features and improvements in the system.'
        }
      ]
    }
  ];

  return (
    <Card>
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Usage Guidelines</h2>
          <p className="mt-1 text-sm text-gray-500">
            Best practices and recommendations for working with workflows
          </p>
        </div>

        {guidelines.map((section, index) => (
          <div key={index}>
            <h3 className="text-md font-medium text-gray-900 mb-4">
              {section.category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <h4 className="text-sm font-medium text-gray-900">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Need More Help?
          </h3>
          <p className="text-sm text-blue-700">
            Check out our detailed documentation, video tutorials, and community forums
            for more information and examples.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default UsageGuidelines;