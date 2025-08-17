"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Clock,
  ArrowUpDown,
  Activity,
} from "lucide-react";

export function OrderBook({ symbol = "BTCUSDT" }) {
  const [orderBook, setOrderBook] = useState({
    bids: [],
    asks: [],
    lastUpdate: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Simulate real-time orderbook updates
  useEffect(() => {
    const generateOrderBook = () => {
      const basePrice = 67000 + (Math.random() - 0.5) * 1000;

      const bids = Array.from({ length: 8 }, (_, i) => ({
        price: basePrice - (i + 1) * (Math.random() * 50 + 10),
        size: Math.random() * 5 + 0.1,
        total: 0,
      }));

      const asks = Array.from({ length: 8 }, (_, i) => ({
        price: basePrice + (i + 1) * (Math.random() * 50 + 10),
        size: Math.random() * 5 + 0.1,
        total: 0,
      }));

      // Calculate cumulative totals
      let bidTotal = 0;
      bids.forEach((bid) => {
        bidTotal += bid.size;
        bid.total = bidTotal;
      });

      let askTotal = 0;
      asks.forEach((ask) => {
        askTotal += ask.size;
        ask.total = askTotal;
      });

      return { bids, asks, lastUpdate: new Date() };
    };

    const updateOrderBook = () => {
      setOrderBook(generateOrderBook());
    };

    // Initial load
    updateOrderBook();
    // Update every 2 seconds
    const interval = setInterval(updateOrderBook, 2000);
    return () => clearInterval(interval);
  }, [symbol]);

  const refresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const formatPrice = (price) => `$${price.toFixed(2)}`;
  const formatSize = (size) => size.toFixed(3);
  const formatTotal = (total) => total.toFixed(3);

  const getSpreadInfo = () => {
    if (orderBook.bids.length === 0 || orderBook.asks.length === 0) return null;

    const bestBid = orderBook.bids[0]?.price || 0;
    const bestAsk = orderBook.asks[0]?.price || 0;
    const spread = bestAsk - bestBid;
    const spreadPercent = (spread / bestAsk) * 100;

    return { bestBid, bestAsk, spread, spreadPercent };
  };

  const spreadInfo = getSpreadInfo();

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4 text-blue-600" />
            <span>Order Book</span>
          </CardTitle>
          <div className="flex items-center space-x-1">
            <Badge variant="outline" className="text-xs">
              {symbol}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw
                className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {spreadInfo && (
          <div className="grid grid-cols-3 gap-1 text-xs">
            <div className="bg-green-50 p-2 rounded text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-muted-foreground">Best Bid</span>
              </div>
              <div className="font-bold text-green-600">
                {formatPrice(spreadInfo.bestBid)}
              </div>
            </div>

            <div className="bg-gray-50 p-2 rounded text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Activity className="h-3 w-3 text-gray-600" />
                <span className="text-muted-foreground">Spread</span>
              </div>
              <div className="font-bold">{formatPrice(spreadInfo.spread)}</div>
              <div className="text-muted-foreground">
                {spreadInfo.spreadPercent.toFixed(3)}%
              </div>
            </div>

            <div className="bg-red-50 p-2 rounded text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <TrendingDown className="h-3 w-3 text-red-600" />
                <span className="text-muted-foreground">Best Ask</span>
              </div>
              <div className="font-bold text-red-600">
                {formatPrice(spreadInfo.bestAsk)}
              </div>
            </div>
          </div>
        )}

        {orderBook.lastUpdate && (
          <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground mt-2">
            <Clock className="h-3 w-3" />
            <span>Updated: {orderBook.lastUpdate.toLocaleTimeString()}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Asks (Sell Orders) */}
          <div>
            <div className="flex items-center space-x-1 mb-2">
              <TrendingUp className="h-3 w-3 text-red-600" />
              <span className="text-xs font-medium text-red-600">
                Asks (Sell)
              </span>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {orderBook.asks
                .slice(0, 4)
                .reverse()
                .map((ask, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-1 text-xs hover:bg-red-50 rounded relative"
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-red-100 opacity-30 rounded"
                      style={{
                        width: `${
                          (ask.total /
                            Math.max(...orderBook.asks.map((a) => a.total))) *
                          100
                        }%`,
                      }}
                    />
                    <span className="font-mono text-red-600 relative z-10 font-medium">
                      {formatPrice(ask.price)}
                    </span>
                    <span className="font-mono relative z-10 text-muted-foreground">
                      {formatSize(ask.size)}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Spread indicator */}
          <div className="border-t border-b py-2">
            <div className="text-center text-xs text-muted-foreground">
              Spread: {spreadInfo ? formatPrice(spreadInfo.spread) : "N/A"}
            </div>
          </div>

          {/* Bids (Buy Orders) */}
          <div>
            <div className="flex items-center space-x-1 mb-2">
              <TrendingDown className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-green-600">
                Bids (Buy)
              </span>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {orderBook.bids.slice(0, 4).map((bid, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-1 text-xs hover:bg-green-50 rounded relative"
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-green-100 opacity-30 rounded"
                    style={{
                      width: `${
                        (bid.total /
                          Math.max(...orderBook.bids.map((b) => b.total))) *
                        100
                      }%`,
                    }}
                  />
                  <span className="font-mono text-green-600 relative z-10 font-medium">
                    {formatPrice(bid.price)}
                  </span>
                  <span className="font-mono relative z-10 text-muted-foreground">
                    {formatSize(bid.size)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
