import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const DEBUG = true;

export function usePerformanceData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [assetAllocation, setAssetAllocation] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Starting data fetch in usePerformanceData...');

        // Test database connection
        const { data: test, error: testError } = await supabase
          .from('performance_metrics')
          .select('count');

        console.log('Connection test result:', { test, testError });

        if (DEBUG) console.log('Starting data fetch...');

        if (testError) {
          throw new Error(`Connection test failed: ${testError.message}`);
        }

        // Fetch performance metrics
        const { data: perfData, error: perfError } = await supabase
          .from('performance_metrics')
          .select('*')
          .order('month', { ascending: true });

        if (DEBUG) console.log('Performance metrics:', { perfData, perfError });

        if (perfError) throw new Error(`Performance metrics error: ${perfError.message}`);

        // Fetch asset allocation
        const { data: allocData, error: allocError } = await supabase
          .from('asset_allocation')
          .select('*');

        if (DEBUG) console.log('Asset allocation:', { allocData, allocError });

        if (allocError) throw new Error(`Asset allocation error: ${allocError.message}`);

        // Format and set data
        const formattedPerformance = perfData?.map(metric => ({
          month: new Date(metric.month).toLocaleString('default', { month: 'short' }),
          portfolioValue: parseFloat(metric.portfolio_value),
          var: parseFloat(metric.var_value)
        })) || [];

        if (DEBUG) console.log('Formatted performance:', formattedPerformance);

        setPerformanceData(formattedPerformance);
        setAssetAllocation(allocData || []);

        // Fetch alerts (we know this works)
        const { data: alertsData, error: alertsError } = await supabase
          .from('alerts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (alertsError) throw new Error(`Alerts error: ${alertsError.message}`);

        const formattedAlerts = alertsData?.map(alert => ({
          title: alert.title,
          description: alert.description,
          severity: alert.severity,
          ...getSeverityColor(alert.severity)
        })) || [];

        setAlerts(formattedAlerts);

      } catch (err) {
        console.error('Error in usePerformanceData:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    performanceData,
    assetAllocation,
    alerts,
    loading,
    error
  };
}

// Helper function to generate mock performance data
function generateMockPerformanceData() {
  const mockData = [
    { month: 'Dec', portfolioValue: 350000, var: 280000 },
    { month: 'Jan', portfolioValue: 365000, var: 290000 },
    { month: 'Feb', portfolioValue: 358000, var: 285000 },
    { month: 'Mar', portfolioValue: 372000, var: 295000 },
    { month: 'Apr', portfolioValue: 380000, var: 298000 },
    { month: 'May', portfolioValue: 375000, var: 292000 }
  ];
  console.log('Generated mock performance data:', mockData);
  return mockData;
}

// Helper function to generate mock asset allocation
function generateMockAssetAllocation() {
  const mockData = [
    { asset_class: 'Equities', percentage: 45, color_code: '#4287f5' },
    { asset_class: 'Fixed Income', percentage: 30, color_code: '#42d4a8' },
    { asset_class: 'Commodities', percentage: 15, color_code: '#ffd700' },
    { asset_class: 'Cash', percentage: 10, color_code: '#ff964f' }
  ];
  console.log('Generated mock asset allocation:', mockData);
  return mockData;
}

// Helper function to generate mock alerts
function generateMockAlerts() {
  const mockData = [
    {
      title: 'VaR Breach',
      description: 'Portfolio VaR exceeded threshold by 15%',
      severity: 'high',
      ...getSeverityColor('high')
    },
    {
      title: 'Position Limit',
      description: 'Tech sector exposure approaching limit',
      severity: 'medium',
      ...getSeverityColor('medium')
    },
    {
      title: 'Volatility',
      description: 'Increased volatility in EUR/USD positions',
      severity: 'low',
      ...getSeverityColor('low')
    }
  ];
  console.log('Generated mock alerts:', mockData);
  return mockData;
}

// Helper function to get severity colors
function getSeverityColor(severity) {
  switch (severity.toLowerCase()) {
    case 'high':
      return { color: '#fee2e2', textColor: '#991b1b' };
    case 'medium':
      return { color: '#fef9c3', textColor: '#854d0e' };
    case 'low':
      return { color: '#dbeafe', textColor: '#1e40af' };
    default:
      return { color: '#f3f4f6', textColor: '#374151' };
  }
} 