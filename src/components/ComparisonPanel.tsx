import React from 'react';
import type { ComparisonResult } from '../types';
import { AlertCircle, Clock } from 'lucide-react';

interface ComparisonPanelProps {
  comparison: ComparisonResult;
}

export function ComparisonPanel({ comparison }: ComparisonPanelProps) {
  return (
    <div className="bg-secondary-light border border-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock size={20} className="text-primary" />
          {comparison.name}
        </h2>
        <span className="text-sm text-gray-400">
          {new Date(comparison.createdAt).toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {comparison.requests.map((result, index) => (
          <div key={index} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-secondary rounded-md text-sm font-mono text-white">
                  {result.request.method}
                </span>
                <span className="text-gray-400 text-sm truncate">
                  {result.request.url}
                </span>
              </div>
            </div>

            {result.error ? (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start space-x-3 text-primary">
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">{result.error.message}</h3>
                    {result.error.details && (
                      <p className="text-sm text-primary/80 mt-1">{result.error.details}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : result.response ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className={`text-xl font-bold ${
                    result.response.status < 300 ? 'text-green-500' : 
                    result.response.status < 400 ? 'text-yellow-500' : 'text-primary'
                  }`}>
                    {result.response.status}
                  </span>
                  <span className="text-gray-400">
                    {result.response.time}ms
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-300">Response Body</h4>
                  <pre className="bg-secondary p-4 rounded-md overflow-auto max-h-48 text-sm text-gray-300">
                    {JSON.stringify(result.response.body, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                No response data
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}