"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { clsx } from "clsx"

// Chart context for configuration
interface ChartConfig {
  [key: string]: {
    label: string
    color?: string
  }
}

const ChartContext = React.createContext<{
  config: ChartConfig
}>({
  config: {},
})

// Chart configuration hook
export function useChartConfig() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChartConfig must be used within a ChartContainer")
  }
  return context
}

// Chart container component
interface ChartContainerProps {
  config: ChartConfig
  className?: string
  children: React.ReactNode
}

export function ChartContainer({ config, className, children }: ChartContainerProps) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div className={clsx("w-full", className)}>
        {children}
      </div>
    </ChartContext.Provider>
  )
}

// Chart tooltip component
interface ChartTooltipProps {
  children: React.ReactNode
  cursor?: boolean
  content?: any
}

export function ChartTooltip({ children, cursor = true, content }: ChartTooltipProps) {
  return (
    <RechartsPrimitive.Tooltip
      cursor={cursor}
      content={content}
    />
  )
}

// Chart tooltip content component
interface ChartTooltipContentProps {
  active?: boolean
  payload?: any[]
  label?: string
  labelFormatter?: (value: any) => string
  indicator?: string
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  indicator = "line"
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null

  const { config } = useChartConfig()

  return (
    <div className="neu-raised rounded-lg border border-border bg-card p-3 shadow-lg">
      {label && (
        <div className="mb-2 text-sm font-medium text-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const configItem = config[entry.dataKey] || {}
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color || configItem.color }}
              />
              <span className="text-muted-foreground">{configItem.label || entry.dataKey}:</span>
              <span className="font-medium text-foreground">{entry.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Chart legend component
interface ChartLegendProps {
  children: React.ReactNode
  content?: any
}

export function ChartLegend({ children, content }: ChartLegendProps) {
  return (
    <RechartsPrimitive.Legend content={content}>
      {children}
    </RechartsPrimitive.Legend>
  )
}

// Chart legend content component
interface ChartLegendContentProps {
  payload?: any[]
}

export function ChartLegendContent({ payload }: ChartLegendContentProps) {
  if (!payload?.length) return null

  const { config } = useChartConfig()

  return (
    <div className="flex flex-wrap gap-4">
      {payload.map((entry, index) => {
        const configItem = config[entry.dataKey] || {}
        return (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color || configItem.color }}
            />
            <span className="text-muted-foreground">{configItem.label || entry.dataKey}</span>
          </div>
        )
      })}
    </div>
  )
}

// Re-export commonly used Recharts components
export {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Funnel,
  FunnelChart,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Sankey,
  Scatter,
  ScatterChart,
  Treemap,
  XAxis,
  YAxis,
} from "recharts"

// Chart config type
export type { ChartConfig }
