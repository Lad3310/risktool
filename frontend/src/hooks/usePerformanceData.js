import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export function usePerformanceData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [assetAllocation, setAssetAllocation] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  async function fetchPerformanceData() {
    try {
      setLoading(true);

      // Fetch performance metrics
      const { data: performanceMetrics, error: performanceError } = await supabase
        .from('performance_metrics')
        .select('*')
        .order('month', { ascending: true })
        .limit(6);

      if (performanceError) throw performanceError;

      // Fetch asset allocation
      const { data: allocationData, error: allocationError } = await supabase
        .from('asset_allocation')
        .select('*')
        .order('percentage', { ascending: false });

      if (allocationError) throw allocationError;

      // Fetch recent alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (alertsError) throw alertsError;

      // Transform the data to match the expected format
      const formattedPerformance = performanceMetrics.map(metric => ({
        month: new Date(metric.month).toLocaleString('default', { month: 'short' }),
        portfolioValue: metric.portfolio_value,
        var: metric.var_value
      }));

      const formattedAllocation = allocationData.map(item => ({
        name: item.asset_class,
        value: item.percentage,
        color: item.color_code
      }));

      const formattedAlerts = alertsData.map(alert => ({
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        color: getSeverityColor(alert.severity).bgColor,
        textColor: getSeverityColor(alert.severity).textColor
      }));

      setPerformanceData(formattedPerformance);
      setAssetAllocation(formattedAllocation);
      setAlerts(formattedAlerts);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    performanceData,
    assetAllocation,
    alerts,
    loading,
    error
  };
}

function getSeverityColor(severity) {
  switch (severity.toLowerCase()) {
    case 'high':
      return { bgColor: '#fee2e2', textColor: '#991b1b' };
    case 'medium':
      return { bgColor: '#fef9c3', textColor: '#854d0e' };
    case 'low':
      return { bgColor: '#dbeafe', textColor: '#1e40af' };
    default:
      return { bgColor: '#f3f4f6', textColor: '#374151' };
  }
} 