"use client";

import Link from "next/link";
import { Ticket, Clock, CheckCircle, AlertTriangle, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TicketDashboard() {
  const stats = [
    { label: "Total Tickets", value: "3,247", icon: Ticket, color: "text-accent" },
    { label: "Pending Actions", value: "334", icon: AlertTriangle, color: "text-red-400" },
    { label: "Resolution Rate", value: "92.1%", icon: CheckCircle, color: "text-green-400" },
    { label: "Avg Resolution Time", value: "4.2h", icon: Clock, color: "text-primary" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="space-y-4 animate-slide-down">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Ticket Intelligence</h1>
            <p className="text-muted-foreground text-lg">Advanced ticket analysis and resolution tracking</p>
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
          <h3 className="text-foreground text-lg font-semibold mb-4">Ticket Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-manatee">Total Messages</span>
              <span className="font-semibold text-white">3,247</span>
            </div>
            <div className="flex justify-between">
              <span className="text-manatee">Urgent Messages</span>
              <span className="font-semibold text-red-400">334</span>
            </div>
            <div className="flex justify-between">
              <span className="text-manatee">Resolution Rate</span>
              <span className="font-semibold text-green-400">92.1%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-manatee">Sub Categories</span>
              <span className="font-semibold text-white">15</span>
            </div>
          </div>
        </div>

        <div className="card-gradient-accent p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-foreground text-lg font-semibold mb-4">Ticket Analytics</h3>
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-iron/30 rounded-lg">
            <p className="text-manatee">Ticket charts and graphs</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Link href="/ticket/topic-analysis">
          <Button className="px-8 btn-gradient-primary">
            View Tickets
          </Button>
        </Link>
      </div>
    </div>
  );
}
