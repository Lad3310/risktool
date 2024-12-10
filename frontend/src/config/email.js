export const emailConfig = {
  sender: {
    name: 'Risk Monitoring',
    email: 'noreply@risktool-one.com',
  },
  templates: {
    confirmSignup: {
      subject: 'Confirm your Risk Monitoring account',
    },
    resetPassword: {
      subject: 'Reset your password',
    },
    welcomeEmail: {
      subject: 'Welcome to Settlement Risk Monitoring',
    },
  },
};

export const riskLimits = {
  positionLimits: {
    equity: {
      singlePosition: 1000000,  // $1M max position in single equity
      totalExposure: 10000000   // $10M total equity exposure
    },
    fixedIncome: {
      singlePosition: 2000000,  // $2M max position in single bond
      totalExposure: 20000000   // $20M total fixed income exposure
    }
  },
  
  counterpartyLimits: {
    maxExposure: 5000000,       // $5M max exposure per counterparty
    settlementLimit: 10000000   // $10M max settlement exposure
  },
  
  tradingControls: {
    maxOrderSize: 100000,       // Max single order size
    duplicateOrderTimeWindow: 60 // Seconds to check for duplicates
  }
};

export const riskEndpoints = {
  positionMonitor: '/api/risk/positions',
  counterpartyExposure: '/api/risk/counterparty',
  settlementRisk: '/api/risk/settlement',
  marginRequirements: '/api/risk/margin'
};

export const dashboardConfig = {
  refreshInterval: 5000, // 5 second refresh for non-websocket fallback
  
  riskMetrics: {
    positions: {
      enabled: true,
      warningThreshold: 0.8,  // 80% of limit
      criticalThreshold: 0.95 // 95% of limit
    },
    exposure: {
      enabled: true,
      warningThreshold: 0.7,
      criticalThreshold: 0.9
    },
    margin: {
      enabled: true,
      warningThreshold: 0.75,
      criticalThreshold: 0.9
    }
  },

  websocket: {
    endpoint: '/ws/risk-monitor',
    reconnectInterval: 3000,
    topics: {
      positions: 'POSITION_UPDATES',
      limits: 'LIMIT_BREACHES',
      margins: 'MARGIN_CALLS'
    }
  }
}; 