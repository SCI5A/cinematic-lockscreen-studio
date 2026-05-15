import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import type { TextLayerData } from '@shared/types';

interface TextLayerEditorProps {
  layerId: number;
  onUpdate?: (data: TextLayerData) => void;
}

export function TextLayerEditor({ layerId, onUpdate }: TextLayerEditorProps) {
  const [data, setData] = useState<TextLayerData>({
    content: 'Sample Text',
    fontSize: 24,
    fontWeight: 'normal',
    color: '#FFFFFF',
    x: 0,
    y: 100,
    maxWidth: 300,
    textAlign: 'center',
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
      toast.error('Failed to update text layer');
    }
  };

  return (
    <div className="w-full space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Text Content
        </h3>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Text
          </label>
          <textarea
            value={data.content}
            onChange={(e) => handleUpdate('content', e.target.value)}
            placeholder="Enter text content"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Font Size
            </label>
            <Input
              type="number"
              value={data.fontSize}
              onChange={(e) => handleUpdate('fontSize', parseInt(e.target.value))}
              min={8}
              max={72}
              step={2}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Font Weight
            </label>
            <select
              value={data.fontWeight}
              onChange={(e) => handleUpdate('fontWeight', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="light">Light</option>
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Text Align
          </label>
          <div className="flex gap-2">
            {(['left', 'center', 'right'] as const).map((align) => (
              <Button
                key={align}
                variant={data.textAlign === align ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleUpdate('textAlign', align)}
                className="flex-1 text-xs capitalize"
              >
                {align}
              </Button>
            ))}
          </div>
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
              placeholder="#FFFFFF"
              className="text-sm flex-1"
            />
          </div>
        </div>
      </div>

      <Card className="p-3 bg-white dark:bg-gray-800 space-y-3">
        <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
          Position & Size
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
          <div className="space-y-1 col-span-2">
            <label className="text-xs text-gray-600 dark:text-gray-400">Max Width</label>
            <Input
              type="number"
              value={data.maxWidth}
              onChange={(e) => handleUpdate('maxWidth', parseInt(e.target.value))}
              min={100}
              max={500}
              step={10}
              className="text-xs h-8"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
