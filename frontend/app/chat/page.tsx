"use client";

import Link from "next/link";
import { MessageCircle, Clock, CheckCircle, AlertTriangle, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChatDashboard() {
  const stats = [
    { label: "Total Chats", value: "1,847", icon: MessageCircle, color: "text-accent" },
    { label: "Pending Actions", value: "134", icon: AlertTriangle, color: "text-red-400" },
    { label: "Response Rate", value: "96.2%", icon: CheckCircle, color: "text-green-400" },
    { label: "Avg Response Time", value: "1.2m", icon: Clock, color: "text-primary" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="space-y-4 animate-slide-down">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Chat Analytics</h1>
            <p className="text-muted-foreground text-lg">Real-time chat conversation analysis and insights</p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card-gradient-subtle p-6 animate-fade-in hover:border-primary transition-all" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card-gradient-primary p-6 animate-slide-up">
          <h3 className="text-foreground text-lg font-semibold mb-4">Chat Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Messages</span>
              <span className="font-semibold text-foreground">1,847</span>
            </div>
            <div className="flex justify-between">
                  <span className="text-muted-foreground">Urgent Messages</span>
              <span className="font-semibold text-red-400">134</span>
            </div>
            <div className="flex justify-between">
                  <span className="text-muted-foreground">Response Rate</span>
              <span className="font-semibold text-green-400">96.2%</span>
            </div>
            <div className="flex justify-between">
                  <span className="text-muted-foreground">Sub Categories</span>
              <span className="font-semibold text-foreground">8</span>
            </div>
          </div>
        </div>

        <div className="card-gradient-accent p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-foreground text-lg font-semibold mb-4">Chat Analytics</h3>
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">Chat charts and graphs</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Link href="/chat/topic-analysis">
          <Button className="px-8 btn-gradient-primary">
            View Chats
          </Button>
        </Link>
      </div>
    </div>
  );
}
