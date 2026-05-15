import { useState } from 'react';
import { Eye, EyeOff, Lock, Unlock, Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import type { Layer } from '@shared/types';

interface LayerPanelProps {
  projectId: number;
  selectedLayerId?: number;
  onSelectLayer?: (layerId: number) => void;
}

export function LayerPanel({
  projectId,
  selectedLayerId,
  onSelectLayer,
}: LayerPanelProps) {
  const [layerName, setLayerName] = useState('');
  const [layerType, setLayerType] = useState<'notification' | 'text' | 'widget' | 'background'>('notification');

  const { data: layers = [], refetch } = trpc.layers.list.useQuery({ projectId });
  const createLayerMutation = trpc.layers.create.useMutation();
  const updateLayerMutation = trpc.layers.update.useMutation();
  const deleteLayerMutation = trpc.layers.delete.useMutation();

  const handleCreateLayer = async () => {
    if (!layerName.trim()) {
      toast.error('Layer name is required');
      return;
    }

    try {
      await createLayerMutation.mutateAsync({
        projectId,
        type: layerType,
        name: layerName,
      });
      setLayerName('');
      refetch();
      toast.success('Layer created successfully');
    } catch (error) {
      console.error('Create layer error:', error);
      toast.error('Failed to create layer');
    }
  };

  const handleToggleVisibility = async (layer: Layer) => {
    try {
      await updateLayerMutation.mutateAsync({
        layerId: layer.id,
        visible: layer.visible ? 0 : 1,
      });
      refetch();
    } catch (error) {
      console.error('Toggle visibility error:', error);
      toast.error('Failed to toggle visibility');
    }
  };

  const handleToggleLock = async (layer: Layer) => {
    try {
      await updateLayerMutation.mutateAsync({
        layerId: layer.id,
        locked: layer.locked ? 0 : 1,
      });
      refetch();
    } catch (error) {
      console.error('Toggle lock error:', error);
      toast.error('Failed to toggle lock');
    }
  };

  const handleDeleteLayer = async (layerId: number) => {
    try {
      await deleteLayerMutation.mutateAsync({ layerId });
      refetch();
      toast.success('Layer deleted successfully');
    } catch (error) {
      console.error('Delete layer error:', error);
      toast.error('Failed to delete layer');
    }
  };

  const handleReorderLayer = async (layer: Layer, direction: 'up' | 'down') => {
    const currentIndex = layers.findIndex(l => l.id === layer.id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= layers.length) return;

    const currentZIndex = layer.zIndex ?? 0;
    const newZIndex = direction === 'up' ? currentZIndex + 1 : currentZIndex - 1;

    try {
      await updateLayerMutation.mutateAsync({
        layerId: layer.id,
        zIndex: newZIndex,
      });
      refetch();
    } catch (error) {
      console.error('Reorder layer error:', error);
      toast.error('Failed to reorder layer');
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Add Layer</h3>
        <Input
          placeholder="Layer name"
          value={layerName}
          onChange={(e) => setLayerName(e.target.value)}
          className="text-sm"
        />
        <select
          value={layerType}
          onChange={(e) => setLayerType(e.target.value as any)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="notification">Notification</option>
          <option value="text">Text</option>
          <option value="widget">Widget</option>
          <option value="background">Background</option>
        </select>
        <Button
          onClick={handleCreateLayer}
          disabled={createLayerMutation.isPending}
          className="w-full"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Layer
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white sticky top-0 bg-gray-50 dark:bg-gray-900 py-2">
          Layers ({layers.length})
        </h3>
        {layers.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-8">
            No layers yet. Add one to get started.
          </p>
        ) : (
          layers.map((layer) => (
            <Card
              key={layer.id}
              className={`p-3 cursor-pointer transition-all ${
                selectedLayerId === layer.id
                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => onSelectLayer?.(layer.id)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {layer.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {layer.type}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleVisibility(layer);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    {layer.visible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLock(layer);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    {layer.locked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Unlock className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>

                  <div className="flex gap-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorderLayer(layer, 'up');
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorderLayer(layer, 'down');
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLayer(layer.id);
                    }}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
