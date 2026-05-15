import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import type { WidgetLayerData } from '@shared/types';

interface WidgetEditorProps {
  layerId: number;
  onUpdate?: (data: WidgetLayerData) => void;
}

export function WidgetEditor({ layerId, onUpdate }: WidgetEditorProps) {
  const [data, setData] = useState<WidgetLayerData>({
    widgetType: 'time',
    timeFormat: '24h',
    dateFormat: 'MMM d',
    fontSize: 32,
    color: '#FFFFFF',
    x: 0,
    y: 50,
    showSeconds: false,
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
      toast.error('Failed to update widget');
    }
  };

  return (
    <div className="w-full space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Widget Settings
        </h3>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Widget Type
          </label>
          <select
            value={data.widgetType}
            onChange={(e) => handleUpdate('widgetType', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="time">Time Only</option>
            <option value="date">Date Only</option>
            <option value="datetime">Date & Time</option>
            <option value="weather">Weather (Placeholder)</option>
          </select>
        </div>

        {(data.widgetType === 'time' || data.widgetType === 'datetime') && (
          <>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Time Format
              </label>
              <select
                value={data.timeFormat}
                onChange={(e) => handleUpdate('timeFormat', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="24h">24-hour (14:30)</option>
                <option value="12h">12-hour (2:30 PM)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showSeconds"
                checked={data.showSeconds}
                onChange={(e) => handleUpdate('showSeconds', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
              />
              <label htmlFor="showSeconds" className="text-xs text-gray-700 dark:text-gray-300">
                Show Seconds
              </label>
            </div>
          </>
        )}

        {(data.widgetType === 'date' || data.widgetType === 'datetime') && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Date Format
            </label>
            <select
              value={data.dateFormat}
              onChange={(e) => handleUpdate('dateFormat', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="MMM d">Short (May 15)</option>
              <option value="MMMM d">Long (May 15)</option>
              <option value="EEE, MMM d">With Day (Wed, May 15)</option>
              <option value="MM/dd/yyyy">Numeric (05/15/2026)</option>
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Font Size
            </label>
            <Input
              type="number"
              value={data.fontSize}
              onChange={(e) => handleUpdate('fontSize', parseInt(e.target.value))}
              min={12}
              max={64}
              step={2}
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
                className="w-10 h-10 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
        </div>
      </div>

      <Card className="p-3 bg-white dark:bg-gray-800 space-y-3">
        <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
          Position
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-gray-600 dark:text-gray-400">X Position</label>
            <Input
              type="number"
              value={data.x}
              onChange={(e) => handleUpdate('x', parseInt(e.target.value))}
              step={10}
              className="text-xs h-8"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-600 dark:text-gray-400">Y Position</label>
            <Input
              type="number"
              value={data.y}
              onChange={(e) => handleUpdate('y', parseInt(e.target.value))}
              step={10}
              className="text-xs h-8"
            />
          </div>
        </div>
      </Card>

      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          💡 Widgets update in real-time in the preview. Position them where you want them to appear on the lockscreen.
        </p>
      </div>
    </div>
  );
}
