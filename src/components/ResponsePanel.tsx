import React from 'react';
import type { ResponseData, ErrorData } from '../types';
import { AlertCircle } from 'lucide-react';

interface ResponsePanelProps {
  response: ResponseData | null;
  error: ErrorData | null;
}

export function ResponsePanel({ response, error }: ResponsePanelProps) {
  if (error) {
    return (
      <div className="bg-secondary-light border border-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-start space-x-3 text-primary">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <h3 className="font-semibold">{error.message}</h3>
            {error.details && (
              <p className="text-sm text-primary/80 mt-1">{error.details}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="bg-secondary-light border border-gray-800 rounded-lg shadow-lg p-6 text-center text-gray-400">
        Send a request to see the response
      </div>
    );
  }

  const statusColor = response.status < 300 ? 'text-green-500' : 
                     response.status < 400 ? 'text-yellow-500' : 'text-primary';

  return (
    <div className="bg-secondary-light border border-gray-800 rounded-lg shadow-lg p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className={`text-2xl font-bold ${statusColor}`}>
            {response.status}
          </span>
          <span className="text-gray-400">
            {response.time}ms
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">Response Headers</h3>
        <div className="bg-secondary p-4 rounded-md">
          {Object.entries(response.headers).map(([key, value]) => (
            <div key={key} className="flex space-x-4 text-sm">
              <span className="font-medium text-gray-400">{key}:</span>
              <span className="text-gray-300">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">Response Body</h3>
        <pre className="bg-secondary p-4 rounded-md overflow-auto max-h-96 text-sm text-gray-300">
          {JSON.stringify(response.body, null, 2)}
        </pre>
      </div>
    </div>
  );
}