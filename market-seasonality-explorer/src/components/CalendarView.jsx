"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  format,
  addMonths,
  subMonths,
  isSameDay,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
} from "date-fns";
import CalendarTooltip from "./CalendarTooltip";
import { DailyView } from "./calendar/views/DailyView";
import { WeeklyView } from "./calendar/views/WeeklyView";
import { MonthlyView } from "./calendar/views/MonthlyView";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "../hooks/useMediaQuery";
import ErrorBoundary from "./ErrorBoundary";

export function CalendarView({
  data,
  timeFrame,
  filters,
  selectedDate,
  selectedDates = [],
  onDateSelect,
  onDatesSelect,
  loading,
  zoomLevel = "normal",
  isComparisonMode = false,
  currentTheme, // ENSURE this prop is received
  interactionMode = "hover",
  showTooltips = true,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);
  const [focusedDate, setFocusedDate] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [showMobileTooltip, setShowMobileTooltip] = useState(false);
  const [mobileTooltipData, setMobileTooltipData] = useState(null);

  // Use refs to prevent infinite re-renders
  const dataRef = useRef(data);
  const timeFrameRef = useRef(timeFrame);
  const selectedDateRef = useRef(selectedDate);
  const selectedDatesRef = useRef(selectedDates);

  // Debug log to check theme
  useEffect(() => {
    console.log("CalendarView received theme:", currentTheme?.name);
  }, [currentTheme]);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    try {
      const currentTimeFrame = timeFrameRef.current;
      if (currentTimeFrame === "daily") {
        setCurrentDate((prev) => subMonths(prev, 1));
      } else if (currentTimeFrame === "weekly") {
        setCurrentDate(
          (prev) =>
            new Date(prev.getFullYear() - 1, prev.getMonth(), prev.getDate())
        );
      } else if (currentTimeFrame === "monthly") {
        setCurrentDate(
          (prev) =>
            new Date(prev.getFullYear() - 1, prev.getMonth(), prev.getDate())
        );
      }
    } catch (error) {
      console.error("Error in handlePrevious:", error);
    }
  }, []);

  const handleNext = useCallback(() => {
    try {
      const currentTimeFrame = timeFrameRef.current;
      if (currentTimeFrame === "daily") {
        setCurrentDate((prev) => addMonths(prev, 1));
      } else if (currentTimeFrame === "weekly") {
        setCurrentDate(
          (prev) =>
            new Date(prev.getFullYear() + 1, prev.getMonth(), prev.getDate())
        );
      } else if (currentTimeFrame === "monthly") {
        setCurrentDate(
          (prev) =>
            new Date(prev.getFullYear() + 1, prev.getMonth(), prev.getDate())
        );
      }
    } catch (error) {
      console.error("Error in handleNext:", error);
    }
  }, []);

  const handleToday = useCallback(() => {
    try {
      const today = new Date();
      setCurrentDate(today);
      setFocusedDate(today);
      onDateSelect(today);
    } catch (error) {
      console.error("Error in handleToday:", error);
    }
  }, [onDateSelect]);

  // Update refs when props change
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    timeFrameRef.current = timeFrame;
  }, [timeFrame]);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  useEffect(() => {
    selectedDatesRef.current = selectedDates;
  }, [selectedDates]);

  // Enhanced responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const isSmallMobile = useMediaQuery("(max-width: 480px)");
  const isLandscape = useMediaQuery("(orientation: landscape)");
  const isTouchDevice = useMediaQuery("(hover: none) and (pointer: coarse)");

  // Stable date selection checker using refs
  const isDateSelected = useCallback((date) => {
    try {
      const currentSelectedDate = selectedDateRef.current;
      const currentSelectedDates = selectedDatesRef.current;
      if (currentSelectedDate && isSameDay(date, currentSelectedDate))
        return true;
      return currentSelectedDates.some((selectedDate) =>
        isSameDay(date, selectedDate)
      );
    } catch (error) {
      console.error("Error in isDateSelected:", error);
      return false;
    }
  }, []);

  // Check if date is focused
  const isDateFocused = useCallback(
    (date) => {
      return focusedDate && isSameDay(date, focusedDate);
    },
    [focusedDate]
  );

  // Enhanced keyboard navigation for cell-by-cell movement
  useEffect(() => {
    const handleKeyDown = (event) => {
      try {
        // Only handle keyboard events when calendar is focused or no input is focused
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement &&
          (activeElement.tagName === "INPUT" ||
            activeElement.tagName === "TEXTAREA" ||
            activeElement.contentEditable === "true");

        if (isInputFocused) return;

        const currentTimeFrame = timeFrameRef.current;
        const currentFocusedDate =
          focusedDate || selectedDateRef.current || new Date();

        switch (event.key) {
          case "ArrowLeft":
            event.preventDefault();
            if (currentTimeFrame === "daily") {
              setFocusedDate(subDays(currentFocusedDate, 1));
            } else if (currentTimeFrame === "weekly") {
              setFocusedDate(subWeeks(currentFocusedDate, 1));
            } else if (currentTimeFrame === "monthly") {
              const newDate = new Date(currentFocusedDate);
              newDate.setMonth(newDate.getMonth() - 1);
              setFocusedDate(newDate);
            }
            break;

          case "ArrowRight":
            event.preventDefault();
            if (currentTimeFrame === "daily") {
              setFocusedDate(addDays(currentFocusedDate, 1));
            } else if (currentTimeFrame === "weekly") {
              setFocusedDate(addWeeks(currentFocusedDate, 1));
            } else if (currentTimeFrame === "monthly") {
              const newDate = new Date(currentFocusedDate);
              newDate.setMonth(newDate.getMonth() + 1);
              setFocusedDate(newDate);
            }
            break;

          case "ArrowUp":
            event.preventDefault();
            if (currentTimeFrame === "daily") {
              setFocusedDate(subDays(currentFocusedDate, 7));
            } else if (currentTimeFrame === "weekly") {
              // Move up in the grid (depends on grid layout)
              const weeksPerRow = isMobile ? 3 : isTablet ? 6 : 10;
              setFocusedDate(subWeeks(currentFocusedDate, weeksPerRow));
            } else if (currentTimeFrame === "monthly") {
              // Move up in the grid (4 months per row typically)
              const monthsPerRow = 4;
              const newDate = new Date(currentFocusedDate);
              newDate.setMonth(newDate.getMonth() - monthsPerRow);
              setFocusedDate(newDate);
            }
            break;

          case "ArrowDown":
            event.preventDefault();
            if (currentTimeFrame === "daily") {
              setFocusedDate(addDays(currentFocusedDate, 7));
            } else if (currentTimeFrame === "weekly") {
              // Move down in the grid
              const weeksPerRow = isMobile ? 3 : isTablet ? 6 : 10;
              setFocusedDate(addWeeks(currentFocusedDate, weeksPerRow));
            } else if (currentTimeFrame === "monthly") {
              // Move down in the grid
              const monthsPerRow = 4;
              const newDate = new Date(currentFocusedDate);
              newDate.setMonth(newDate.getMonth() + monthsPerRow);
              setFocusedDate(newDate);
            }
            break;

          case "Home":
            event.preventDefault();
            handleToday();
            break;

          case "Escape":
            event.preventDefault();
            setFocusedDate(null);
            onDateSelect(null);
            onDatesSelect([]);
            break;

          case "Enter":
          case " ":
            event.preventDefault();
            if (currentFocusedDate) {
              handleCellClick(currentFocusedDate);
            }
            break;

          case "Tab":
            // Allow normal tab behavior but update focus
            if (!event.shiftKey && currentFocusedDate) {
              if (currentTimeFrame === "daily") {
                setFocusedDate(addDays(currentFocusedDate, 1));
              } else if (currentTimeFrame === "weekly") {
                setFocusedDate(addWeeks(currentFocusedDate, 1));
              } else if (currentTimeFrame === "monthly") {
                const newDate = new Date(currentFocusedDate);
                newDate.setMonth(newDate.getMonth() + 1);
                setFocusedDate(newDate);
              }
            }
            break;
        }
      } catch (error) {
        console.error("Error in keyboard navigation:", error);
      }
    };

    // Add event listener to document
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    handleToday,
    onDateSelect,
    onDatesSelect,
    focusedDate,
    isMobile,
    isTablet,
  ]);

  // Enhanced touch gesture handling with better mobile support
  const touchHandlers = useMemo(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let longPressTimer = null;

    return {
      onTouchStart: (e) => {
        try {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchStartTime = Date.now();
          // Set up long press detection for additional features
          longPressTimer = setTimeout(() => {
            // Haptic feedback for long press
            if ("vibrate" in navigator) {
              navigator.vibrate([50, 50, 50]);
            }
          }, 500);
        } catch (error) {
          console.error("Error in onTouchStart:", error);
        }
      },
      onTouchMove: (e) => {
        try {
          // Clear long press if user moves finger
          if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
          }
          // Prevent default scrolling for horizontal swipes
          const currentX = e.touches[0].clientX;
          const currentY = e.touches[0].clientY;
          const deltaX = Math.abs(currentX - touchStartX);
          const deltaY = Math.abs(currentY - touchStartY);
          // Only prevent scroll for clear horizontal gestures
          if (deltaX > deltaY && deltaX > 15) {
            e.preventDefault();
          }
        } catch (error) {
          console.error("Error in onTouchMove:", error);
        }
      },
      onTouchEnd: (e) => {
        try {
          // Clear long press timer
          if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
          }
          const touchEndX = e.changedTouches[0].clientX;
          const touchEndY = e.changedTouches[0].clientY;
          const touchEndTime = Date.now();
          const deltaX = touchEndX - touchStartX;
          const deltaY = touchEndY - touchStartY;
          const deltaTime = touchEndTime - touchStartTime;

          // Only process quick swipes (less than 400ms for better mobile experience)
          if (deltaTime > 400) return;

          const absDeltaX = Math.abs(deltaX);
          const absDeltaY = Math.abs(deltaY);

          // Horizontal swipes with lower threshold for mobile
          if (absDeltaX > absDeltaY && absDeltaX > 30) {
            // Haptic feedback for navigation
            if ("vibrate" in navigator) {
              navigator.vibrate(25);
            }
            if (deltaX > 0) {
              handlePrevious();
            } else {
              handleNext();
            }
          }
        } catch (error) {
          console.error("Error in onTouchEnd:", error);
        }
      },
    };
  }, [handlePrevious, handleNext]);

  // Stable data getter using refs
  const getDataForDate = useCallback((date) => {
    try {
      const currentData = dataRef.current;
      if (!currentData || currentData.length === 0) return null;

      const targetDateStr = format(date, "yyyy-MM-dd");
      const matchingData = currentData.find((item) => {
        if (!item || !item.timestamp) return false;
        try {
          const itemDate = new Date(item.timestamp);
          const itemDateStr = format(itemDate, "yyyy-MM-dd");
          return itemDateStr === targetDateStr;
        } catch (error) {
          return false;
        }
      });

      return matchingData || null;
    } catch (error) {
      console.error("Error in getDataForDate:", error);
      return null;
    }
  }, []);

  // Enhanced cell click handler with better mobile support
  const handleCellClick = useCallback(
    (date) => {
      try {
        const currentSelectedDate = selectedDateRef.current;
        const currentSelectedDates = selectedDatesRef.current;

        // Set focus to clicked cell
        setFocusedDate(date);

        // Enhanced mobile interaction
        if (isMobile || isTouchDevice) {
          const cellData = getDataForDate(date);
          // Show tooltip on first tap if data exists and not selected
          if (!isDateSelected(date) && cellData && showTooltips) {
            setMobileTooltipData({
              date,
              data: cellData,
            });
            setShowMobileTooltip(true);
            // Auto-hide mobile tooltip after 4 seconds
            setTimeout(() => {
              setShowMobileTooltip(false);
            }, 4000);
          }
          // Haptic feedback for mobile interactions
          if ("vibrate" in navigator) {
            navigator.vibrate(50);
          }
        }

        // Selection logic
        const isAlreadySelected = isDateSelected(date);
        if (isAlreadySelected) {
          if (currentSelectedDates.length > 0) {
            const newSelectedDates = currentSelectedDates.filter(
              (d) => !isSameDay(d, date)
            );
            onDatesSelect(newSelectedDates);
            if (newSelectedDates.length === 1) {
              onDateSelect(newSelectedDates[0]);
              onDatesSelect([]);
            } else if (newSelectedDates.length === 0) {
              onDateSelect(null);
            }
          } else if (
            currentSelectedDate &&
            isSameDay(currentSelectedDate, date)
          ) {
            onDateSelect(null);
          }
          return;
        }

        if (currentSelectedDate || currentSelectedDates.length > 0) {
          let newSelectedDates = [];
          if (currentSelectedDate) {
            newSelectedDates = [currentSelectedDate, date];
          } else {
            newSelectedDates = [...currentSelectedDates, date];
          }
          newSelectedDates.sort((a, b) => a.getTime() - b.getTime());
          onDateSelect(null);
          onDatesSelect(newSelectedDates);
          if (newSelectedDates.length >= 2) {
            const comparisonEvent = new CustomEvent("forceComparisonTab", {
              detail: { dates: newSelectedDates },
            });
            window.dispatchEvent(comparisonEvent);
          }
          return;
        }

        onDateSelect(date);
        if (currentSelectedDates.length > 0) {
          onDatesSelect([]);
        }
      } catch (error) {
        console.error("Error in handleCellClick:", error);
      }
    },
    [
      onDateSelect,
      onDatesSelect,
      isMobile,
      isTouchDevice,
      getDataForDate,
      isDateSelected,
      showTooltips,
    ]
  );

  // Stable hover handlers
  const handleCellHover = useCallback(
    (date, event) => {
      try {
        // Skip hover on touch devices or if tooltips disabled
        if (
          isMobile ||
          isTouchDevice ||
          !showTooltips ||
          interactionMode !== "hover"
        )
          return;
        setHoveredDate(date);
        const cellData = getDataForDate(date);
        setTooltipData({
          date,
          data: cellData,
          position: { x: event.clientX, y: event.clientY },
        });
      } catch (error) {
        console.error("Error in handleCellHover:", error);
      }
    },
    [getDataForDate, isMobile, isTouchDevice, showTooltips, interactionMode]
  );

  const handleCellLeave = useCallback(() => {
    try {
      if (!isMobile && !isTouchDevice) {
        setHoveredDate(null);
        setTooltipData(null);
      }
    } catch (error) {
      console.error("Error in handleCellLeave:", error);
    }
  }, [isMobile, isTouchDevice]);

  // Handle cell focus
  const handleCellFocus = useCallback((date) => {
    setFocusedDate(date);
  }, []);

  // Handle cell key down
  const handleCellKeyDown = useCallback(
    (date, event) => {
      // Let the main keyboard handler deal with navigation
      // This is just for cell-specific actions
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleCellClick(date);
      }
    },
    [handleCellClick]
  );

  // Memoized common props - ENSURE currentTheme is included
  const commonProps = useMemo(
    () => ({
      data,
      timeFrame,
      filters,
      selectedDate,
      selectedDates,
      hoveredDate,
      focusedDate,
      onCellClick: handleCellClick,
      onCellHover: handleCellHover,
      onCellLeave: handleCellLeave,
      onCellFocus: handleCellFocus,
      onCellKeyDown: handleCellKeyDown,
      loading: false,
      zoomLevel,
      isComparisonMode,
      getDataForDate,
      isDateSelected,
      isDateFocused,
      currentDate,
      handlePrevious,
      handleNext,
      handleToday,
      isMobile,
      isTablet,
      isSmallMobile,
      isLandscape,
      currentTheme, // CRITICAL: Include currentTheme in commonProps
      interactionMode,
      showTooltips,
    }),
    [
      data,
      timeFrame,
      filters,
      selectedDate,
      selectedDates,
      hoveredDate,
      focusedDate,
      handleCellClick,
      handleCellHover,
      handleCellLeave,
      handleCellFocus,
      handleCellKeyDown,
      zoomLevel,
      isComparisonMode,
      getDataForDate,
      isDateSelected,
      isDateFocused,
      currentDate,
      handlePrevious,
      handleNext,
      handleToday,
      isMobile,
      isTablet,
      isSmallMobile,
      isLandscape,
      currentTheme, // CRITICAL: Include in dependency array
      interactionMode,
      showTooltips,
    ]
  );

  return (
    <ErrorBoundary>
      <div
        className="relative select-none"
        tabIndex={0}
        {...touchHandlers}
        onLoadCapture={() => {
          try {
            const todayEl = document.querySelector('[data-today="true"]');
            if (todayEl && todayEl.scrollIntoView) {
              todayEl.scrollIntoView({ block: "center", inline: "nearest" });
            }
          } catch {}
        }}
      >
        {/* Enhanced Instructions with keyboard navigation info */}
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-xs sm:text-sm text-blue-800 space-y-2">
            {/* Theme indicator */}
            {currentTheme && currentTheme.name !== "Default" && (
              <div className="flex items-center space-x-2 text-xs bg-blue-100 px-2 py-1 rounded-full w-fit">
                <currentTheme.icon className="h-3 w-3" />
                <span>Theme: {currentTheme.name}</span>
                <span className="text-blue-600">
                  ({timeFrame === "daily" ? "Daily" : "Aggregated"} Colors)
                </span>
              </div>
            )}

            {/* Interaction mode indicator */}
            <div className="flex items-center space-x-2 text-xs bg-green-100 px-2 py-1 rounded-full w-fit">
              <span>Mode: {interactionMode}</span>
              <span className="text-green-600">
                Tooltips: {showTooltips ? "On" : "Off"}
              </span>
            </div>

            {!selectedDate && selectedDates.length === 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0">
                <div className="flex items-center space-x-1">
                  <span className="text-base">📱</span>
                  <strong className="text-sm sm:text-base">
                    {isMobile ? "Tap" : "Click"} on a date
                  </strong>
                  <span className="text-xs sm:text-sm">
                    to view its metrics
                  </span>
                </div>
                {(isMobile || isTouchDevice) && (
                  <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full mt-2 sm:mt-0 sm:ml-4">
                    👆 Swipe ←→ to navigate • Tap for details
                  </div>
                )}
              </div>
            )}

            {selectedDate && selectedDates.length === 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0">
                <div className="flex items-center space-x-1">
                  <span className="text-base">🔄</span>
                  <strong className="text-sm">
                    {isMobile ? "Tap" : "Click"} another date
                  </strong>
                  <span className="text-xs">
                    to compare with {format(selectedDate, "MMM dd")}
                  </span>
                </div>
              </div>
            )}

            {selectedDates.length === 1 && (
              <div className="space-y-1">
                <div className="flex items-center space-x-1">
                  <span className="text-base">✅</span>
                  <strong className="text-sm">Selected:</strong>
                  <span className="text-xs">
                    {format(selectedDates[0], "MMM dd, yyyy")}
                  </span>
                </div>
                <div className="text-xs text-blue-600">
                  {isMobile ? "Tap" : "Click"} more dates to compare
                </div>
              </div>
            )}

            {selectedDates.length >= 2 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-1">
                  <span className="text-base">✅</span>
                  <strong className="text-sm">
                    Comparing {selectedDates.length} dates
                  </strong>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedDates.map((d, i) => (
                    <span
                      key={i}
                      className="text-xs bg-blue-100 px-2 py-1 rounded-full"
                    >
                      {format(d, "MMM dd")}
                    </span>
                  ))}
                </div>
                {!isMobile && (
                  <div className="text-xs text-blue-600">
                    {isMobile ? "Tap" : "Click"} more dates to add or selected
                    dates to remove
                  </div>
                )}
              </div>
            )}

            {/* Enhanced keyboard shortcuts info */}
            {!isMobile && !isTouchDevice && (
              <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full mt-2">
                ⌨️ <strong>Keyboard:</strong> ←→↑↓ Navigate cells • Enter/Space:
                Select • Home: Today • Esc: Clear • Tab: Next cell
              </div>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${timeFrame}-${isMobile ? "mobile" : "desktop"}-${
              currentTheme?.name || "default"
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ErrorBoundary>
              {timeFrame === "daily" && (
                <DailyView
                  currentDate={currentDate}
                  setCurrentDate={setCurrentDate}
                  {...commonProps}
                />
              )}
              {timeFrame === "weekly" && <WeeklyView {...commonProps} />}
              {timeFrame === "monthly" && <MonthlyView {...commonProps} />}
            </ErrorBoundary>
          </motion.div>
        </AnimatePresence>

        {/* Desktop Tooltip */}
        <AnimatePresence>
          {tooltipData && !isMobile && !isTouchDevice && showTooltips && (
            <ErrorBoundary>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <CalendarTooltip
                  date={tooltipData.date}
                  data={tooltipData.data}
                  position={tooltipData.position}
                  timeFrame={timeFrame}
                />
              </motion.div>
            </ErrorBoundary>
          )}
        </AnimatePresence>

        {/* Enhanced Mobile Tooltip Modal */}
        <AnimatePresence>
          {showMobileTooltip &&
            mobileTooltipData &&
            (isMobile || isTouchDevice) &&
            showTooltips && (
              <ErrorBoundary>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                  onClick={() => setShowMobileTooltip(false)}
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="bg-white rounded-lg p-4 max-w-sm w-full shadow-xl max-h-[80vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <CalendarTooltip
                      date={mobileTooltipData.date}
                      data={mobileTooltipData.data}
                      position={{ x: 0, y: 0 }}
                      timeFrame={timeFrame}
                      isMobile={true}
                    />
                    <div className="mt-4 flex justify-center space-x-2">
                      <button
                        onClick={() => {
                          setShowMobileTooltip(false);
                          handleCellClick(mobileTooltipData.date);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Select Date
                      </button>
                      <button
                        onClick={() => setShowMobileTooltip(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              </ErrorBoundary>
            )}
        </AnimatePresence>

        {/* Mobile Navigation Indicator */}
        {(isMobile || isTouchDevice) && (
          <div className="mt-3 text-center">
            <div className="inline-flex items-center space-x-2 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              <span>👈</span>
              <span>Swipe to navigate</span>
              <span>👉</span>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
