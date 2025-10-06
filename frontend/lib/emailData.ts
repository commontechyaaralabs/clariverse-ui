// Email data service for loading JSON data
import emailDataJson from '../public/data/email-data.json';

// Type definitions for email data
export interface EmailData {
  _id: { $oid: string };
  provider: string;
  thread: {
    thread_id: string;
    thread_key: {
      m365_conversation_id: string;
    };
    subject_norm: string;
    participants: Array<{
      type: string;
      name: string;
      email: string;
    }>;
    first_message_at: string;
    last_message_at: string;
    message_count: number;
  };
  messages: Array<{
    provider_ids: {
      m365: {
        id: string;
        conversationId: string;
        internetMessageId: string;
      };
    };
    headers: {
      date: string;
      subject: string;
      from: Array<{ name: string; email: string }>;
      to: Array<{ name: string; email: string }>;
    };
    body: {
      mime_type: string;
      text: {
        plain: string;
      };
    };
  }>;
  dominant_topic: string;
  subtopics: string;
  kmeans_cluster_id: number;
  subcluster_id: string;
  subcluster_label: string;
  dominant_cluster_label: string;
  kmeans_cluster_keyphrase: string;
  domain: string;
  action_pending_from: string | null;
  action_pending_status: string;
  email_summary: string;
  follow_up_date: string | null;
  follow_up_reason: string | null;
  follow_up_required: string;
  next_action_suggestion: string;
  overall_sentiment: number;
  resolution_status: string;
  sentiment: Record<string, number>;
  stages: string;
  urgency: boolean;
}

// Export the email data with proper typing
export const emailData: EmailData[] = emailDataJson as EmailData[];
