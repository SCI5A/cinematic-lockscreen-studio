import { useState } from 'react';
import { Download, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface ExportDialogProps {
  projectId: number;
  projectName: string;
}

export function ExportDialog({ projectId, projectName }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>();

  const exportMutation = trpc.projects.export.useMutation();

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportComplete(false);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 20;
        });
      }, 500);

      const result = await exportMutation.mutateAsync({
        projectId,
        format: 'mp4' as const,
        quality: 'high' as const,
      });

      clearInterval(progressInterval);
      setExportProgress(100);

      if (result.success && result.downloadUrl) {
        setDownloadUrl(result.downloadUrl);
        setExportComplete(true);
        toast.success('Export completed successfully!');

        // Auto-download
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = `${projectName}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error('Export failed. Please try again.');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.');
      setExportProgress(0);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      setIsOpen(false);
      setExportProgress(0);
      setExportComplete(false);
      setDownloadUrl(undefined);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Download className="w-4 h-4" />
          Export MP4
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Project to MP4</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isExporting && !exportComplete && (
            <>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Export your lockscreen video in high quality MP4 format.
                </p>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    💡 Export may take a few minutes depending on the video length and complexity.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Quality
                  </label>
                  <select className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option value="high">High (1080p)</option>
                    <option value="medium">Medium (720p)</option>
                    <option value="low">Low (480p)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Format
                  </label>
                  <select className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option value="mp4">MP4 (H.264)</option>
                    <option value="webm">WebM (VP9)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Start Export
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}

          {isExporting && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Exporting video...
                </p>
              </div>
              <div className="space-y-2">
                <Progress value={exportProgress} className="h-2" />
                <p className="text-xs text-gray-600 dark:text-gray-400 text-right">
                  {Math.round(exportProgress)}%
                </p>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Please don't close this dialog while exporting.
              </p>
            </div>
          )}

          {exportComplete && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Export completed successfully!
                </p>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Your video has been downloaded. You can now share it on social media or use it as your lockscreen.
              </p>
              <Button
                onClick={handleClose}
                className="w-full"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
