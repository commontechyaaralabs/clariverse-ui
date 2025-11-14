import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function PlayStoreEngagementColumn() {
  return (
    <Card className="bg-gray-900 border-gray-800 h-full">
      <CardHeader>
        <CardTitle className="text-white text-lg">Play Store Engagement</CardTitle>
        <CardDescription className="text-gray-400">
          Engagement widgets have been removed. Use the action column for active remediation items.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-gray-400">
        No additional engagement modules are currently configured for the Play Store dashboard.
      </CardContent>
    </Card>
  );
}

