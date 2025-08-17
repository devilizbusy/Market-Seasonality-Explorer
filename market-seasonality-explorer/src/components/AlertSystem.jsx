"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Badge } from "./ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/Select";
import { Switch } from "./ui/Switch";
import {
  Bell,
  BellOff,
  Plus,
  Trash2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Volume2,
  Activity,
  CheckCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

export function AlertSystem({ data, symbol }) {
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({
    type: "volatility",
    threshold: 0,
    condition: "above",
  });
  const [triggeredAlerts, setTriggeredAlerts] = useState([]);

  // Check alerts against latest data
  useEffect(() => {
    if (data.length === 0) return;

    const latestData = data[data.length - 1];
    const newTriggeredAlerts = [];

    alerts.forEach((alert) => {
      if (!alert.isActive) return;

      let currentValue = 0;
      switch (alert.type) {
        case "volatility":
          currentValue = latestData.volatility * 100;
          break;
        case "price":
          currentValue = latestData.close;
          break;
        case "volume":
          currentValue = latestData.volume;
          break;
      }

      const shouldTrigger =
        alert.condition === "above"
          ? currentValue > alert.threshold
          : currentValue < alert.threshold;

      if (shouldTrigger && !alert.triggeredAt) {
        const triggeredAlert = {
          ...alert,
          triggeredAt: new Date().toISOString(),
          currentValue,
        };
        newTriggeredAlerts.push(triggeredAlert);

        // Update the alert to mark it as triggered
        setAlerts((prev) =>
          prev.map((a) => (a.id === alert.id ? triggeredAlert : a))
        );
      }
    });

    if (newTriggeredAlerts.length > 0) {
      setTriggeredAlerts((prev) => [...prev, ...newTriggeredAlerts]);
    }
  }, [data, alerts]);

  const addAlert = () => {
    if (newAlert.threshold <= 0) return;

    const alert = {
      id: Date.now().toString(),
      type: newAlert.type,
      threshold: newAlert.threshold,
      condition: newAlert.condition,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setAlerts((prev) => [...prev, alert]);
    setNewAlert({
      type: "volatility",
      threshold: 0,
      condition: "above",
    });
  };

  const toggleAlert = (id) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id
          ? { ...alert, isActive: !alert.isActive, triggeredAt: undefined }
          : alert
      )
    );
  };

  const deleteAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    setTriggeredAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const clearTriggeredAlerts = () => {
    setTriggeredAlerts([]);
  };

  const getAlertTypeIcon = (type) => {
    switch (type) {
      case "volatility":
        return <Activity className="h-3 w-3" />;
      case "price":
        return <TrendingUp className="h-3 w-3" />;
      case "volume":
        return <Volume2 className="h-3 w-3" />;
      default:
        return <Bell className="h-3 w-3" />;
    }
  };

  const getAlertTypeLabel = (type) => {
    switch (type) {
      case "volatility":
        return "Volatility %";
      case "price":
        return "Price $";
      case "volume":
        return "Volume";
      default:
        return type;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case "volatility":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "price":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "volume":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatValue = (value, type) => {
    switch (type) {
      case "price":
        return `$${value.toLocaleString()}`;
      case "volume":
        return value.toLocaleString();
      case "volatility":
        return `${value.toFixed(2)}%`;
      default:
        return value.toString();
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center space-x-2">
            <Bell className="h-4 w-4 text-orange-600" />
            <span>Alert System</span>
          </CardTitle>
          <div className="flex items-center space-x-1">
            <Badge variant="outline" className="text-xs">
              {alerts.filter((a) => a.isActive).length} active
            </Badge>
            {triggeredAlerts.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {triggeredAlerts.length} triggered
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Triggered Alerts */}
        {triggeredAlerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Triggered Alerts
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearTriggeredAlerts}
                className="h-6 text-xs text-red-600 hover:text-red-700"
              >
                Clear
              </Button>
            </div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {triggeredAlerts.slice(-3).map((alert) => (
                <div
                  key={`${alert.id}-${alert.triggeredAt}`}
                  className="flex items-center justify-between p-2 bg-white rounded border text-xs"
                >
                  <div className="flex items-center space-x-2">
                    {getAlertTypeIcon(alert.type)}
                    <span className="font-medium">
                      {getAlertTypeLabel(alert.type)}
                    </span>
                    <span>
                      {alert.condition}{" "}
                      {formatValue(alert.threshold, alert.type)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{format(new Date(alert.triggeredAt), "HH:mm")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create New Alert */}
        <div className="bg-gray-50 p-3 rounded-lg space-y-3">
          <div className="flex items-center space-x-1">
            <Plus className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium">Create New Alert</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Select
              value={newAlert.type}
              onValueChange={(value) =>
                setNewAlert((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="volatility">
                  <div className="flex items-center space-x-1">
                    <Activity className="h-3 w-3" />
                    <span>Volatility</span>
                  </div>
                </SelectItem>
                <SelectItem value="price">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>Price</span>
                  </div>
                </SelectItem>
                <SelectItem value="volume">
                  <div className="flex items-center space-x-1">
                    <Volume2 className="h-3 w-3" />
                    <span>Volume</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={newAlert.condition}
              onValueChange={(value) =>
                setNewAlert((prev) => ({ ...prev, condition: value }))
              }
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>Above</span>
                  </div>
                </SelectItem>
                <SelectItem value="below">
                  <div className="flex items-center space-x-1">
                    <TrendingDown className="h-3 w-3" />
                    <span>Below</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-1">
            <Input
              type="number"
              placeholder={`Enter ${newAlert.type} value`}
              value={newAlert.threshold}
              onChange={(e) =>
                setNewAlert((prev) => ({
                  ...prev,
                  threshold: Number.parseFloat(e.target.value) || 0,
                }))
              }
              className="h-7 text-xs"
            />
            <Button
              onClick={addAlert}
              disabled={newAlert.threshold <= 0}
              size="sm"
              className="h-7 px-2"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Active Alerts */}
        <div>
          <div className="flex items-center space-x-1 mb-2">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span className="text-xs font-medium">
              Active Alerts ({alerts.length})
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-3">
              <Bell className="h-6 w-6 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">
                No alerts configured
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-2 bg-white border rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={alert.isActive}
                      onCheckedChange={() => toggleAlert(alert.id)}
                      className="scale-75"
                    />
                    <div className="flex items-center space-x-1">
                      {alert.isActive ? (
                        <Bell className="h-3 w-3 text-green-600" />
                      ) : (
                        <BellOff className="h-3 w-3 text-gray-400" />
                      )}
                      {getAlertTypeIcon(alert.type)}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs px-1 ${getAlertColor(alert.type)}`}
                    >
                      {getAlertTypeLabel(alert.type)}
                    </Badge>
                    <span className="text-xs">
                      {alert.condition}{" "}
                      {formatValue(alert.threshold, alert.type)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {alert.triggeredAt && (
                      <Badge variant="destructive" className="text-xs px-1">
                        Triggered
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
