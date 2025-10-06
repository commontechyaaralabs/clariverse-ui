"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { emailData } from "@/lib/emailData"

export const description = "Customer satisfaction trends over time"

const chartConfig = {
  satisfaction: {
    label: "Satisfaction Score",
  },
  positive: {
    label: "Positive Sentiment",
    color: "var(--chart-1)",
  },
  neutral: {
    label: "Neutral Sentiment", 
    color: "var(--chart-2)",
  },
  negative: {
    label: "Negative Sentiment",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function CustomerSatisfactionChart() {
  const [timeRange, setTimeRange] = React.useState("30d")

  // Process email data to create chart data
  const chartData = React.useMemo(() => {
    // Group emails by date and calculate sentiment metrics
    const dailyData: { [key: string]: { positive: number; neutral: number; negative: number; total: number } } = {}
    
    emailData.forEach((email) => {
      const date = new Date(email.thread.first_message_at).toISOString().split('T')[0]
      
      if (!dailyData[date]) {
        dailyData[date] = { positive: 0, neutral: 0, negative: 0, total: 0 }
      }
      
      dailyData[date].total++
      
      // Categorize sentiment based on overall_sentiment score
      const sentiment = email.overall_sentiment || 0
      if (sentiment >= 4) {
        dailyData[date].positive++
      } else if (sentiment >= 2) {
        dailyData[date].neutral++
      } else {
        dailyData[date].negative++
      }
    })

    // Convert to array and sort by date
    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        positive: data.positive,
        neutral: data.neutral,
        negative: data.negative,
        total: data.total,
        satisfaction: data.total > 0 ? ((data.positive * 5 + data.neutral * 3 + data.negative * 1) / data.total) : 0
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [])

  const filteredData = React.useMemo(() => {
    const referenceDate = new Date()
    let daysToSubtract = 30
    if (timeRange === "7d") {
      daysToSubtract = 7
    } else if (timeRange === "90d") {
      daysToSubtract = 90
    }
    
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    
    return chartData.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate
    })
  }, [chartData, timeRange])

  // Calculate overall metrics
  const totalEmails = filteredData.reduce((sum, item) => sum + item.total, 0)
  const avgSatisfaction = totalEmails > 0 
    ? filteredData.reduce((sum, item) => sum + (item.satisfaction * item.total), 0) / totalEmails 
    : 0
  const positivePercentage = totalEmails > 0 
    ? (filteredData.reduce((sum, item) => sum + item.positive, 0) / totalEmails) * 100 
    : 0

  return (
    <Card className="neu-raised">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b border-border py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-foreground">Customer Satisfaction Trends</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sentiment analysis over time - {totalEmails} emails analyzed
          </CardDescription>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <button
            onClick={() => setTimeRange("7d")}
            className={`px-3 py-1 text-sm rounded-lg transition-all ${
              timeRange === "7d" 
                ? "bg-primary text-primary-foreground shadow-lg" 
                : "neu-button hover:shadow-neu-button-hover"
            }`}
          >
            7d
          </button>
          <button
            onClick={() => setTimeRange("30d")}
            className={`px-3 py-1 text-sm rounded-lg transition-all ${
              timeRange === "30d" 
                ? "bg-primary text-primary-foreground shadow-lg" 
                : "neu-button hover:shadow-neu-button-hover"
            }`}
          >
            30d
          </button>
          <button
            onClick={() => setTimeRange("90d")}
            className={`px-3 py-1 text-sm rounded-lg transition-all ${
              timeRange === "90d" 
                ? "bg-primary text-primary-foreground shadow-lg" 
                : "neu-button hover:shadow-neu-button-hover"
            }`}
          >
            90d
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 rounded-xl bg-card border border-primary/20">
            <div className="text-2xl font-bold text-primary mb-1">{avgSatisfaction.toFixed(1)}/5</div>
            <div className="text-muted-foreground text-sm">Average Satisfaction</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-card border border-accent/20">
            <div className="text-2xl font-bold text-accent mb-1">{positivePercentage.toFixed(1)}%</div>
            <div className="text-muted-foreground text-sm">Positive Sentiment</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-card border border-chart-3/20">
            <div className="text-2xl font-bold text-chart-3 mb-1">{totalEmails}</div>
            <div className="text-muted-foreground text-sm">Total Emails</div>
          </div>
        </div>

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillPositive" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-positive)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-positive)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillNeutral" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-neutral)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-neutral)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillNegative" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-negative)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-negative)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tick={{ fill: 'var(--muted-foreground)' }}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
            >
              <ChartTooltipContent
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                }}
                indicator="dot"
              />
            </ChartTooltip>
            <Area
              dataKey="negative"
              type="natural"
              fill="url(#fillNegative)"
              stroke="var(--color-negative)"
              stackId="a"
            />
            <Area
              dataKey="neutral"
              type="natural"
              fill="url(#fillNeutral)"
              stroke="var(--color-neutral)"
              stackId="a"
            />
            <Area
              dataKey="positive"
              type="natural"
              fill="url(#fillPositive)"
              stroke="var(--color-positive)"
              stackId="a"
            />
            <ChartLegend content={ChartLegendContent}>
              <ChartLegendContent />
            </ChartLegend>
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
