"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs";
import { useMarketData } from "../hooks/use-market-data";
import { FilterControls } from "./FilterControls";
import { ExportControls } from "./ExportControls";
import { ThemeControls, COLOR_SCHEMES } from "./ThemeControls";
import { ZoomControls } from "./ZoomControls";
import { CalendarView } from "./CalendarView";
import { EnhancedDataDashboard } from "./EnhancedDataDashboard";
import { AlertSystem } from "./AlertSystem";
import { LiveChart } from "./LiveChart";
import { OrderBook } from "./OrderBook";
import { PatternDetector } from "./patterns/PatternDetector";
import ErrorBoundary from "./ErrorBoundary";
import { FadeIn, SlideIn } from "./animations/FadeIn";

// Import new advanced features
import { IntradayVolatilityRanges } from "./advanced/IntradayVolatilityRanges";
import { AdvancedLiquidityMetrics } from "./advanced/AdvancedLiquidityMetrics";
import { WeeklyPatterns } from "./advanced/WeeklyPatterns";
import { SeasonalTrendAnalysis } from "./advanced/SeasonalTrendAnalysis";
import { MonthlyLiquidityPatterns } from "./advanced/MonthlyLiquidityPatterns";
import { SeasonalCorrelationAnalysis } from "./advanced/SeasonalCorrelationAnalysis";

export function MarketDashboard() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeFrame, setTimeFrame] = useState("daily");
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState("single");
  const [currentTheme, setCurrentTheme] = useState(COLOR_SCHEMES.default);
  const [filters, setFilters] = useState({
    symbol: "BTCUSDT",
    showVolatility: true,
    showLiquidity: true,
    showPerformance: true,
  });
  const [zoomLevel, setZoomLevel] = useState("normal");
  const [isComparisonMode, setIsComparisonMode] = useState(false);

  const { data, loading, error, refetch } = useMarketData(
    filters.symbol,
    timeFrame
  );

  // FIXED: Safe refetch interval with proper cleanup
  useEffect(() => {
    if (!loading && !error) {
      const interval = setInterval(() => {
        try {
          refetch();
        } catch (err) {
          console.warn("Refetch failed:", err);
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [refetch, loading, error]);

  // Clear selections when switching time frames
  useEffect(() => {
    setSelectedDate(null);
    setSelectedDates([]);
    setIsComparisonMode(false);
    setActiveAnalyticsTab("single");
  }, [timeFrame]);

  // FIXED: Handle filter changes with useCallback
  const handleFiltersChange = useCallback((newFilters) => {
    console.log("🔧 Filters changing:", newFilters);
    setFilters(newFilters);
  }, []);

  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date);
    setSelectedDates([]);
    setIsComparisonMode(false);
    setActiveAnalyticsTab("single");
  }, []);

  const handleDatesSelect = useCallback((dates) => {
    setSelectedDates(dates);
    setSelectedDate(null);
    setIsComparisonMode(dates.length >= 2);
    if (dates.length >= 2) {
      setActiveAnalyticsTab("comparison");
    } else if (dates.length === 1) {
      setActiveAnalyticsTab("single");
    }
  }, []);

  // FIXED: Proper theme change handler without infinite loops
  const handleThemeChange = useCallback(
    (theme) => {
      console.log(
        "🎨 Theme changing from",
        currentTheme.name,
        "to",
        theme.name
      );
      setCurrentTheme(theme);
    },
    [currentTheme.name]
  );

  // FIXED: Zoom change handler with useCallback
  const handleZoomChange = useCallback((newZoomLevel) => {
    console.log("🔍 Zoom changing to:", newZoomLevel);
    setZoomLevel(newZoomLevel);
  }, []);

  // Get selected data for pattern detection - memoized for performance
  const getSelectedData = useMemo(() => {
    if (selectedDates.length > 0) {
      return data.filter((item) => {
        const itemDate = new Date(item.timestamp);
        return selectedDates.some((selectedDate) => {
          return itemDate.toDateString() === selectedDate.toDateString();
        });
      });
    }
    if (selectedDate) {
      return data.filter((item) => {
        const itemDate = new Date(item.timestamp);
        return itemDate.toDateString() === selectedDate.toDateString();
      });
    }
    return [];
  }, [data, selectedDate, selectedDates]);

  return (
    <ErrorBoundary>
      <div
        className="min-h-screen bg-background p-2 sm:p-4"
        data-calendar-container
      >
        <div className="mx-auto max-w-7xl space-y-3 sm:space-y-4">
          {/* Header */}
          <ErrorBoundary>
            <FadeIn className="text-center space-y-2">
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                🚀 Advanced Market Seasonality Explorer
              </h1>
              <p className="text-muted-foreground text-sm sm:text-lg px-4">
                Interactive calendar with enhanced analytics, export
                functionality, and custom themes
              </p>
            </FadeIn>
          </ErrorBoundary>

          {/* COMPACT Controls Layout */}
          <div className="space-y-2">
            {/* Row 1: Main Controls - More Compact */}
            <ErrorBoundary>
              <SlideIn direction="left">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
                  {/* Filters - Takes more space */}
                  <Card className="lg:col-span-6 p-2 sm:p-3">
                    <FilterControls
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                      loading={loading}
                    />
                  </Card>

                  {/* Export - Compact */}
                  <Card className="lg:col-span-3 p-2 sm:p-3">
                    <ExportControls
                      data={data}
                      selectedDate={selectedDate}
                      selectedDates={selectedDates}
                      timeFrame={timeFrame}
                      symbol={filters.symbol}
                    />
                  </Card>

                  {/* Theme - Compact */}
                  <Card className="lg:col-span-3 p-2 sm:p-3">
                    <ThemeControls onThemeChange={handleThemeChange} />
                  </Card>
                </div>
              </SlideIn>
            </ErrorBoundary>

            {/* Row 2: Zoom Controls - Single Row */}
            <ErrorBoundary>
              <SlideIn direction="right" delay={0.1}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
                  {/* Zoom Controls - Full width */}
                  <Card className="lg:col-span-12 p-2 sm:p-3">
                    <ZoomControls
                      zoomLevel={zoomLevel}
                      onZoomChange={handleZoomChange}
                    />
                  </Card>
                </div>
              </SlideIn>
            </ErrorBoundary>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
            {/* Calendar Section */}
            <div className="xl:col-span-3 xl:sticky xl:top-4 self-start">
              <ErrorBoundary>
                <SlideIn direction="up">
                  <Card className="p-2 sm:p-4 lg:p-6 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                        <Tabs
                          value={timeFrame}
                          onValueChange={(value) => setTimeFrame(value)}
                          className="w-full sm:w-auto"
                        >
                          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg h-10 sm:h-auto">
                            <TabsTrigger
                              value="daily"
                              className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-xs sm:text-sm px-2"
                            >
                              📅 <span className="hidden xs:inline">Daily</span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="weekly"
                              className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-xs sm:text-sm px-2"
                            >
                              📊 <span className="hidden xs:inline">Weekly</span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="monthly"
                              className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-xs sm:text-sm px-2"
                            >
                              📈 <span className="hidden xs:inline">Monthly</span>
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      <Tabs
                        value={timeFrame}
                        onValueChange={(value) => setTimeFrame(value)}
                      >
                        <TabsContent value="daily" className="mt-6">
                          <CalendarView
                            data={data}
                            timeFrame={timeFrame}
                            filters={filters}
                            selectedDate={selectedDate}
                            selectedDates={selectedDates}
                            onDateSelect={handleDateSelect}
                            onDatesSelect={handleDatesSelect}
                            loading={loading}
                            zoomLevel={zoomLevel}
                            isComparisonMode={isComparisonMode}
                            currentTheme={currentTheme}
                          />
                        </TabsContent>
                        <TabsContent value="weekly" className="mt-6">
                          <CalendarView
                            data={data}
                            timeFrame="weekly"
                            filters={filters}
                            selectedDate={selectedDate}
                            selectedDates={selectedDates}
                            onDateSelect={handleDateSelect}
                            onDatesSelect={handleDatesSelect}
                            loading={loading}
                            zoomLevel={zoomLevel}
                            isComparisonMode={isComparisonMode}
                            currentTheme={currentTheme}
                          />
                        </TabsContent>
                        <TabsContent value="monthly" className="mt-6">
                          <CalendarView
                            data={data}
                            timeFrame="monthly"
                            filters={filters}
                            selectedDate={selectedDate}
                            selectedDates={selectedDates}
                            onDateSelect={handleDateSelect}
                            onDatesSelect={handleDatesSelect}
                            loading={loading}
                            zoomLevel={zoomLevel}
                            isComparisonMode={isComparisonMode}
                            currentTheme={currentTheme}
                          />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </Card>
                </SlideIn>
              </ErrorBoundary>
            </div>

            {/* Right Panel */}
            <ErrorBoundary>
              <SlideIn
                direction="right"
                className="lg:col-span-1 xl:col-span-1 space-y-4"
              >
                {/* Enhanced Data Dashboard */}
                <Card className="h-fit">
                  <div className="p-3 sm:p-4">
                    <Tabs
                      value={activeAnalyticsTab}
                      onValueChange={setActiveAnalyticsTab}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          Analytics Dashboard
                        </h3>
                        <TabsList className="grid grid-cols-2 w-auto">
                          <TabsTrigger value="single" className="text-xs px-3">
                            Single
                          </TabsTrigger>
                          <TabsTrigger
                            value="comparison"
                            className="text-xs px-3"
                            disabled={selectedDates.length < 2}
                          >
                            Compare ({selectedDates.length})
                          </TabsTrigger>
                        </TabsList>
                      </div>
                      <TabsContent value="single" className="mt-0">
                        <EnhancedDataDashboard
                          data={data}
                          selectedDate={
                            selectedDate ||
                            (selectedDates.length === 1
                              ? selectedDates[0]
                              : null)
                          }
                          selectedDates={[]}
                          timeFrame={timeFrame}
                          symbol={filters.symbol}
                          loading={loading}
                          error={error}
                          isComparisonMode={false}
                        />
                      </TabsContent>
                      <TabsContent value="comparison" className="mt-0">
                        <EnhancedDataDashboard
                          data={data}
                          selectedDate={null}
                          selectedDates={selectedDates}
                          timeFrame={timeFrame}
                          symbol={filters.symbol}
                          loading={loading}
                          error={error}
                          isComparisonMode={true}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </Card>

                {/* Advanced Features Section */}
                <div className="space-y-4">
                  {/* Daily View Advanced Features */}
                  {timeFrame === "daily" && (
                    <>
                      <ErrorBoundary>
                        <IntradayVolatilityRanges
                          data={data}
                          selectedDate={selectedDate}
                          timeFrame={timeFrame}
                        />
                      </ErrorBoundary>
                      <ErrorBoundary>
                        <AdvancedLiquidityMetrics
                          data={data}
                          selectedDate={selectedDate}
                          timeFrame={timeFrame}
                        />
                      </ErrorBoundary>
                    </>
                  )}

                  {/* Weekly View Advanced Features */}
                  {timeFrame === "weekly" && (
                    <>
                      <ErrorBoundary>
                        <WeeklyPatterns
                          data={data}
                          selectedDate={selectedDate}
                          timeFrame={timeFrame}
                        />
                      </ErrorBoundary>
                      <ErrorBoundary>
                        <SeasonalTrendAnalysis
                          data={data}
                          timeFrame={timeFrame}
                        />
                      </ErrorBoundary>
                    </>
                  )}

                  {/* Monthly View Advanced Features */}
                  {timeFrame === "monthly" && (
                    <>
                      <ErrorBoundary>
                        <MonthlyLiquidityPatterns
                          data={data}
                          timeFrame={timeFrame}
                        />
                      </ErrorBoundary>
                      <ErrorBoundary>
                        <SeasonalCorrelationAnalysis
                          data={data}
                          timeFrame={timeFrame}
                        />
                      </ErrorBoundary>
                    </>
                  )}
                </div>

                {/* Pattern Detection & Live Chart */}
                <div className="grid grid-cols-1 xl:grid-cols-1 gap-4">
                  <ErrorBoundary>
                    <PatternDetector
                      data={data}
                      selectedData={getSelectedData}
                    />
                  </ErrorBoundary>
                  <ErrorBoundary>
                    <LiveChart
                      data={data}
                      symbol={filters.symbol}
                      selectedDate={selectedDate}
                      selectedDates={selectedDates}
                    />
                  </ErrorBoundary>
                </div>

                {/* Order Book and Alerts */}
                <div className="grid grid-cols-1 xl:grid-cols-1 gap-4">
                  <ErrorBoundary>
                    <OrderBook symbol={filters.symbol} />
                  </ErrorBoundary>
                  <ErrorBoundary>
                    <AlertSystem data={data} symbol={filters.symbol} />
                  </ErrorBoundary>
                </div>
              </SlideIn>
            </ErrorBoundary>
          </div>

          {/* Footer */}
          <ErrorBoundary>
            <FadeIn delay={0.5}>
              <Card className="p-3 sm:p-4 bg-gray-50 border-gray-200">
                <div className="text-center space-y-2">
                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                    ⌨️ Keyboard Shortcuts
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs sm:text-sm text-gray-600">
                    <div className="flex flex-col items-center">
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">
                        ←→
                      </kbd>
                      <span className="mt-1">Navigate</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">
                        ↑↓
                      </kbd>
                      <span className="mt-1">Weeks</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">
                        Home
                      </kbd>
                      <span className="mt-1">Today</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">
                        Esc
                      </kbd>
                      <span className="mt-1">Clear</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">
                        Enter
                      </kbd>
                      <span className="mt-1">Select</span>
                    </div>
                  </div>
                </div>
              </Card>
            </FadeIn>
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
}
