"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface IntentDeepDiveModalProps {
  open: boolean;
  onClose: () => void;
  intent?: {
    id: string;
    name: string;
    severity: string;
    sentiment: number;
    urgency: number;
  } | null;
}

export function IntentDeepDiveModal({ open, onClose, intent }: IntentDeepDiveModalProps) {
  if (!intent) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-3xl bg-gray-900 border border-gray-700 text-gray-100">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{intent.name} • Deep Dive</span>
            <Badge variant="outline" className="border-purple-400/40 text-purple-200 capitalize">
              Severity: {intent.severity}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            <section>
              <h4 className="text-sm font-semibold text-gray-200 mb-2">LLM Summary</h4>
              <p className="text-sm text-gray-400">
                Placeholder for AI-generated executive summary. Integrate with your LLM endpoint to pull recent
                conversation summaries, explainers, and recommended mitigations.
              </p>
            </section>

            <section>
              <h4 className="text-sm font-semibold text-gray-200 mb-2">Metadata Snapshot</h4>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
                <div className="rounded border border-gray-700 bg-gray-800/60 p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Sentiment</p>
                  <p className="text-lg font-semibold text-white">{intent.sentiment}</p>
                </div>
                <div className="rounded border border-gray-700 bg-gray-800/60 p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Urgency</p>
                  <p className="text-lg font-semibold text-white">{Math.round(intent.urgency * 100)}%</p>
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-sm font-semibold text-gray-200 mb-2">Recommended Actions</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>• Placeholder for next-best-actions returned from action engine.</p>
                <p>• Placeholder for knowledge-base updates suggested by AI.</p>
                <p>• Placeholder for escalation recommendations.</p>
              </div>
            </section>
          </div>
        </ScrollArea>
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" className="text-gray-300" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-gradient-to-r from-[#b90abd] to-[#5332ff] text-white">
            Export Summary
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
