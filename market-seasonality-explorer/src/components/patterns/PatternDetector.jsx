"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Search,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Zap,
} from "lucide-react";

export function PatternDetector({ data, selectedData = [] }) {
  const hasPatterns = selectedData && selectedData.length >= 2;

  if (!hasPatterns) {
    return (
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center space-x-2">
            <Search className="h-4 w-4 text-blue-600" />
            <span>Pattern Detection</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-4">
            <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-3">
              Select 2+ dates to detect patterns
            </p>
            <Badge variant="outline" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              No data selected
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Simple pattern detection logic
  const patterns = selectedData
    .map((item, index) => {
      if (!item) return null;

      const priceChange = ((item.close - item.open) / item.open) * 100;
      const isUptrend = priceChange > 0;
      const volatility = item.volatility || 0;

      return {
        date: new Date(item.timestamp),
        priceChange,
        isUptrend,
        volatility,
        pattern:
          volatility > 0.03
            ? "High Volatility"
            : isUptrend
            ? "Bullish"
            : "Bearish",
        strength: Math.abs(priceChange) > 2 ? "Strong" : "Weak",
      };
    })
    .filter(Boolean);

  const overallTrend =
    patterns.filter((p) => p.isUptrend).length > patterns.length / 2
      ? "bullish"
      : "bearish";
  const avgVolatility =
    patterns.reduce((sum, p) => sum + p.volatility, 0) / patterns.length;

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center space-x-2">
            <Search className="h-4 w-4 text-blue-600" />
            <span>Pattern Detection</span>
          </CardTitle>
          <Badge
            variant={overallTrend === "bullish" ? "default" : "destructive"}
            className="text-xs"
          >
            {overallTrend === "bullish" ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {overallTrend.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="bg-blue-50 p-2 rounded-lg">
            <div className="flex items-center space-x-1 mb-1">
              <Activity className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium">Avg Volatility</span>
            </div>
            <div className="text-sm font-bold">
              {(avgVolatility * 100).toFixed(2)}%
            </div>
          </div>
          <div className="bg-green-50 p-2 rounded-lg">
            <div className="flex items-center space-x-1 mb-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium">Patterns</span>
            </div>
            <div className="text-sm font-bold">{patterns.length}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {patterns.map((pattern, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                {pattern.isUptrend ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className="text-xs font-medium">
                  {pattern.date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Badge
                  variant={pattern.isUptrend ? "default" : "destructive"}
                  className="text-xs px-1 py-0"
                >
                  {pattern.pattern}
                </Badge>
                <span
                  className={`text-xs font-medium ${
                    pattern.priceChange >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {pattern.priceChange >= 0 ? "+" : ""}
                  {pattern.priceChange.toFixed(1)}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-3 pt-2 border-t">
          <div className="flex items-center justify-center">
            <Button variant="ghost" size="sm" className="text-xs h-6">
              <Zap className="h-3 w-3 mr-1" />
              Analyze Trends
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
