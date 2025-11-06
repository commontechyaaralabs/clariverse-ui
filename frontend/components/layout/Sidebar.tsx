"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Mail, MessageCircle, Ticket, Share2, Mic, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  const navigationItems = [
    // {
    //   id: "dashboard",
    //   label: "Dashboard",
    //   icon: BarChart3,
    //   href: "/",
    //   hasSubItems: false,
    // },
    {
      id: "email",
      label: "Email",
      icon: Mail,
      href: "/email",
      hasSubItems: false,
    },
    {
      id: "social",
      label: "Social Media",
      icon: Share2,
      href: "/social",
      hasSubItems: false,
    },
    // {
    //   id: "chat",
    //   label: "Chat",
    //   icon: MessageCircle,
    //   href: "/chat",
    //   hasSubItems: false,
    // },
    // {
    //   id: "ticket",
    //   label: "Ticket",
    //   icon: Ticket,
    //   href: "/ticket",
    //   hasSubItems: false,
    // },
    {
      id: "voice",
      label: "Voice Transcript",
      icon: Mic,
      href: "/voice",
      hasSubItems: false,
    },
    // {
    //   id: "topic-analysis",
    //   label: "Topic Analysis",
    //   icon: TrendingUp,
    //   href: "/topic-analysis",
    //   hasSubItems: false,
    // },
  ];

  return (
    <div 
      className={`min-h-screen border-r border-border transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-72' : 'w-16'
      }`}
      style={{ backgroundColor: 'var(--sidebar)' }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo Section */}
      <div className={`mb-8 animate-fade-in ${isExpanded ? 'p-6 pb-4' : 'p-3 pb-4'}`}>
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          {isExpanded && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold text-white">Clariverse</h1>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`sidebar-nav space-y-2 ${isExpanded ? 'px-6' : 'px-3'}`}>
        {navigationItems.map((item, index) => (
          <div key={item.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <Link href={item.href}>
              <Button
                variant={pathname === item.href ? "default" : "ghost"}
                className={`w-full h-9 ${
                  isExpanded 
                    ? 'justify-start gap-2 px-2' 
                    : 'justify-center p-0'
                } ${
                  pathname === item.href
                    ? 'btn-gradient-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {isExpanded && (
                  <span className="animate-fade-in truncate min-w-0">{item.label}</span>
                )}
              </Button>
            </Link>
          </div>
        ))}
      </nav>
    </div>
  );
}
