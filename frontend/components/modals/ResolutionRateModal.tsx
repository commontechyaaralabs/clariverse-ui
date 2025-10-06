"use client"

import * as React from "react"
import { X } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Button } from "@/components/ui/button"

interface ResolutionRateModalProps {
  isOpen: boolean
  onClose: () => void
  data: {
    closed: number
    open: number
    inProgress: number
    other: number
    total: number
  }
}

const COLORS = {
  closed: "#10b981", // green-500
  open: "#ef4444",   // red-500
  inProgress: "#3b82f6", // blue-500
  other: "#6b7280"   // gray-500
}

export function ResolutionRateModal({ isOpen, onClose, data }: ResolutionRateModalProps) {
  if (!isOpen) return null

  const pieData = [
    { name: "Closed", value: data.closed, color: COLORS.closed },
    { name: "Open", value: data.open, color: COLORS.open },
    { name: "In Progress", value: data.inProgress, color: COLORS.inProgress },
    { name: "Other", value: data.other, color: COLORS.other }
  ]

  const resolutionRate = data.total > 0 ? ((data.closed / data.total) * 100).toFixed(1) : 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Resolution Rate Analysis</h2>
            <p className="text-muted-foreground mt-1">Detailed breakdown of {data.total} emails</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Closed Emails */}
            <div className="bg-card border border-green-500/20 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-500 mb-1">{data.closed}</div>
              <div className="text-foreground text-sm font-medium">Closed</div>
              <div className="text-green-400 text-xs">
                {data.total > 0 ? ((data.closed / data.total) * 100).toFixed(1) : 0}%
              </div>
            </div>

            {/* Open Emails */}
            <div className="bg-card border border-red-500/20 rounded-xl p-4">
              <div className="text-3xl font-bold text-red-500 mb-1">{data.open}</div>
              <div className="text-foreground text-sm font-medium">Open</div>
              <div className="text-red-400 text-xs">
                {data.total > 0 ? ((data.open / data.total) * 100).toFixed(1) : 0}%
              </div>
            </div>

            {/* In Progress Emails */}
            <div className="bg-card border border-blue-500/20 rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-500 mb-1">{data.inProgress}</div>
              <div className="text-foreground text-sm font-medium">In Progress</div>
              <div className="text-blue-400 text-xs">
                {data.total > 0 ? ((data.inProgress / data.total) * 100).toFixed(1) : 0}%
              </div>
            </div>

            {/* Other Emails */}
            <div className="bg-card border border-gray-500/20 rounded-xl p-4">
              <div className="text-3xl font-bold text-gray-400 mb-1">{data.other}</div>
              <div className="text-foreground text-sm font-medium">Other</div>
              <div className="text-gray-400 text-xs">
                {data.total > 0 ? ((data.other / data.total) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>

          {/* Resolution Status Distribution */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Resolution Status Distribution</h3>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`${value} emails`, '']}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--foreground)'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value: any) => (
                        <span style={{ color: 'var(--foreground)' }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-primary/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{resolutionRate}%</div>
              <div className="text-muted-foreground text-sm">Overall Resolution Rate</div>
            </div>
            <div className="bg-card border border-accent/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-accent mb-1">{data.total}</div>
              <div className="text-muted-foreground text-sm">Total Emails Analyzed</div>
            </div>
            <div className="bg-card border border-chart-3/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-chart-3 mb-1">
                {data.total > 0 ? ((data.open + data.inProgress) / data.total * 100).toFixed(1) : 0}%
              </div>
              <div className="text-muted-foreground text-sm">Pending Resolution</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
