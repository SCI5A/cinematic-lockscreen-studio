import { useState } from 'react';
import { useLocation } from 'wouter';
import { Plus, Film, Trash2, Edit } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

export default function Home() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data: projects = [], refetch } = trpc.projects.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createProjectMutation = trpc.projects.create.useMutation();
  const deleteProjectMutation = trpc.projects.delete.useMutation();

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast.error('Project name is required');
      return;
    }

    try {
      await createProjectMutation.mutateAsync({
        name: projectName,
        description: projectDescription,
      });
      setProjectName('');
      setProjectDescription('');
      setIsOpen(false);
      refetch();
      toast.success('Project created successfully');
    } catch (error) {
      console.error('Create project error:', error);
      toast.error('Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await deleteProjectMutation.mutateAsync({ projectId });
      refetch();
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Delete project error:', error);
      toast.error('Failed to delete project');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Film className="w-16 h-16 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold text-white">
            Cinematic Lockscreen Studio
          </h1>
          <p className="text-gray-400 text-lg max-w-md">
            Create stunning iOS-style lockscreen videos with cinematic animations
          </p>
          <Button size="lg" onClick={() => navigate('/login')}>
            Sign In to Get Started
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome, {user?.name || 'Creator'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage your cinematic lockscreen videos
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Project Name
                  </label>
                  <Input
                    placeholder="My Awesome Lockscreen"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description (Optional)
                  </label>
                  <Input
                    placeholder="Add a description..."
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleCreateProject}
                  disabled={createProjectMutation.isPending}
                  className="w-full"
                >
                  {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card className="p-12 text-center">
            <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No projects yet. Create your first cinematic lockscreen video!
            </p>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Project
                </Button>
              </DialogTrigger>
            </Dialog>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/editor/${project.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <Film className="w-8 h-8 text-blue-500" />
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/editor/${project.id}`);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {project.name}
                </h3>

                {project.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{project.fps || 30} FPS</span>
                  <span>{((project.duration || 5000) / 1000).toFixed(1)}s</span>
                </div>

                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  Updated {new Date(project.updatedAt).toLocaleDateString()}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
