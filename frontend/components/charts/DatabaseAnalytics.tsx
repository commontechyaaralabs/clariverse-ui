'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Database, TrendingUp, AlertTriangle, Clock, Users } from 'lucide-react';

const COLORS = {
  urgent: '#ef4444',
  nonUrgent: '#10b981',
  followUp: '#f59e0b',
  noFollowUp: '#6b7280',
  pending: '#3b82f6',
  notPending: '#8b5cf6',
  company: '#f97316',
  customer: '#06b6d4',
  external: '#84cc16',
  internal: '#ec4899',
  p1: '#dc2626',
  p2: '#ea580c',
  p3: '#ca8a04',
  p4: '#16a34a',
  p5: '#0891b2',
};

export function DatabaseAnalytics() {
  // Urgency data
  const urgencyData = [
    { name: 'Non-Urgent', value: 1823, color: COLORS.nonUrgent },
    { name: 'Urgent', value: 181, color: COLORS.urgent },
  ];

  // Follow-up required data
  const followUpData = [
    { name: 'Follow-up Required', value: 1467, color: COLORS.followUp },
    { name: 'No Follow-up', value: 537, color: COLORS.noFollowUp },
  ];

  // Action pending status data
  const actionPendingData = [
    { name: 'Pending', value: 1467, color: COLORS.pending },
    { name: 'Not Pending', value: 537, color: COLORS.notPending },
  ];

  // Action pending from data
  const actionFromData = [
    { name: 'Company', value: 860, color: COLORS.company },
    { name: 'Customer', value: 607, color: COLORS.customer },
    { name: 'Null/Empty', value: 537, color: COLORS.noFollowUp },
  ];

  // Category data
  const categoryData = [
    { name: 'External', value: 1658, color: COLORS.external },
    { name: 'Internal', value: 346, color: COLORS.internal },
  ];

  // Priority data
  const priorityData = [
    { name: 'P1-Critical', value: 251, color: COLORS.p1 },
    { name: 'P2-High', value: 452, color: COLORS.p2 },
    { name: 'P3-Medium', value: 498, color: COLORS.p3 },
    { name: 'P4-Low', value: 370, color: COLORS.p4 },
    { name: 'P5-Very Low', value: 433, color: COLORS.p5 },
  ];

  // Resolution status data
  const resolutionData = [
    { name: 'Open', value: 1467, color: COLORS.pending },
    { name: 'Closed', value: 537, color: COLORS.notPending },
  ];

  // Stages data
  const stagesData = [
    { name: 'Authenticate', value: 220, color: COLORS.p1 },
    { name: 'Categorize', value: 220, color: COLORS.p2 },
    { name: 'Close', value: 187, color: COLORS.p3 },
    { name: 'Escalation', value: 220, color: COLORS.urgent },
    { name: 'Receive', value: 293, color: COLORS.p4 },
    { name: 'Report', value: 136, color: COLORS.p5 },
    { name: 'Resolution', value: 366, color: COLORS.followUp },
    { name: 'Resolved', value: 214, color: COLORS.notPending },
    { name: 'Update', value: 148, color: COLORS.company },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{label}</p>
          <p className="text-blue-400">
            Count: {payload[0].value} ({((payload[0].value / 2004) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Database className="h-5 w-5 text-blue-400" />
            Database Analytics Dashboard
          </CardTitle>
          <CardDescription className="text-gray-400">
            Real-time analysis of 2004 email thread records
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">181</div>
              <div className="text-sm text-gray-400">Urgent Threads</div>
              <div className="text-xs text-gray-500">9.0% of total</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">1467</div>
              <div className="text-sm text-gray-400">Follow-up Required</div>
              <div className="text-xs text-gray-500">73.2% of total</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">1467</div>
              <div className="text-sm text-gray-400">Action Pending</div>
              <div className="text-xs text-gray-500">73.2% of total</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">537</div>
              <div className="text-sm text-gray-400">Closed Threads</div>
              <div className="text-xs text-gray-500">26.8% of total</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgency Distribution */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              Urgency Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={urgencyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {urgencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Urgent (181)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Non-Urgent (1823)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    axisLine={{ stroke: '#4b5563' }}
                    tickLine={{ stroke: '#4b5563' }}
                  />
                  <YAxis 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={{ stroke: '#4b5563' }}
                    tickLine={{ stroke: '#4b5563' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="h-4 w-4 text-purple-400" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-300">External (1658)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Internal (346)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Pending From */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="h-4 w-4 text-orange-400" />
              Action Pending From
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={actionFromData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    axisLine={{ stroke: '#4b5563' }}
                    tickLine={{ stroke: '#4b5563' }}
                  />
                  <YAxis 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={{ stroke: '#4b5563' }}
                    tickLine={{ stroke: '#4b5563' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {actionFromData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stages Chart */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Database className="h-4 w-4 text-blue-400" />
            Workflow Stages Distribution
          </CardTitle>
          <CardDescription className="text-gray-400">
            Distribution of threads across different workflow stages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stagesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  axisLine={{ stroke: '#4b5563' }}
                  tickLine={{ stroke: '#4b5563' }}
                />
                <YAxis 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#4b5563' }}
                  tickLine={{ stroke: '#4b5563' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stagesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Database Summary</CardTitle>
          <CardDescription className="text-gray-400">
            Key insights from the 2004 email thread dataset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-white">9.0%</div>
              <div className="text-sm text-gray-400">Urgent Rate</div>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-white">73.2%</div>
              <div className="text-sm text-gray-400">Follow-up Rate</div>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-white">82.7%</div>
              <div className="text-sm text-gray-400">External Rate</div>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-lg font-bold text-white">26.8%</div>
              <div className="text-sm text-gray-400">Resolution Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
