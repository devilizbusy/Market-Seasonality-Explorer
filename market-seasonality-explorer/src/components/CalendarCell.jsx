"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import ErrorBoundary from "./ErrorBoundary";

const ZOOM_LEVELS = [
  { value: "small", scale: 0.8, label: "Small" },
  { value: "normal", scale: 1.0, label: "Normal" },
  { value: "large", scale: 1.2, label: "Large" },
  { value: "xlarge", scale: 1.4, label: "X-Large" },
];

export function CalendarCell({
  date,
  data,
  timeFrame,
  filters,
  isSelected = false,
  isInRange = false,
  isCurrentMonth = true,
  isToday = false,
  isHovered = false,
  isFocused = false,
  onClick,
  onHover,
  onLeave,
  onFocus,
  onKeyDown,
  loading = false,
  zoomLevel = "normal",
  disabled = false,
  className = "",
  tabIndex = -1,
  currentTheme,
}) {
  const [isLocalHovered, setIsLocalHovered] = useState(false);
  const cellRef = useRef(null);

  // Debug theme
  useEffect(() => {
    if (currentTheme) {
      console.log(
        "📱 CalendarCell received theme:",
        currentTheme.name,
        "for date:",
        format(date, "MMM dd")
      );
    }
  }, [currentTheme, date]);

  const zoomConfig =
    ZOOM_LEVELS.find((level) => level.value === zoomLevel) || ZOOM_LEVELS[1];

  // Focus management
  useEffect(() => {
    if (isFocused && cellRef.current) {
      cellRef.current.focus();
    }
  }, [isFocused]);

  const handleClick = (e) => {
    e.preventDefault();
    if (!disabled && onClick) {
      onClick(date);
    }
  };

  const handleMouseEnter = (e) => {
    if (!disabled) {
      setIsLocalHovered(true);
      if (onHover) onHover(date, e);
    }
  };

  const handleMouseLeave = () => {
    setIsLocalHovered(false);
    if (onLeave) onLeave();
  };

  const handleFocus = (e) => {
    if (!disabled && onFocus) {
      onFocus(date, e);
    }
  };

  const handleKeyDown = (e) => {
    if (!disabled && onKeyDown) {
      onKeyDown(date, e);
    }
  };

  // Format currency for display
  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return "$0";
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${Math.round(value)}`;
  };

  // Format volume for display
  const formatVolume = (value) => {
    if (!value || isNaN(value)) return "0";
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return Math.round(value).toString();
  };

  // FIXED: Get theme-based cell styling with proper fallback
  const getCellStyling = () => {
    const isHovering = isLocalHovered || isHovered;

    // Base styling for disabled state
    if (disabled) {
      return "bg-gray-100 border-gray-300 text-gray-400 opacity-50 cursor-not-allowed";
    }

    // Selected state (highest priority)
    if (isSelected) {
      return "bg-blue-500 hover:bg-blue-600 text-white border-blue-600 shadow-lg ring-2 ring-blue-300";
    }

    // Focus state styling
    if (isFocused) {
      return "bg-blue-100 border-blue-500 text-blue-900 ring-2 ring-blue-500";
    }

    // No data - neutral gray
    if (!data) {
      return `bg-gray-50 border-gray-200 text-gray-700 ${
        isHovering ? "hover:bg-gray-100 shadow-md" : ""
      }`;
    }

    // CRITICAL FIX: Ensure we have a valid theme with fallback
    const theme = currentTheme || {
      name: "Fallback",
      volatility: {
        low: "bg-green-200 border-green-400 text-green-800",
        medium: "bg-yellow-200 border-yellow-400 text-yellow-800",
        high: "bg-orange-200 border-orange-400 text-orange-800",
        veryHigh: "bg-red-200 border-red-400 text-red-800",
      },
    };

    console.log(
      "🎨 CalendarCell applying theme:",
      theme.name,
      "for",
      format(date, "MMM dd")
    );

    // DATA VISUALIZATION LAYERS IMPLEMENTATION

    // 1. VOLATILITY HEATMAP (Primary layer) - FIXED
    if (filters?.showVolatility) {
      const volatility = (data.volatility || 0) * 100;
      let volatilityLevel = "low";

      // Volatility thresholds
      if (volatility > 8) volatilityLevel = "veryHigh";
      else if (volatility > 5) volatilityLevel = "high";
      else if (volatility > 2) volatilityLevel = "medium";
      else volatilityLevel = "low";

      // FIXED: Use correct color scheme based on time frame
      const colorScheme =
        timeFrame === "weekly" || timeFrame === "monthly"
          ? theme.volatilityAggregated || theme.volatility
          : theme.volatility;

      const themeColors = colorScheme[volatilityLevel];
      if (themeColors) {
        const result = `${themeColors} ${
          isHovering ? "hover:opacity-90 shadow-md transform scale-105" : ""
        } transition-all duration-200`;
        console.log("🎨 Applied volatility colors:", result);
        return result;
      }
    }

    // 2. PERFORMANCE METRICS (Secondary layer) - FIXED
    if (filters?.showPerformance && data.close && data.open) {
      const performance = ((data.close - data.open) / data.open) * 100;

      // Use theme-specific performance colors if available
      if (theme.name === "High Contrast") {
        if (performance > 0) {
          return `bg-white border-black border-2 text-black ${
            isHovering ? "hover:bg-gray-100 shadow-md transform scale-105" : ""
          }`;
        } else if (performance < 0) {
          return `bg-black border-white border-2 text-white ${
            isHovering ? "hover:bg-gray-800 shadow-md transform scale-105" : ""
          }`;
        } else {
          return `bg-gray-500 border-black border-2 text-white ${
            isHovering ? "hover:bg-gray-400 shadow-md transform scale-105" : ""
          }`;
        }
      } else {
        // Default performance colors
        if (performance > 5) {
          return `bg-emerald-200 border-emerald-400 text-emerald-800 ${
            isHovering
              ? "hover:bg-emerald-300 shadow-md transform scale-105"
              : ""
          }`;
        } else if (performance > 0) {
          return `bg-green-100 border-green-300 text-green-700 ${
            isHovering ? "hover:bg-green-200 shadow-md transform scale-105" : ""
          }`;
        } else if (performance < -5) {
          return `bg-red-200 border-red-400 text-red-800 ${
            isHovering ? "hover:bg-red-300 shadow-md transform scale-105" : ""
          }`;
        } else if (performance < 0) {
          return `bg-red-100 border-red-300 text-red-700 ${
            isHovering ? "hover:bg-red-200 shadow-md transform scale-105" : ""
          }`;
        } else {
          return `bg-gray-100 border-gray-300 text-gray-700 ${
            isHovering ? "hover:bg-gray-200 shadow-md transform scale-105" : ""
          }`;
        }
      }
    }

    // Default styling when no specific visualization is active
    return `bg-white border-gray-200 text-gray-900 ${
      isHovering ? "hover:bg-gray-50 shadow-md transform scale-105" : ""
    }`;
  };

  // Get performance indicator icon and color
  const getPerformanceIndicator = () => {
    if (!data?.close || !data?.open) return null;

    const performance = ((data.close - data.open) / data.open) * 100;

    if (performance > 0.5) {
      return <TrendingUp className="h-3 w-3 text-green-600" />;
    } else if (performance < -0.5) {
      return <TrendingDown className="h-3 w-3 text-red-600" />;
    } else {
      return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  // Get liquidity indicator pattern
  const getLiquidityPattern = () => {
    if (!filters?.showLiquidity || !data?.volume) return null;

    const volumeLevel = data.volume / 100000; // Normalize volume
    const patternIntensity = Math.min(100, Math.max(10, volumeLevel * 100));

    return (
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div
          className="w-full h-1 bg-blue-400 rounded-full"
          style={{ width: `${patternIntensity}%` }}
        />
      </div>
    );
  };

  const cellStyles = getCellStyling();

  const zoomClasses = {
    small: "text-xs p-1 min-h-[50px] max-w-[80px]",
    normal: "text-sm p-2 min-h-[70px] max-w-[100px]",
    large: "text-base p-2 min-h-[85px] max-w-[115px]",
    xlarge: "text-base p-3 min-h-[95px] max-w-[125px]", // Added max-width constraints
  };

  return (
    <ErrorBoundary>
      <motion.div
        ref={cellRef}
        className={`
          relative border rounded-lg transition-all duration-200 cursor-pointer overflow-hidden
          ${zoomClasses[zoomLevel] || zoomClasses.normal}
          ${isToday ? "ring-1 ring-orange-400" : ""}
          ${!isCurrentMonth ? "opacity-40" : ""}
          focus:outline-none
          ${cellStyles}
          ${className}
        `}
        data-today={isToday ? "true" : undefined}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : tabIndex}
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
        style={{
          transformOrigin: "center",
          // Remove the problematic scale transform that was causing layout issues
        }}
      >
        {/* Liquidity Pattern Overlay */}
        {getLiquidityPattern()}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-1 relative z-10">
            {/* Date */}
            <div className="font-semibold">
              {timeFrame === "daily" && format(date, "d")}
              {timeFrame === "weekly" && `W${format(date, "w")}`}
              {timeFrame === "monthly" && format(date, "MMM")}
            </div>

            {/* Additional date info for weekly/monthly */}
            {timeFrame === "weekly" && (
              <div className="text-xs opacity-75">{format(date, "MMM d")}</div>
            )}
            {timeFrame === "monthly" && (
              <div className="text-xs opacity-75">{format(date, "yyyy")}</div>
            )}

            {/* Data indicators */}
            {data && (
              <div className="flex flex-col items-center space-y-1 w-full">
                {/* Performance Indicator */}
                {filters?.showPerformance && (
                  <div className="flex items-center space-x-1">
                    {getPerformanceIndicator()}
                    {(zoomLevel === "normal" ||
                      zoomLevel === "large" ||
                      zoomLevel === "xlarge") &&
                      data.close &&
                      data.open && (
                        <div
                          className={`font-medium ${
                            zoomLevel === "xlarge" ? "text-sm" : "text-xs"
                          }`}
                        >
                          {((data.close - data.open) / data.open) * 100 > 0
                            ? "+"
                            : ""}
                          {(
                            ((data.close - data.open) / data.open) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                      )}
                  </div>
                )}

                {/* Price */}
                {(zoomLevel === "normal" ||
                  zoomLevel === "large" ||
                  zoomLevel === "xlarge") && (
                  <div
                    className={`font-medium ${
                      zoomLevel === "xlarge" ? "text-sm" : "text-xs"
                    }`}
                  >
                    {formatCurrency(data.close)}
                  </div>
                )}

                {/* Volatility Level Indicator */}
                {filters?.showVolatility && (
                  <div
                    className={`opacity-75 ${
                      zoomLevel === "xlarge" ? "text-xs" : "text-[10px]"
                    }`}
                  >
                    Vol: {((data.volatility || 0) * 100).toFixed(1)}%
                  </div>
                )}

                {/* Volume bar with liquidity indicators */}
                {filters?.showLiquidity &&
                  data.volume &&
                  zoomLevel !== "small" && (
                    <div className="w-full px-1">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="h-1 rounded-full transition-all duration-300 bg-blue-400"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(5, (data.volume / 1000000) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                      {(zoomLevel === "large" || zoomLevel === "xlarge") && (
                        <div
                          className={`mt-1 opacity-75 ${
                            zoomLevel === "xlarge" ? "text-xs" : "text-[10px]"
                          }`}
                        >
                          {formatVolume(data.volume)}
                        </div>
                      )}
                    </div>
                  )}
              </div>
            )}

            {/* No data indicator */}
            {!data && !loading && (
              <div className="text-xs opacity-60 text-center">No data</div>
            )}
          </div>
        )}

        {/* Today indicator */}
        {isToday && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 border-2 border-white rounded-full animate-pulse" />
        )}

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full" />
        )}

        {/* Focus indicator */}
        {isFocused && !isSelected && (
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full" />
        )}
      </motion.div>
    </ErrorBoundary>
  );
}
