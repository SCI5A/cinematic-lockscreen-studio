import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { FileUpload } from '@/components/FileUpload';
import { LayerPanel } from '@/components/LayerPanel';
import { NotificationEditor } from '@/components/NotificationEditor';
import { TextLayerEditor } from '@/components/TextLayerEditor';
import { WidgetEditor } from '@/components/WidgetEditor';
import { TimelineEditor } from '@/components/TimelineEditor';
import { iOSPreview as IOSPreview } from '@/components/iOSPreview';
import { ExportDialog } from '@/components/ExportDialog';
import type { NotificationLayerData } from '@shared/types';

export default function Editor() {
  const { projectId } = useParams<{ projectId: string }>();
  const numProjectId = parseInt(projectId || '0');

  const [selectedLayerId, setSelectedLayerId] = useState<number>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [notifications, setNotifications] = useState<NotificationLayerData[]>([]);

  const { data: project, isLoading: projectLoading } = trpc.projects.get.useQuery({
    projectId: numProjectId,
  });

  const { data: layers = [] } = trpc.layers.list.useQuery({
    projectId: numProjectId,
  });

  const updateProjectMutation = trpc.projects.update.useMutation();

  useEffect(() => {
    // Load notification data from layers
    const notificationLayers = layers.filter(l => l.type === 'notification');
    const notifs = notificationLayers.map(layer => {
      try {
        return layer.data ? JSON.parse(layer.data) : {};
      } catch {
        return {};
      }
    });
    setNotifications(notifs);
  }, [layers]);

  const handleBackgroundUpload = async (url: string, key: string) => {
    try {
      await updateProjectMutation.mutateAsync({
        projectId: numProjectId,
        backgroundUrl: url,
        backgroundKey: key,
        backgroundType: 'image',
      });
      toast.success('Background updated');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update background');
    }
  };

  const handleMusicUpload = async (url: string, key: string) => {
    try {
      await updateProjectMutation.mutateAsync({
        projectId: numProjectId,
        musicUrl: url,
        musicKey: key,
      });
      toast.success('Music updated');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update music');
    }
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {project.name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {project.description}
            </p>
          </div>
          <ExportDialog projectId={numProjectId} projectName={project.name} />
        </div>

        {/* Main editor grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left panel - Layers & Properties */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Background
              </h2>
              <FileUpload
                fileType="background"
                accept="image/*,video/*"
                label="Upload Background"
                onUploadSuccess={handleBackgroundUpload}
              />
            </Card>

            <Card className="p-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Music
              </h2>
              <FileUpload
                fileType="music"
                accept="audio/*"
                label="Upload Music"
                onUploadSuccess={handleMusicUpload}
              />
            </Card>

            <LayerPanel
              projectId={numProjectId}
              selectedLayerId={selectedLayerId}
              onSelectLayer={(id) => {
                setSelectedLayerId(id);
              }}
            />
          </div>

          {/* Center - Preview */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center">
            <Card className="w-full p-4 bg-gray-900">
              <div className="flex justify-center">
                <IOSPreview
                  backgroundUrl={project.backgroundUrl || undefined}
                  notifications={notifications}
                  isPlaying={isPlaying}
                />
              </div>
            </Card>
          </div>

          {/* Right panel - Timeline & Properties */}
          <div className="lg:col-span-1 space-y-4">
            {selectedLayerId && (
              <Card className="p-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Layer Properties
                </h2>
                {layers.find(l => l.id === selectedLayerId)?.type === 'notification' && (
                  <NotificationEditor
                    layerId={selectedLayerId}
                    totalFrames={project?.duration || 150}
                  />
                )}
                {layers.find(l => l.id === selectedLayerId)?.type === 'text' && (
                  <TextLayerEditor layerId={selectedLayerId} />
                )}
                {layers.find(l => l.id === selectedLayerId)?.type === 'widget' && (
                  <WidgetEditor layerId={selectedLayerId} />
                )}
              </Card>
            )}
          </div>
        </div>

        {/* Timeline */}
        <Card className="p-4">
          <TimelineEditor
            duration={project.duration || 5000}
            fps={project.fps || 30}
            currentFrame={currentFrame}
            onFrameChange={setCurrentFrame}
            isPlaying={isPlaying}
            onPlayToggle={setIsPlaying}
          />
        </Card>
      </div>
    </div>
  );
}
