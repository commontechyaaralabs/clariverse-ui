import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SOCIAL_CARD_BASE } from './theme';

export function PlayStoreEngagementColumn() {
  return (
    <Card className={`${SOCIAL_CARD_BASE} h-full`}>
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

