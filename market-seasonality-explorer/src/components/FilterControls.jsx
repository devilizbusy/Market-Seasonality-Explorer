"use client";

import { useState, useCallback } from "react";
import { Badge } from "./ui/Badge";
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
  Loader2,
  TrendingUp,
  BarChart3,
  Activity,
  Volume2,
} from "lucide-react";
import ErrorBoundary from "./ErrorBoundary";
import { Button } from "./ui/Button";

export function FilterControls({ filters, onFiltersChange, loading }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = useCallback(
    (key, value) => {
      try {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
      } catch (error) {
        console.error("Error changing filter:", error);
      }
    },
    [localFilters, onFiltersChange]
  );

  const handleSymbolChange = useCallback(
    (symbol) => {
      handleFilterChange("symbol", symbol);
    },
    [handleFilterChange]
  );

  const handleToggleFilter = useCallback(
    (filterKey) => {
      handleFilterChange(filterKey, !localFilters[filterKey]);
    },
    [localFilters, handleFilterChange]
  );

  const symbols = [
    { value: "BTCUSDT", label: "Bitcoin (BTC/USDT)" },
    { value: "ETHUSDT", label: "Ethereum (ETH/USDT)" },
    { value: "ADAUSDT", label: "Cardano (ADA/USDT)" },
    { value: "SOLUSDT", label: "Solana (SOL/USDT)" },
    { value: "DOTUSDT", label: "Polkadot (DOT/USDT)" },
    { value: "LINKUSDT", label: "Chainlink (LINK/USDT)" },
  ];

  return (
    <ErrorBoundary>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Filters & Controls</span>
          </h3>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {/* Trading Pair */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Trading Pair</Label>
            <Select
              value={filters.symbol}
              onValueChange={handleSymbolChange}
              disabled={loading}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {symbols.map((symbol) => (
                  <SelectItem
                    key={symbol.value}
                    value={symbol.value}
                    className="text-xs"
                  >
                    <span className="block sm:hidden">{symbol.value}</span>
                    <span className="hidden sm:block">{symbol.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Layers */}
          <div className="space-y-2 sm:col-span-1 xl:col-span-1">
            <Label className="text-xs font-medium">Data Layers</Label>
            <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-1 gap-1 sm:gap-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="volatility"
                  checked={filters.showVolatility}
                  onCheckedChange={() => handleToggleFilter("showVolatility")}
                  className="scale-75 sm:scale-90"
                />
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 flex-shrink-0" />
                <Label htmlFor="volatility" className="text-xs leading-tight">
                  <span className="block sm:hidden">Volatility</span>
                  <span className="hidden sm:block">Volatility Heatmap</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="liquidity"
                  checked={filters.showLiquidity}
                  onCheckedChange={() => handleToggleFilter("showLiquidity")}
                  className="scale-75 sm:scale-90"
                />
                <Volume2 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                <Label htmlFor="liquidity" className="text-xs leading-tight">
                  <span className="block sm:hidden">Liquidity</span>
                  <span className="hidden sm:block">Liquidity Indicators</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="performance"
                  checked={filters.showPerformance}
                  onCheckedChange={() => handleToggleFilter("showPerformance")}
                  className="scale-75 sm:scale-90"
                />
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                <Label htmlFor="performance" className="text-xs leading-tight">
                  <span className="block sm:hidden">Performance</span>
                  <span className="hidden sm:block">Performance Metrics</span>
                </Label>
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          <div className="space-y-2 sm:col-span-2 xl:col-span-1">
            <Label className="text-xs font-medium">Active Filters</Label>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  {filters.symbol}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {filters.showVolatility && (
                  <Badge variant="outline" className="text-xs">
                    Volatility
                  </Badge>
                )}
                {filters.showLiquidity && (
                  <Badge variant="outline" className="text-xs">
                    Liquidity
                  </Badge>
                )}
                {filters.showPerformance && (
                  <Badge variant="outline" className="text-xs">
                    Performance
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Data points: {loading ? "Loading..." : "Available"}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-1 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleFilterChange("showVolatility", true);
              handleFilterChange("showLiquidity", true);
              handleFilterChange("showPerformance", true);
            }}
            className="text-xs flex-1 sm:flex-none min-w-0 h-7"
          >
            <span className="truncate">Show All</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleFilterChange("showVolatility", false);
              handleFilterChange("showLiquidity", false);
              handleFilterChange("showPerformance", false);
            }}
            className="text-xs flex-1 sm:flex-none min-w-0 h-7"
          >
            <span className="truncate">Hide All</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleFilterChange("symbol", "BTCUSDT");
              handleFilterChange("showVolatility", true);
              handleFilterChange("showLiquidity", true);
              handleFilterChange("showPerformance", true);
            }}
            className="text-xs flex-1 sm:flex-none min-w-0 h-7"
          >
            <span className="truncate">Reset</span>
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  );
}
