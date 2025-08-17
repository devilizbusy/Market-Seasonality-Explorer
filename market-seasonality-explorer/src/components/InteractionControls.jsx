"use client";

import { useState, useCallback } from "react";
import { Button } from "./ui/Button";
import { Switch } from "./ui/Switch";
import { Label } from "./ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/Select";
import {
  MousePointer,
  Hand,
  Square,
  Calendar,
  Filter,
  Eye,
  Crosshair,
  Move,
  ZoomIn,
} from "lucide-react";
import ErrorBoundary from "./ErrorBoundary";

export const INTERACTION_MODES = {
  hover: {
    name: "Hover Mode",
    icon: MousePointer,
    description: "Hover over cells to see detailed tooltips",
    cursor: "cursor-pointer",
  },
  click: {
    name: "Click Mode",
    icon: Hand,
    description: "Click on dates for detailed breakdown",
    cursor: "cursor-pointer",
  },
  select: {
    name: "Selection Mode",
    icon: Square,
    description: "Select date ranges for custom analysis",
    cursor: "cursor-crosshair",
  },
  pan: {
    name: "Pan Mode",
    icon: Move,
    description: "Pan and navigate the calendar",
    cursor: "cursor-move",
  },
  zoom: {
    name: "Zoom Mode",
    icon: ZoomIn,
    description: "Click to zoom into specific areas",
    cursor: "cursor-zoom-in",
  },
};

export const FILTER_TYPES = [
  { value: "all", label: "All Instruments" },
  { value: "crypto", label: "Cryptocurrencies" },
  { value: "stocks", label: "Stocks" },
  { value: "forex", label: "Forex" },
  { value: "commodities", label: "Commodities" },
];

export const TIME_PERIODS = [
  { value: "1d", label: "1 Day" },
  { value: "1w", label: "1 Week" },
  { value: "1m", label: "1 Month" },
  { value: "3m", label: "3 Months" },
  { value: "6m", label: "6 Months" },
  { value: "1y", label: "1 Year" },
  { value: "all", label: "All Time" },
];

export const METRIC_TYPES = [
  { value: "price", label: "Price Action", color: "bg-blue-100" },
  { value: "volume", label: "Volume", color: "bg-green-100" },
  { value: "volatility", label: "Volatility", color: "bg-orange-100" },
  { value: "liquidity", label: "Liquidity", color: "bg-purple-100" },
  { value: "sentiment", label: "Market Sentiment", color: "bg-pink-100" },
];

export function InteractionControls({
  interactionMode = "hover",
  onInteractionModeChange,
  showTooltips = true,
  onTooltipToggle,
  filterType = "all",
  onFilterChange,
  timePeriod = "1m",
  onTimePeriodChange,
  selectedMetrics = ["price", "volume", "volatility"],
  onMetricsChange,
  className = "",
}) {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  const handleInteractionModeChange = useCallback(
    (mode) => {
      onInteractionModeChange?.(mode);
    },
    [onInteractionModeChange]
  );

  const handleMetricToggle = useCallback(
    (metric) => {
      const newMetrics = selectedMetrics.includes(metric)
        ? selectedMetrics.filter((m) => m !== metric)
        : [...selectedMetrics, metric];
      onMetricsChange?.(newMetrics);
    },
    [selectedMetrics, onMetricsChange]
  );

  const currentMode =
    INTERACTION_MODES[interactionMode] || INTERACTION_MODES.hover;

  return (
    <ErrorBoundary>
      <div className={`space-y-3 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium flex items-center space-x-2">
            <Crosshair className="h-3 w-3" />
            <span>Interaction Controls</span>
          </h3>
          <Switch
            checked={isAdvancedMode}
            onCheckedChange={setIsAdvancedMode}
            className="scale-75"
          />
        </div>

        {/* Interaction Mode Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Interaction Mode</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            {Object.entries(INTERACTION_MODES).map(([key, mode]) => {
              const IconComponent = mode.icon;
              return (
                <Button
                  key={key}
                  variant={interactionMode === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleInteractionModeChange(key)}
                  className="flex items-center space-x-1 text-xs h-7 justify-start"
                  title={mode.description}
                >
                  <IconComponent className="h-3 w-3" />
                  <span className="hidden sm:inline">
                    {mode.name.split(" ")[0]}
                  </span>
                </Button>
              );
            })}
          </div>
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            <strong>{currentMode.name}:</strong> {currentMode.description}
          </div>
        </div>

        {/* Tooltip Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-3 w-3 text-gray-500" />
            <Label htmlFor="tooltips" className="text-xs">
              Show Detailed Tooltips
            </Label>
          </div>
          <Switch
            id="tooltips"
            checked={showTooltips}
            onCheckedChange={onTooltipToggle}
            className="scale-75"
          />
        </div>

        {/* Advanced Controls */}
        {isAdvancedMode && (
          <div className="space-y-3 border-t pt-3">
            {/* Filter Controls */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center space-x-1">
                <Filter className="h-3 w-3" />
                <span>Instrument Filter</span>
              </Label>
              <Select value={filterType} onValueChange={onFilterChange}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_TYPES.map((filter) => (
                    <SelectItem
                      key={filter.value}
                      value={filter.value}
                      className="text-xs"
                    >
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Period */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Analysis Period</span>
              </Label>
              <Select value={timePeriod} onValueChange={onTimePeriodChange}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_PERIODS.map((period) => (
                    <SelectItem
                      key={period.value}
                      value={period.value}
                      className="text-xs"
                    >
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Metric Types */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Display Metrics</Label>
              <div className="grid grid-cols-2 gap-1">
                {METRIC_TYPES.map((metric) => (
                  <div
                    key={metric.value}
                    className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-all ${
                      selectedMetrics.includes(metric.value)
                        ? `${metric.color} border-gray-400`
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                    onClick={() => handleMetricToggle(metric.value)}
                  >
                    <div
                      className={`w-3 h-3 rounded border-2 flex items-center justify-center ${
                        selectedMetrics.includes(metric.value)
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedMetrics.includes(metric.value) && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-xs font-medium">{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-1 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onInteractionModeChange?.("hover");
              onTooltipToggle?.(true);
            }}
            className="text-xs h-7"
          >
            Enable Hover
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onInteractionModeChange?.("select");
              onTooltipToggle?.(true);
            }}
            className="text-xs h-7"
          >
            Range Select
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onMetricsChange?.(["price", "volume", "volatility"]);
              onFilterChange?.("all");
            }}
            className="text-xs h-7"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  );
}
