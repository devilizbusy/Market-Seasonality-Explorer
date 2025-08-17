"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/Select";
import { Badge } from "./ui/Badge";
import {
  Activity,
  Play,
  Pause,
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  Volume2,
  Zap,
} from "lucide-react";

export function LiveChart({ data, symbol, selectedDate, selectedDateRange }) {
  const [chartType, setChartType] = useState("volatility");
  const [isLive, setIsLive] = useState(true);
  const [liveData, setLiveData] = useState([]);
  const canvasRef = useRef(null);

  // Simulate live data updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const newDataPoint = {
        timestamp: now.toISOString(),
        volatility: Math.random() * 0.1 + 0.02, // 2-12% volatility
        volume: Math.floor(Math.random() * 50000) + 10000,
        price: 65000 + (Math.random() - 0.5) * 10000,
        change: (Math.random() - 0.5) * 5, // -2.5% to +2.5%
      };

      setLiveData((prev) => {
        const updated = [...prev, newDataPoint];
        return updated.slice(-50); // Keep last 50 points
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  // Draw chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || liveData.length === 0) return;

    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set up chart area
    const padding = 30;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Get data values based on chart type
    const values = liveData.map((d) => {
      switch (chartType) {
        case "volatility":
          return d.volatility * 100;
        case "volume":
          return d.volume;
        case "price":
          return d.price;
        default:
          return d.volatility * 100;
      }
    });

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    // Draw grid lines
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight * i) / 4;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw chart line with gradient
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    const chartColor = getChartColor();
    gradient.addColorStop(0, chartColor.primary);
    gradient.addColorStop(1, chartColor.secondary);

    ctx.strokeStyle = chartColor.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();

    liveData.forEach((point, index) => {
      const x =
        padding + (chartWidth * index) / Math.max(liveData.length - 1, 1);
      const normalizedValue = (values[index] - minValue) / valueRange;
      const y = padding + chartHeight - normalizedValue * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Fill area under curve
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.1;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Draw data points
    ctx.fillStyle = chartColor.primary;
    liveData.forEach((point, index) => {
      const x =
        padding + (chartWidth * index) / Math.max(liveData.length - 1, 1);
      const normalizedValue = (values[index] - minValue) / valueRange;
      const y = padding + chartHeight - normalizedValue * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = "#64748b";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const value = minValue + (valueRange * (4 - i)) / 4;
      const y = padding + (chartHeight * i) / 4;
      const label = formatValue(value, chartType);
      ctx.fillText(label, padding - 5, y + 3);
    }
  }, [liveData, chartType]);

  const getChartColor = () => {
    switch (chartType) {
      case "volatility":
        return { primary: "#f59e0b", secondary: "#fbbf24" };
      case "volume":
        return { primary: "#3b82f6", secondary: "#60a5fa" };
      case "price":
        return { primary: "#10b981", secondary: "#34d399" };
      default:
        return { primary: "#6b7280", secondary: "#9ca3af" };
    }
  };

  const formatValue = (value, type) => {
    switch (type) {
      case "price":
        return `$${(value / 1000).toFixed(0)}k`;
      case "volume":
        return `${(value / 1000).toFixed(0)}k`;
      default:
        return `${value.toFixed(1)}%`;
    }
  };

  const getChartIcon = () => {
    switch (chartType) {
      case "volatility":
        return <Zap className="h-4 w-4" />;
      case "volume":
        return <Volume2 className="h-4 w-4" />;
      case "price":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getCurrentValue = () => {
    if (liveData.length === 0) return "No data";
    const latest = liveData[liveData.length - 1];
    switch (chartType) {
      case "volatility":
        return `${(latest.volatility * 100).toFixed(2)}%`;
      case "volume":
        return latest.volume.toLocaleString();
      case "price":
        return `$${latest.price.toLocaleString()}`;
      default:
        return "N/A";
    }
  };

  const getChangeColor = () => {
    if (liveData.length < 2) return "text-gray-500";
    const change = liveData[liveData.length - 1]?.change || 0;
    return change >= 0 ? "text-green-600" : "text-red-600";
  };

  const getChangeIcon = () => {
    if (liveData.length < 2) return null;
    const change = liveData[liveData.length - 1]?.change || 0;
    return change >= 0 ? (
      <TrendingUp className="h-3 w-3" />
    ) : (
      <TrendingDown className="h-3 w-3" />
    );
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getChartIcon()}
            <CardTitle className="text-sm font-semibold">
              Live {chartType.charAt(0).toUpperCase() + chartType.slice(1)}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {isLive && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
            )}
            <div className="flex items-center space-x-1">
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-20 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volatility">
                    <div className="flex items-center space-x-1">
                      <Zap className="h-3 w-3" />
                      <span>Vol</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="volume">
                    <div className="flex items-center space-x-1">
                      <Volume2 className="h-3 w-3" />
                      <span>Vol</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="price">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span>Price</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLive(!isLive)}
                className={`h-7 w-7 p-0 ${
                  isLive ? "text-green-600 border-green-200" : "text-gray-600"
                }`}
              >
                {isLive ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-lg font-bold">{getCurrentValue()}</span>
            {liveData.length > 1 && (
              <div
                className={`flex items-center space-x-1 text-xs ${getChangeColor()}`}
              >
                {getChangeIcon()}
                <span>
                  {liveData[liveData.length - 1]?.change >= 0 ? "+" : ""}
                  {liveData[liveData.length - 1]?.change?.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
          <Badge variant="secondary" className="text-xs">
            {liveData.length} pts
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <canvas
          ref={canvasRef}
          width={300}
          height={120}
          className="w-full h-24 border rounded-md bg-gradient-to-br from-gray-50 to-white"
        />
        <div className="flex items-center justify-center mt-2">
          <div
            className={`flex items-center space-x-1 text-xs ${
              isLive ? "text-green-600" : "text-gray-500"
            }`}
          >
            <Activity className="h-3 w-3" />
            <span>{isLive ? "Live updates every 2s" : "Paused"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
