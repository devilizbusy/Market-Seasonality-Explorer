"use client";
import { Button } from "../ui/Button";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { FadeIn } from "../animations/FadeIn";

export function CalendarHeader({
  currentDate,
  timeFrame,
  onPrevious,
  onNext,
  onToday,
  currentWeekIndex = 0,
  totalWeeks = 52,
  canGoPrevious = true,
  canGoNext = true,
}) {
  const getTitle = () => {
    switch (timeFrame) {
      case "daily":
        return format(currentDate, "MMMM yyyy");
      case "weekly":
        return `${format(currentDate, "yyyy")} - Week ${
          currentWeekIndex + 1
        } of ${totalWeeks}`;
      case "monthly":
        return `${format(currentDate, "yyyy")} - Monthly View`;
      default:
        return format(currentDate, "MMMM yyyy");
    }
  };

  const getTodayLabel = () => {
    switch (timeFrame) {
      case "daily":
        return "Today";
      case "weekly":
        return "This Week";
      case "monthly":
        return "This Year";
      default:
        return "Today";
    }
  };

  return (
    <FadeIn className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{getTitle()}</h3>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="h-8 w-8 p-0 bg-transparent"
          title="Previous period (Left arrow)"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          onClick={onToday}
          title={`Go to ${getTodayLabel()} (Home key)`}
          className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 px-3 py-1.5 min-w-[90px] h-8"
        >
          <CalendarIcon className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">{getTodayLabel()}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!canGoNext}
          className="h-8 w-8 p-0 bg-transparent"
          title="Next period (Right arrow)"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </FadeIn>
  );
}
