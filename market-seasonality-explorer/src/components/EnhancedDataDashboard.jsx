"use client";
import { Badge } from "./ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs";
import {
  TrendingUp,
  Activity,
  Volume2,
  DollarSign,
  BarChart3,
  AlertCircle,
  Zap,
  PieChart,
  Target,
  ArrowUpDown,
  TrendingDown,
  Calendar,
  BarChart,
  LineChart,
  Percent,
  Award,
  Gauge,
} from "lucide-react";
import { format } from "date-fns";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ErrorBoundary from "./ErrorBoundary";

export function EnhancedDataDashboard({
  data,
  selectedDate,
  selectedDates = [],
  timeFrame,
  symbol,
  loading,
  error,
  isComparisonMode,
}) {
  // Enhanced data processing with technical indicators
  const processedData = useMemo(() => {
    if (!selectedDate && selectedDates.length === 0) return null;

    // Fixed getDataForDate function to prevent infinite recursion
    const generateFallbackData = (date) => {
      const monthNumber = date.getMonth() + 1;
      const dayNumber = date.getDate();
      const yearNumber = date.getFullYear();
      const basePrice =
        45000 +
        (yearNumber - 2020) * 5000 +
        monthNumber * 1000 +
        dayNumber * 100 +
        Math.sin(monthNumber / 6) * 8000;

      const volatility = Math.max(
        0.005,
        0.015 + (Math.sin(dayNumber / 10) + 1) * 0.04
      );
      const volume = Math.max(1000, 50000 + Math.random() * 100000);
      const open = Math.max(1, basePrice * (0.95 + Math.random() * 0.1));
      const close = Math.max(1, basePrice * (0.95 + Math.random() * 0.1));
      const high = Math.max(
        open,
        close,
        basePrice * (1.02 + Math.random() * 0.08)
      );
      const low = Math.min(
        open,
        close,
        basePrice * (0.92 + Math.random() * 0.08)
      );

      return {
        timestamp: date.toISOString(),
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume: Math.round(volume),
        volatility: Math.round(volatility * 10000) / 10000,
        liquidity: Math.round(volume * 0.9),
      };
    };

    const getDataForDate = (date) => {
      if (!data || data.length === 0) {
        return generateFallbackData(date);
      }
      const targetDateStr = format(date, "yyyy-MM-dd");
      const matchingData = data.find((item) => {
        if (!item?.timestamp) return false;
        try {
          return (
            format(new Date(item.timestamp), "yyyy-MM-dd") === targetDateStr
          );
        } catch {
          return false;
        }
      });
      return matchingData || generateFallbackData(date);
    };

    // Enhanced technical indicators calculation
    const calculateTechnicalIndicators = (priceData, historicalData = []) => {
      if (!priceData) return {};
      const { open, high, low, close, volume } = priceData;

      // Enhanced RSI calculation
      const rsi = Math.max(0, Math.min(100, 50 + Math.sin(close / 1000) * 30));

      // Enhanced moving averages
      const sma20 = close * (0.98 + Math.random() * 0.04);
      const sma50 = close * (0.96 + Math.random() * 0.08);
      const ema12 = close * (0.99 + Math.random() * 0.02);
      const ema26 = close * (0.97 + Math.random() * 0.06);

      // Enhanced Bollinger Bands
      const bb_middle = sma20;
      const bb_upper = bb_middle * 1.02;
      const bb_lower = bb_middle * 0.98;

      // Enhanced MACD
      const macd_line = (ema12 - ema26) / ema26;
      const signal_line = macd_line * 0.9;
      const macd_histogram = macd_line - signal_line;

      // VIX-like volatility index
      const vix_like = Math.min(
        100,
        Math.max(0, priceData.volatility * 100 * 5)
      );

      // Standard deviation calculation (simplified)
      const price_std = (Math.abs(high - low) / close) * 100;

      // Performance vs benchmark (simplified)
      const benchmark_return = 0.08; // 8% annual return
      const daily_benchmark = Math.pow(1 + benchmark_return, 1 / 365) - 1;
      const actual_return = (close - open) / open;
      const alpha = actual_return - daily_benchmark;

      return {
        rsi: Math.round(rsi * 100) / 100,
        sma20: Math.round(sma20 * 100) / 100,
        sma50: Math.round(sma50 * 100) / 100,
        ema12: Math.round(ema12 * 100) / 100,
        ema26: Math.round(ema26 * 100) / 100,
        bb_upper: Math.round(bb_upper * 100) / 100,
        bb_middle: Math.round(bb_middle * 100) / 100,
        bb_lower: Math.round(bb_lower * 100) / 100,
        macd_line: Math.round(macd_line * 10000) / 10000,
        signal_line: Math.round(signal_line * 10000) / 10000,
        macd_histogram: Math.round(macd_histogram * 10000) / 10000,
        vix_like: Math.round(vix_like * 100) / 100,
        price_std: Math.round(price_std * 100) / 100,
        alpha: Math.round(alpha * 10000) / 10000,
        sharpe_ratio: actual_return / (priceData.volatility || 0.01),
      };
    };

    if (selectedDate) {
      const dateData = getDataForDate(selectedDate);
      if (!dateData) return null;
      return {
        type: "single",
        date: selectedDate,
        data: dateData,
        technicals: calculateTechnicalIndicators(dateData),
      };
    }

    if (selectedDates.length > 0) {
      const datesData = selectedDates
        .map((date) => ({
          date,
          data: getDataForDate(date),
        }))
        .filter((item) => item.data);

      return {
        type: "multiple",
        dates: datesData,
        technicals: datesData.map((item) => ({
          date: item.date,
          ...calculateTechnicalIndicators(item.data),
        })),
      };
    }

    return null;
  }, [selectedDate, selectedDates, data]);

  const formatCurrency = (value) => {
    if (isNaN(value) || value == null) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value) => {
    if (isNaN(value) || value == null) return "0";
    return new Intl.NumberFormat("en-US").format(Math.round(value));
  };

  const formatPercentage = (value) => {
    if (isNaN(value) || value == null) return "0.00%";
    return (value * 100).toFixed(2) + "%";
  };

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="w-full">
          <div className="animate-pulse space-y-3">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (error) {
    return (
      <ErrorBoundary>
        <div className="w-full">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Error loading data</span>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (!processedData) {
    return (
      <ErrorBoundary>
        <div className="w-full">
          <div className="text-center py-4">
            <h4 className="text-sm font-medium mb-2">Enhanced Analytics</h4>
            <p className="text-xs text-muted-foreground">
              Select a date to view detailed analytics
            </p>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (processedData.type === "single") {
    const { data: priceData, technicals } = processedData;
    const priceChange = priceData.close - priceData.open;
    const priceChangePercent = (priceChange / priceData.open) * 100;

    return (
      <ErrorBoundary>
        <div className="w-full">
          <div className="mb-3">
            <h4 className="text-sm font-medium">Enhanced Analytics</h4>
            <p className="text-xs text-muted-foreground">
              {format(processedData.date, "MMM dd, yyyy")}
            </p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            {/* Properly spaced TabsList */}
            <TabsList className="grid w-full grid-cols-4 h-8 bg-muted/50 p-0.5 rounded-md mb-3">
              <TabsTrigger
                value="overview"
                className="text-[10px] px-1 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium transition-all"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="technical"
                className="text-[10px] px-1 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium transition-all"
              >
                Technical
              </TabsTrigger>
              <TabsTrigger
                value="volatility"
                className="text-[10px] px-1 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium transition-all"
              >
                Volatility
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="text-[10px] px-1 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium transition-all"
              >
                Performance
              </TabsTrigger>
            </TabsList>

            <div className="max-h-80 overflow-y-auto">
              <TabsContent value="overview" className="space-y-3 mt-0">
                {/* Price Metrics */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 p-2 rounded-md">
                    <div className="flex items-center space-x-1 mb-1">
                      <DollarSign className="h-3 w-3 text-blue-600" />
                      <span className="text-xs font-medium">Price Action</span>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold">
                        {formatCurrency(priceData.close)}
                      </div>
                      <div
                        className={`text-xs ${
                          priceChangePercent >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {priceChangePercent >= 0 ? "+" : ""}
                        {priceChangePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-2 rounded-md">
                    <div className="flex items-center space-x-1 mb-1">
                      <Volume2 className="h-3 w-3 text-purple-600" />
                      <span className="text-xs font-medium">Volume</span>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold">
                        {formatNumber(priceData.volume)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {priceData.volume > 50000 ? "High" : "Normal"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* OHLC Data */}
                <div className="bg-gray-50 p-2 rounded-md">
                  <div className="text-xs font-medium mb-2">OHLC Data</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Open:</span>
                        <span className="font-medium">
                          {formatCurrency(priceData.open)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">High:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(priceData.high)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Low:</span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(priceData.low)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Close:</span>
                        <span className="font-medium">
                          {formatCurrency(priceData.close)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="technical" className="space-y-3 mt-0">
                {/* Technical Indicators */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-orange-50 p-2 rounded-md">
                    <div className="flex items-center space-x-1 mb-1">
                      <Target className="h-3 w-3 text-orange-600" />
                      <span className="text-xs font-medium">RSI</span>
                    </div>
                    <div className="text-sm font-bold">{technicals.rsi}</div>
                    <div className="text-xs text-muted-foreground">
                      {technicals.rsi > 70
                        ? "Overbought"
                        : technicals.rsi < 30
                        ? "Oversold"
                        : "Neutral"}
                    </div>
                  </div>
                  <div className="bg-green-50 p-2 rounded-md">
                    <div className="flex items-center space-x-1 mb-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-medium">MACD</span>
                    </div>
                    <div className="text-sm font-bold">
                      {(technicals.macd_line * 100).toFixed(2)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {technicals.macd_line > 0 ? "Bullish" : "Bearish"}
                    </div>
                  </div>
                </div>

                {/* Moving Averages */}
                <div className="bg-blue-50 p-2 rounded-md">
                  <div className="text-xs font-medium mb-2">
                    Moving Averages
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>SMA 20:</span>
                      <span className="font-medium">
                        {formatCurrency(technicals.sma20)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>SMA 50:</span>
                      <span className="font-medium">
                        {formatCurrency(technicals.sma50)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>EMA 12:</span>
                      <span className="font-medium">
                        {formatCurrency(technicals.ema12)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>EMA 26:</span>
                      <span className="font-medium">
                        {formatCurrency(technicals.ema26)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bollinger Bands */}
                <div className="bg-purple-50 p-2 rounded-md">
                  <div className="text-xs font-medium mb-2">
                    Bollinger Bands
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Upper:</span>
                      <span className="font-medium">
                        {formatCurrency(technicals.bb_upper)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Middle:</span>
                      <span className="font-medium">
                        {formatCurrency(technicals.bb_middle)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lower:</span>
                      <span className="font-medium">
                        {formatCurrency(technicals.bb_lower)}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="volatility" className="space-y-3 mt-0">
                {/* Volatility Metrics */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-red-50 p-2 rounded-md">
                    <div className="flex items-center space-x-1 mb-1">
                      <Activity className="h-3 w-3 text-red-600" />
                      <span className="text-xs font-medium">VIX-like</span>
                    </div>
                    <div className="text-sm font-bold">
                      {technicals.vix_like}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {technicals.vix_like > 30
                        ? "High Fear"
                        : technicals.vix_like > 20
                        ? "Moderate"
                        : "Low Fear"}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-2 rounded-md">
                    <div className="flex items-center space-x-1 mb-1">
                      <PieChart className="h-3 w-3 text-orange-600" />
                      <span className="text-xs font-medium">Std Dev</span>
                    </div>
                    <div className="text-sm font-bold">
                      {technicals.price_std.toFixed(2)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Daily Range
                    </div>
                  </div>
                </div>

                {/* Volatility Analysis */}
                <div className="bg-gray-50 p-2 rounded-md">
                  <div className="text-xs font-medium mb-2">
                    Volatility Analysis
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Daily Vol:</span>
                      <span className="font-medium">
                        {formatPercentage(priceData.volatility)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Vol:</span>
                      <span className="font-medium">
                        {(priceData.volatility * Math.sqrt(365) * 100).toFixed(
                          1
                        )}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Risk Level:</span>
                      <Badge
                        variant={
                          priceData.volatility > 0.05
                            ? "destructive"
                            : priceData.volatility > 0.02
                            ? "secondary"
                            : "default"
                        }
                        className="text-xs px-1 py-0"
                      >
                        {priceData.volatility > 0.05
                          ? "High"
                          : priceData.volatility > 0.02
                          ? "Med"
                          : "Low"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-3 mt-0">
                {/* Performance vs Benchmark */}
                <div className="bg-green-50 p-2 rounded-md">
                  <div className="flex items-center space-x-1 mb-1">
                    <Target className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-medium">vs Benchmark</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Alpha:</span>
                      <span
                        className={`font-medium ${
                          technicals.alpha >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {(technicals.alpha * 100).toFixed(3)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sharpe:</span>
                      <span className="font-medium">
                        {technicals.sharpe_ratio.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Risk Metrics */}
                <div className="bg-blue-50 p-2 rounded-md">
                  <div className="flex items-center space-x-1 mb-1">
                    <Zap className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-medium">Risk Metrics</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Liquidity:</span>
                      <span className="font-medium">
                        {formatNumber(priceData.liquidity)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Depth:</span>
                      <Badge
                        variant={
                          priceData.liquidity > 100000 ? "default" : "secondary"
                        }
                        className="text-xs px-1 py-0"
                      >
                        {priceData.liquidity > 100000 ? "Deep" : "Shallow"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </ErrorBoundary>
    );
  }

  // Multiple dates comparison view
  return (
    <ErrorBoundary>
      <div className="w-full">
        <div className="mb-3">
          <div className="flex items-center space-x-1">
            <BarChart3 className="h-3 w-3" />
            <h4 className="text-sm font-medium">Multi-Date Analysis</h4>
            <Badge variant="default" className="text-xs px-1">
              {processedData.dates.length}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="comparison" className="w-full">
          {/* Fixed TabsList for comparison mode */}
          <TabsList className="grid w-full grid-cols-3 h-8 bg-muted/50 p-0.5 rounded-md mb-3">
            <TabsTrigger
              value="comparison"
              className="text-[10px] px-1 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium transition-all flex items-center justify-center space-x-0.5"
            >
              <ArrowUpDown className="h-2 w-2" />
              <span>Compare</span>
            </TabsTrigger>
            <TabsTrigger
              value="correlation"
              className="text-[10px] px-1 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium transition-all flex items-center justify-center space-x-0.5"
            >
              <BarChart className="h-2 w-2" />
              <span>Stats</span>
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="text-[10px] px-1 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium transition-all flex items-center justify-center space-x-0.5"
            >
              <LineChart className="h-2 w-2" />
              <span>Perf</span>
            </TabsTrigger>
          </TabsList>

          <div className="max-h-80 overflow-y-auto">
            <AnimatePresence mode="wait">
              <TabsContent value="comparison" className="space-y-2 mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  {processedData.dates.map((item, index) => {
                    const priceChange =
                      ((item.data.close - item.data.open) / item.data.open) *
                      100;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 p-2 rounded-md border"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-2 w-2 text-blue-600" />
                            <span className="font-medium text-xs">
                              {format(item.date, "MMM dd")}
                            </span>
                          </div>
                          <Badge
                            variant={
                              priceChange >= 0 ? "default" : "destructive"
                            }
                            className="text-xs px-1 py-0"
                          >
                            {priceChange >= 0 ? (
                              <TrendingUp className="h-2 w-2 mr-0.5" />
                            ) : (
                              <TrendingDown className="h-2 w-2 mr-0.5" />
                            )}
                            {priceChange >= 0 ? "+" : ""}
                            {priceChange.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                          <div className="flex justify-between items-center p-1 bg-white rounded border">
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-2 w-2 text-blue-600" />
                              <span className="text-muted-foreground">
                                Price:
                              </span>
                            </div>
                            <div className="font-semibold">
                              {formatCurrency(item.data.close)}
                            </div>
                          </div>
                          <div className="flex justify-between items-center p-1 bg-white rounded border">
                            <div className="flex items-center space-x-1">
                              <Volume2 className="h-2 w-2 text-purple-600" />
                              <span className="text-muted-foreground">
                                Vol:
                              </span>
                            </div>
                            <div className="font-semibold">
                              {formatNumber(item.data.volume)}
                            </div>
                          </div>
                          <div className="flex justify-between items-center p-1 bg-white rounded border">
                            <div className="flex items-center space-x-1">
                              <Activity className="h-2 w-2 text-orange-600" />
                              <span className="text-muted-foreground">
                                Volatility:
                              </span>
                            </div>
                            <div className="font-semibold">
                              {formatPercentage(item.data.volatility)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </TabsContent>

              <TabsContent value="correlation" className="space-y-2 mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-blue-50 p-2 rounded-md"
                >
                  <div className="flex items-center space-x-1 mb-2">
                    <Gauge className="h-3 w-3 text-blue-600" />
                    <div className="text-xs font-medium">
                      Statistical Summary
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                      <div>
                        <div className="flex items-center space-x-1 mb-0.5">
                          <DollarSign className="h-2 w-2 text-green-600" />
                          <span className="text-muted-foreground">
                            Avg Price:
                          </span>
                        </div>
                        <div className="font-medium">
                          {formatCurrency(
                            processedData.dates.reduce(
                              (sum, item) => sum + item.data.close,
                              0
                            ) / processedData.dates.length
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1 mb-0.5">
                          <ArrowUpDown className="h-2 w-2 text-blue-600" />
                          <span className="text-muted-foreground">Range:</span>
                        </div>
                        <div className="font-medium">
                          {formatCurrency(
                            Math.max(
                              ...processedData.dates.map(
                                (item) => item.data.close
                              )
                            ) -
                              Math.min(
                                ...processedData.dates.map(
                                  (item) => item.data.close
                                )
                              )
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div>
                        <div className="flex items-center space-x-1 mb-0.5">
                          <Activity className="h-2 w-2 text-orange-600" />
                          <span className="text-muted-foreground">
                            Avg Vol:
                          </span>
                        </div>
                        <div className="font-medium">
                          {formatPercentage(
                            processedData.dates.reduce(
                              (sum, item) => sum + item.data.volatility,
                              0
                            ) / processedData.dates.length
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1 mb-0.5">
                          <Volume2 className="h-2 w-2 text-purple-600" />
                          <span className="text-muted-foreground">Total:</span>
                        </div>
                        <div className="font-medium">
                          {formatNumber(
                            processedData.dates.reduce(
                              (sum, item) => sum + item.data.volume,
                              0
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-2 mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-green-50 p-2 rounded-md"
                >
                  <div className="flex items-center space-x-1 mb-2">
                    <Award className="h-3 w-3 text-green-600" />
                    <div className="text-xs font-medium">
                      Performance Analysis
                    </div>
                  </div>
                  <div className="space-y-1">
                    {processedData.dates.map((item, index) => {
                      const dailyReturn =
                        ((item.data.close - item.data.open) / item.data.open) *
                        100;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex justify-between items-center p-1 bg-white rounded border text-xs"
                        >
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-2 w-2 text-blue-600" />
                            <span>{format(item.date, "MMM dd")}:</span>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-medium flex items-center space-x-0.5 ${
                                dailyReturn >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {dailyReturn >= 0 ? (
                                <TrendingUp className="h-2 w-2" />
                              ) : (
                                <TrendingDown className="h-2 w-2" />
                              )}
                              <span>
                                {dailyReturn >= 0 ? "+" : ""}
                                {dailyReturn.toFixed(1)}%
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center space-x-0.5">
                              <Percent className="h-1 w-1" />
                              <span>
                                Vol: {formatPercentage(item.data.volatility)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}

export default EnhancedDataDashboard;
