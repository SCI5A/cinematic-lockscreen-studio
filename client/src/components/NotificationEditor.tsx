import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { IOS_NOTIFICATION_PHYSICS } from '@shared/types';
import { KeyframeEditor } from './KeyframeEditor';
import type { NotificationLayerData } from '@shared/types';

interface NotificationEditorProps {
  layerId: number;
  totalFrames?: number;
  onUpdate?: (data: NotificationLayerData) => void;
}

export function NotificationEditor({ layerId, totalFrames = 150, onUpdate }: NotificationEditorProps) {
  const [data, setData] = useState<NotificationLayerData>({
    title: 'New Notification',
    subtitle: 'Tap to open',
    color: '#FF3B30',
    duration: 1000,
    startScale: IOS_NOTIFICATION_PHYSICS.START.scale,
    startBlur: IOS_NOTIFICATION_PHYSICS.START.blur,
    startOpacity: IOS_NOTIFICATION_PHYSICS.START.opacity,
    startTranslateY: IOS_NOTIFICATION_PHYSICS.START.translateY,
    peakScale: IOS_NOTIFICATION_PHYSICS.PEAK.scale,
    peakBlur: IOS_NOTIFICATION_PHYSICS.PEAK.blur,
    peakOpacity: IOS_NOTIFICATION_PHYSICS.PEAK.opacity,
    peakTranslateY: IOS_NOTIFICATION_PHYSICS.PEAK.translateY,
  });

  const updateLayerMutation = trpc.layers.update.useMutation();

  const handleUpdate = async (field: string, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData);

    try {
      await updateLayerMutation.mutateAsync({
        layerId,
        data: JSON.stringify(newData),
      });
      onUpdate?.(newData);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update notification');
    }
  };

  const handleResetPhysics = () => {
    const resetData: NotificationLayerData = {
      ...data,
      startScale: IOS_NOTIFICATION_PHYSICS.START.scale,
      startBlur: IOS_NOTIFICATION_PHYSICS.START.blur,
      startOpacity: IOS_NOTIFICATION_PHYSICS.START.opacity,
      startTranslateY: IOS_NOTIFICATION_PHYSICS.START.translateY,
      peakScale: IOS_NOTIFICATION_PHYSICS.PEAK.scale,
      peakBlur: IOS_NOTIFICATION_PHYSICS.PEAK.blur,
      peakOpacity: IOS_NOTIFICATION_PHYSICS.PEAK.opacity,
      peakTranslateY: IOS_NOTIFICATION_PHYSICS.PEAK.translateY,
    };
    setData(resetData);
    handleUpdate('physics', resetData);
    toast.success('Physics reset to iOS defaults');
  };

  return (
    <div className="w-full space-y-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Notification Content
        </h3>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <Input
            value={data.title}
            onChange={(e) => handleUpdate('title', e.target.value)}
            placeholder="Notification title"
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Subtitle
          </label>
          <Input
            value={data.subtitle || ''}
            onChange={(e) => handleUpdate('subtitle', e.target.value)}
            placeholder="Notification subtitle"
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={data.color}
              onChange={(e) => handleUpdate('color', e.target.value)}
              className="w-12 h-10 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
            />
            <Input
              value={data.color}
              onChange={(e) => handleUpdate('color', e.target.value)}
              placeholder="#FF3B30"
              className="text-sm flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Duration (ms)
          </label>
          <Input
            type="number"
            value={data.duration}
            onChange={(e) => handleUpdate('duration', parseInt(e.target.value))}
            min={500}
            max={5000}
            step={100}
            className="text-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            iOS Physics
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetPhysics}
            className="text-xs"
          >
            Reset to Defaults
          </Button>
        </div>

        <Card className="p-3 bg-white dark:bg-gray-800 space-y-3">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Start State
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">Scale</label>
              <Input
                type="number"
                value={data.startScale}
                onChange={(e) => handleUpdate('startScale', parseFloat(e.target.value))}
                step={0.01}
                className="text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">Blur (px)</label>
              <Input
                type="number"
                value={data.startBlur}
                onChange={(e) => handleUpdate('startBlur', parseInt(e.target.value))}
                step={1}
                className="text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">Opacity</label>
              <Input
                type="number"
                value={data.startOpacity}
                onChange={(e) => handleUpdate('startOpacity', parseFloat(e.target.value))}
                step={0.1}
                min={0}
                max={1}
                className="text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">TranslateY</label>
              <Input
                type="number"
                value={data.startTranslateY}
                onChange={(e) => handleUpdate('startTranslateY', parseInt(e.target.value))}
                step={10}
                className="text-xs h-8"
              />
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-white dark:bg-gray-800 space-y-3">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Peak State
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">Scale</label>
              <Input
                type="number"
                value={data.peakScale}
                onChange={(e) => handleUpdate('peakScale', parseFloat(e.target.value))}
                step={0.01}
                className="text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">Blur (px)</label>
              <Input
                type="number"
                value={data.peakBlur}
                onChange={(e) => handleUpdate('peakBlur', parseInt(e.target.value))}
                step={1}
                className="text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">Opacity</label>
              <Input
                type="number"
                value={data.peakOpacity}
                onChange={(e) => handleUpdate('peakOpacity', parseFloat(e.target.value))}
                step={0.1}
                min={0}
                max={1}
                className="text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">TranslateY</label>
              <Input
                type="number"
                value={data.peakTranslateY}
                onChange={(e) => handleUpdate('peakTranslateY', parseInt(e.target.value))}
                step={10}
                className="text-xs h-8"
              />
            </div>
          </div>
        </Card>
      </div>

      <KeyframeEditor layerId={layerId} totalFrames={totalFrames} />
    </div>
  );
}
