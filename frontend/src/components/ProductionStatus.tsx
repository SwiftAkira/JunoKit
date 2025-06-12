'use client';

import React from 'react';

export function ProductionStatus() {
  const deploymentInfo = {
    environment: 'Production',
    region: 'eu-north-1 (Stockholm)',
    websocketUrl: 'wss://jxog5mi321.execute-api.eu-north-1.amazonaws.com/v1',
    apiUrl: 'https://nayr2j5df2.execute-api.eu-north-1.amazonaws.com/v1/',
    deployedAt: new Date().toISOString().split('T')[0], // Today's date
    status: 'Live ✅'
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg border-l-4 border-green-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
          🚀 Production Deployment Status
        </h3>
        <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
          {deploymentInfo.status}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">Environment:</span>
          <span className="ml-2 text-gray-600 dark:text-gray-400">{deploymentInfo.environment}</span>
        </div>
        
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">Region:</span>
          <span className="ml-2 text-gray-600 dark:text-gray-400">{deploymentInfo.region}</span>
        </div>
        
        <div className="md:col-span-2">
          <span className="font-medium text-gray-700 dark:text-gray-300">WebSocket API:</span>
          <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono overflow-x-auto">
            {deploymentInfo.websocketUrl}
          </div>
        </div>
        
        <div className="md:col-span-2">
          <span className="font-medium text-gray-700 dark:text-gray-300">REST API:</span>
          <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono overflow-x-auto">
            {deploymentInfo.apiUrl}
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>🔄 Phase 5 WebSocket Features:</strong> Real-time communication infrastructure is now live! 
          Test the WebSocket connection using the demo page below.
        </p>
      </div>
    </div>
  );
} 