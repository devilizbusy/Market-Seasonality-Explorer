"use client";

import { useState, useCallback } from "react";
import { Button } from "./ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/Select";
import { Download, FileText, ImageIcon, Table, Loader2 } from "lucide-react";
import { format } from "date-fns";
import ErrorBoundary from "./ErrorBoundary";

export function ExportControls({
  data,
  selectedDate,
  selectedDates,
  timeFrame,
  symbol,
}) {
  const [exportFormat, setExportFormat] = useState("csv");
  const [isExporting, setIsExporting] = useState(false);

  const getExportData = useCallback(() => {
    try {
      if (selectedDates && selectedDates.length > 0) {
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
      return data;
    } catch (error) {
      console.error("Error getting export data:", error);
      return [];
    }
  }, [data, selectedDate, selectedDates]);

  const exportToCSV = useCallback(
    (data) => {
      try {
        const headers = [
          "Date",
          "Open",
          "High",
          "Low",
          "Close",
          "Volume",
          "Volatility",
          "Liquidity",
        ];
        const csvContent = [
          headers.join(","),
          ...data.map((item) =>
            [
              format(new Date(item.timestamp), "yyyy-MM-dd"),
              item.open,
              item.high,
              item.low,
              item.close,
              item.volume,
              item.volatility,
              item.liquidity,
            ].join(",")
          ),
        ].join("\n");

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `market-data-${symbol}-${format(
          new Date(),
          "yyyy-MM-dd"
        )}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("CSV export failed:", error);
      }
    },
    [symbol]
  );

  const exportToJSON = useCallback(
    (data) => {
      try {
        const exportData = {
          metadata: {
            symbol,
            timeFrame,
            exportDate: new Date().toISOString(),
            dataPoints: data.length,
            selectedDate: selectedDate ? selectedDate.toISOString() : null,
            selectedDates: selectedDates
              ? selectedDates.map((d) => d.toISOString())
              : [],
          },
          data: data,
        };

        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], {
          type: "application/json;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `market-data-${symbol}-${format(
          new Date(),
          "yyyy-MM-dd"
        )}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("JSON export failed:", error);
      }
    },
    [symbol, timeFrame, selectedDate, selectedDates]
  );

  const exportToPNG = useCallback(async () => {
    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = await import("html2canvas");
      // Find the calendar container
      const calendarElement = document.querySelector(
        "[data-calendar-container]"
      );
      if (!calendarElement) {
        throw new Error("Calendar element not found");
      }

      // Create canvas from the calendar element
      const canvas = await html2canvas.default(calendarElement, {
        backgroundColor: "#ffffff",
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: calendarElement.scrollWidth,
        height: calendarElement.scrollHeight,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error("Failed to create image blob");
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `market-calendar-${symbol}-${format(
          new Date(),
          "yyyy-MM-dd"
        )}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (error) {
      console.error("PNG export failed:", error);
      // Fallback: create a simple canvas with data summary
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 800;
      canvas.height = 600;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add title
      ctx.fillStyle = "black";
      ctx.font = "bold 24px Arial";
      ctx.fillText("Market Seasonality Calendar", 20, 40);

      // Add metadata
      ctx.font = "16px Arial";
      ctx.fillText(`Symbol: ${symbol}`, 20, 80);
      ctx.fillText(
        `Export Date: ${format(new Date(), "yyyy-MM-dd HH:mm")}`,
        20,
        110
      );
      ctx.fillText(`Data Points: ${getExportData().length}`, 20, 140);

      // Add data summary
      const exportData = getExportData();
      if (exportData.length > 0) {
        ctx.fillText("Recent Data:", 20, 180);
        exportData.slice(0, 10).forEach((item, index) => {
          const y = 210 + index * 25;
          ctx.fillText(
            `${format(
              new Date(item.timestamp),
              "MMM dd"
            )}: $${item.close.toLocaleString()}`,
            40,
            y
          );
        });
      }

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `market-calendar-${symbol}-${format(
          new Date(),
          "yyyy-MM-dd"
        )}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }
  }, [symbol, getExportData]);

  const exportToPDF = useCallback(async () => {
    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = await import("jspdf");
      const html2canvas = await import("html2canvas");
      const pdf = new jsPDF.jsPDF("p", "mm", "a4");
      const exportData = getExportData();

      // Add title
      pdf.setFontSize(20);
      pdf.text("Market Seasonality Calendar Report", 20, 20);

      // Add metadata
      pdf.setFontSize(12);
      pdf.text(`Symbol: ${symbol}`, 20, 35);
      pdf.text(`Time Frame: ${timeFrame}`, 20, 45);
      pdf.text(`Generated: ${format(new Date(), "yyyy-MM-dd HH:mm")}`, 20, 55);
      pdf.text(`Data Points: ${exportData.length}`, 20, 65);

      if (selectedDate) {
        pdf.text(
          `Selected Date: ${format(selectedDate, "MMM dd, yyyy")}`,
          20,
          75
        );
      }

      if (selectedDates && selectedDates.length > 0) {
        pdf.text(
          `Selected Dates: ${selectedDates
            .map((d) => format(d, "MMM dd"))
            .join(", ")}`,
          20,
          75
        );
      }

      // Add summary statistics
      if (exportData.length > 0) {
        const avgPrice =
          exportData.reduce((sum, d) => sum + d.close, 0) / exportData.length;
        const totalVolume = exportData.reduce((sum, d) => sum + d.volume, 0);
        const avgVolatility =
          exportData.reduce((sum, d) => sum + d.volatility, 0) /
          exportData.length;

        pdf.text("Summary Statistics:", 20, 90);
        pdf.text(`Average Price: $${avgPrice.toLocaleString()}`, 30, 100);
        pdf.text(`Total Volume: ${totalVolume.toLocaleString()}`, 30, 110);
        pdf.text(
          `Average Volatility: ${(avgVolatility * 100).toFixed(2)}%`,
          30,
          120
        );
      }

      // Try to capture calendar as image
      try {
        const calendarElement = document.querySelector(
          "[data-calendar-container]"
        );
        if (calendarElement) {
          const canvas = await html2canvas.default(calendarElement, {
            backgroundColor: "#ffffff",
            scale: 1,
            useCORS: true,
            allowTaint: true,
            logging: false,
          });

          const imgData = canvas.toDataURL("image/png");
          const imgWidth = 170; // A4 width minus margins
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Add image to PDF
          pdf.addImage(
            imgData,
            "PNG",
            20,
            140,
            imgWidth,
            Math.min(imgHeight, 150)
          );
        }
      } catch (imageError) {
        console.warn("Could not capture calendar image:", imageError);
      }

      // Add data table on new page if there's data
      if (exportData.length > 0) {
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.text("Data Details", 20, 20);
        pdf.setFontSize(10);

        let y = 40;
        const lineHeight = 6;

        // Table headers
        pdf.text("Date", 20, y);
        pdf.text("Open", 50, y);
        pdf.text("High", 70, y);
        pdf.text("Low", 90, y);
        pdf.text("Close", 110, y);
        pdf.text("Volume", 130, y);
        pdf.text("Volatility", 160, y);
        y += lineHeight;

        // Table data
        exportData.slice(0, 35).forEach((item) => {
          // Limit to fit on page
          pdf.text(format(new Date(item.timestamp), "MM/dd"), 20, y);
          pdf.text(item.open.toFixed(2), 50, y);
          pdf.text(item.high.toFixed(2), 70, y);
          pdf.text(item.low.toFixed(2), 90, y);
          pdf.text(item.close.toFixed(2), 110, y);
          pdf.text(item.volume.toLocaleString(), 130, y);
          pdf.text((item.volatility * 100).toFixed(2) + "%", 160, y);
          y += lineHeight;

          if (y > 280) {
            // Start new page if needed
            pdf.addPage();
            y = 20;
          }
        });
      }

      // Save the PDF
      pdf.save(
        `market-report-${symbol}-${format(new Date(), "yyyy-MM-dd")}.pdf`
      );
    } catch (error) {
      console.error("PDF export failed:", error);
      // Fallback to text export
      const exportData = getExportData();
      const content = [
        "Market Seasonality Calendar Report",
        `Generated: ${format(new Date(), "yyyy-MM-dd HH:mm")}`,
        `Symbol: ${symbol}`,
        `Time Frame: ${timeFrame}`,
        `Data Points: ${exportData.length}`,
        "",
        "Summary:",
        `Average Price: $${(
          exportData.reduce((sum, d) => sum + d.close, 0) / exportData.length
        ).toLocaleString()}`,
        `Total Volume: ${exportData
          .reduce((sum, d) => sum + d.volume, 0)
          .toLocaleString()}`,
        `Average Volatility: ${(
          (exportData.reduce((sum, d) => sum + d.volatility, 0) /
            exportData.length) *
          100
        ).toFixed(2)}%`,
        "",
        "Data:",
        ...exportData.map(
          (item) =>
            `${format(
              new Date(item.timestamp),
              "yyyy-MM-dd"
            )}: $${item.close.toLocaleString()} (Vol: ${(
              item.volatility * 100
            ).toFixed(2)}%)`
        ),
      ].join("\n");

      const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `market-report-${symbol}-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [symbol, timeFrame, selectedDate, selectedDates, getExportData]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    const exportData = getExportData();

    try {
      switch (exportFormat) {
        case "csv":
          exportToCSV(exportData);
          break;
        case "json":
          exportToJSON(exportData);
          break;
        case "png":
          await exportToPNG();
          break;
        case "pdf":
          await exportToPDF();
          break;
        default:
          throw new Error("Unknown export format");
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  }, [
    exportFormat,
    getExportData,
    exportToCSV,
    exportToJSON,
    exportToPNG,
    exportToPDF,
  ]);

  const getFormatIcon = useCallback((format) => {
    switch (format) {
      case "csv":
        return <Table className="h-3 w-3" />;
      case "json":
        return <FileText className="h-3 w-3" />;
      case "png":
        return <ImageIcon className="h-3 w-3" />;
      case "pdf":
        return <FileText className="h-3 w-3" />;
      default:
        return <Download className="h-3 w-3" />;
    }
  }, []);

  return (
    <ErrorBoundary>
      <div className="space-y-3">
        <h3 className="text-xs font-medium flex items-center space-x-2">
          <Download className="h-3 w-3" />
          <span>Export Data</span>
        </h3>

        <div className="flex flex-col gap-2">
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center space-x-2">
                  <Table className="h-3 w-3" />
                  <span>CSV</span>
                </div>
              </SelectItem>
              <SelectItem value="json">
                <div className="flex items-center space-x-2">
                  <FileText className="h-3 w-3" />
                  <span>JSON</span>
                </div>
              </SelectItem>
              <SelectItem value="png">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="h-3 w-3" />
                  <span>PNG Image</span>
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="flex items-center space-x-2">
                  <FileText className="h-3 w-3" />
                  <span>PDF Report</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleExport}
            disabled={isExporting || data.length === 0}
            className="flex items-center space-x-2 h-8 text-xs"
          >
            {isExporting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              getFormatIcon(exportFormat)
            )}
            <span>{isExporting ? "Exporting..." : "Export"}</span>
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          {selectedDate && (
            <p>Selected: {format(selectedDate, "MMM dd, yyyy")}</p>
          )}
          {selectedDates && selectedDates.length > 0 && (
            <p>
              Range: {selectedDates.map((d) => format(d, "MMM dd")).join(", ")}
            </p>
          )}
          <p>Data points: {getExportData().length}</p>
        </div>
      </div>
    </ErrorBoundary>
  );
}
