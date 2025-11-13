"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ConversationViewerModalProps {
  open: boolean;
  onClose: () => void;
  record?: {
    id: string;
    participant: string;
    channel: string;
    summary: string;
    transcript?: string[];
  } | null;
}

export function ConversationViewerModal({ open, onClose, record }: ConversationViewerModalProps) {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-2xl bg-gray-900 border border-gray-700 text-gray-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Conversation Viewer</span>
            {record && (
              <Badge variant="outline" className="border-gray-600 text-gray-300 capitalize">
                {record.channel}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {record ? (
            <div className="space-y-4 text-sm text-gray-300">
              <div>
                <h4 className="text-xs uppercase tracking-wide text-gray-500">Participant</h4>
                <p className="text-gray-200">{record.participant}</p>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wide text-gray-500">AI Summary</h4>
                <p className="text-gray-300">{record.summary}</p>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wide text-gray-500 mb-2">Transcript</h4>
                <div className="space-y-2">
                  {record.transcript?.length ? (
                    record.transcript.map((line, idx) => (
                      <p key={idx} className="text-gray-400 text-xs leading-relaxed">
                        {line}
                      </p>
                    ))
                  ) : (
                    <p className="text-gray-500 text-xs">No transcript available.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Select a conversation to preview details.</p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
