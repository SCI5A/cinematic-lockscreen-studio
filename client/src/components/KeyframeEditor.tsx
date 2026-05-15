import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import type { AnimationProperty, EasingType } from '@shared/types';

interface KeyframeEditorProps {
  layerId: number;
  totalFrames: number;
}

export function KeyframeEditor({ layerId, totalFrames }: KeyframeEditorProps) {
  const [selectedProperty, setSelectedProperty] = useState<AnimationProperty>('scale');
  const [newFrame, setNewFrame] = useState(0);
  const [newValue, setNewValue] = useState(1);
  const [newEasing, setNewEasing] = useState<EasingType>('easeOut');

  const { data: keyframes = [], refetch } = trpc.keyframes.list.useQuery({
    layerId,
  });

  const createKeyframeMutation = trpc.keyframes.create.useMutation();
  const deleteKeyframeMutation = trpc.keyframes.delete.useMutation();

  const handleCreateKeyframe = async () => {
    if (newFrame < 0 || newFrame > totalFrames) {
      toast.error('Frame must be between 0 and ' + totalFrames);
      return;
    }

    try {
      await createKeyframeMutation.mutateAsync({
        layerId,
        frame: newFrame,
        property: selectedProperty,
        value: String(newValue),
        easing: newEasing,
      });
      setNewFrame(0);
      setNewValue(1);
      refetch();
      toast.success('Keyframe created');
    } catch (error) {
      console.error('Create keyframe error:', error);
      toast.error('Failed to create keyframe');
    }
  };

  const handleDeleteKeyframe = async (keyframeId: number) => {
    try {
      await deleteKeyframeMutation.mutateAsync({ keyframeId });
      refetch();
      toast.success('Keyframe deleted');
    } catch (error) {
      console.error('Delete keyframe error:', error);
      toast.error('Failed to delete keyframe');
    }
  };

  const properties: AnimationProperty[] = ['scale', 'opacity', 'translateY', 'blur', 'rotateZ', 'skewX'];
  const easings: EasingType[] = ['linear', 'easeIn', 'easeOut', 'easeInOut', 'easeOutBack', 'spring'];

  return (
    <Card className="w-full p-4 bg-gray-50 dark:bg-gray-900 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
        Keyframe Animation
      </h3>

      {/* Create new keyframe */}
      <div className="space-y-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
          Add New Keyframe
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs text-gray-600 dark:text-gray-400">Property</label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value as AnimationProperty)}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {properties.map((prop) => (
                <option key={prop} value={prop}>
                  {prop}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-600 dark:text-gray-400">Frame</label>
            <Input
              type="number"
              value={newFrame}
              onChange={(e) => setNewFrame(parseInt(e.target.value))}
              min={0}
              max={totalFrames}
              className="text-xs h-8"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-600 dark:text-gray-400">Value</label>
            <Input
              type="number"
              value={newValue}
              onChange={(e) => setNewValue(parseFloat(e.target.value))}
              step={0.1}
              className="text-xs h-8"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-600 dark:text-gray-400">Easing</label>
            <select
              value={newEasing}
              onChange={(e) => setNewEasing(e.target.value as EasingType)}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {easings.map((easing) => (
                <option key={easing} value={easing}>
                  {easing}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          onClick={handleCreateKeyframe}
          disabled={createKeyframeMutation.isPending}
          size="sm"
          className="w-full gap-2"
        >
          <Plus className="w-3 h-3" />
          Add Keyframe
        </Button>
      </div>

      {/* Keyframes list */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
          Keyframes ({keyframes.length})
        </p>

        {keyframes.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">
            No keyframes yet. Add one to start animating.
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {keyframes.map((kf) => (
              <div
                key={kf.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    {kf.property}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Frame {kf.frame} • Value: {kf.value} • {kf.easing}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteKeyframe(kf.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          💡 Create keyframes to animate layer properties over time. The animation will interpolate between keyframes.
        </p>
      </div>
    </Card>
  );
}
