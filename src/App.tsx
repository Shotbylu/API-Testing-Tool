import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { RequestPanel } from './components/RequestPanel';
import { ResponsePanel } from './components/ResponsePanel';
import { DocumentationPanel } from './components/DocumentationPanel';
import { ComparisonPanel } from './components/ComparisonPanel';
import { Boxes, Github, Plus, X } from 'lucide-react';
import type { RequestMethod, ResponseData, SavedRequest, ErrorData, Documentation, ComparisonResult } from './types';

function App() {
  const [responses, setResponses] = useState<Map<number, { response: ResponseData | null; error: ErrorData | null }>>(new Map());
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<SavedRequest | null>(null);
  const [comparisons, setComparisons] = useState<ComparisonResult[]>([]);
  const [activeRequests, setActiveRequests] = useState<RequestMethod[]>([{
    method: 'POST',
    url: '',
    headers: {},
    body: '',
    contentType: 'application/json'
  }]);

  const handleSend = async (request: RequestMethod, index: number) => {
    try {
      setResponses(prev => new Map(prev).set(index, { response: null, error: null }));

      if (!request.url.trim()) {
        throw new Error('Please enter a URL');
      }

      const startTime = performance.now();

      let requestBody: string | FormData | URLSearchParams | undefined;

      if (request.method !== 'GET' && request.body) {
        switch (request.contentType) {
          case 'application/json':
            requestBody = request.body;
            break;
          case 'application/x-www-form-urlencoded':
            const params = new URLSearchParams();
            request.body.split('&').forEach(pair => {
              const [key, value] = pair.split('=');
              if (key && value) params.append(key, value);
            });
            requestBody = params;
            break;
          case 'multipart/form-data':
            const formData = new FormData();
            request.body.split('\n').forEach(line => {
              const [key, value] = line.split(':').map(s => s.trim());
              if (key && value) formData.append(key, value);
            });
            requestBody = formData;
            break;
          default:
            requestBody = request.body;
        }
      }

      const response = await fetch(request.url, {
        method: request.method,
        headers: request.contentType === 'multipart/form-data'
          ? request.headers
          : {
            ...request.headers,
            'Content-Type': request.contentType,
          },
        body: requestBody instanceof FormData ? requestBody :
          requestBody instanceof URLSearchParams ? requestBody.toString() :
            requestBody ? requestBody : undefined,
      });

      const endTime = performance.now();

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseBody;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }

      const responseData: ResponseData = {
        status: response.status,
        headers: responseHeaders,
        body: responseBody,
        time: Math.round(endTime - startTime),
      };

      setResponses(prev => new Map(prev).set(index, { response: responseData, error: null }));
      return responseData;
    } catch (error) {
      let errorMessage = 'Request failed';
      let errorDetails = '';

      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message === 'Failed to fetch') {
          errorDetails = 'Network error or CORS issue. Make sure the URL is correct and accessible.';
        }
      }

      const errorData = {
        message: errorMessage,
        details: errorDetails,
      };

      setResponses(prev => new Map(prev).set(index, { response: null, error: errorData }));
      return { error: errorData };
    }
  };

  const handleCompare = async () => {
    const results = await Promise.all(
      activeRequests.map(async (request, index) => {
        const result = await handleSend(request, index);
        return {
          request,
          response: 'error' in result ? null : result,
          error: 'error' in result ? result.error : null,
        };
      })
    );

    const comparison: ComparisonResult = {
      id: crypto.randomUUID(),
      requests: results,
      createdAt: new Date(),
      name: `Comparison ${comparisons.length + 1}`,
    };

    setComparisons([comparison, ...comparisons]);
  };

  const handleSave = (request: RequestMethod) => {
    const newRequest: SavedRequest = {
      id: crypto.randomUUID(),
      name: `${request.method} ${request.url}`,
      request,
      createdAt: new Date(),
    };
    setSavedRequests([newRequest, ...savedRequests]);
    setSelectedRequest(newRequest);
  };

  const handleUpdateDocumentation = (documentation: Documentation) => {
    if (selectedRequest) {
      const updatedRequest = { ...selectedRequest, documentation };
      setSavedRequests(savedRequests.map(req =>
        req.id === selectedRequest.id ? updatedRequest : req
      ));
      setSelectedRequest(updatedRequest);
    }
  };

  const addRequest = () => {
    setActiveRequests([...activeRequests, {
      method: 'GET',
      url: '',
      headers: {},
      body: '',
      contentType: 'application/json'
    }]);
  };

  const removeRequest = (index: number) => {
    setActiveRequests(activeRequests.filter((_, i) => i !== index));
    setResponses(prev => {
      const newResponses = new Map(prev);
      newResponses.delete(index);
      return newResponses;
    });
  };

  const updateRequest = (index: number, request: RequestMethod) => {
    setActiveRequests(activeRequests.map((req, i) =>
      i === index ? request : req
    ));
  };

  return (
    <div className="min-h-screen bg-secondary font-grotesk">
      <Helmet>
        <title>API Testing Workbench - Test, Document, and Compare APIs</title>
        <meta name="description" content="A powerful tool for testing, documenting, and comparing API requests. Features include request comparison, documentation management, and multiple format exports." />
        <meta name="keywords" content="API testing, API documentation, REST client, API workbench, API comparison tool, developer tools" />
        <link rel="canonical" href="https://api-workbench.stackblitz.com" />
        <meta property="og:title" content="API Testing Workbench" />
        <meta property="og:description" content="A powerful tool for testing, documenting, and comparing API requests" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="API Testing Workbench" />
        <meta name="twitter:description" content="A powerful tool for testing, documenting, and comparing API requests" />
      </Helmet>

      <header className="bg-secondary-light fixed w-full top-0 z-50  border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center space-x-4">
            <span className='flex  items-center gap-2'><Boxes className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-white">
                API Testing Workbench
              </h1></span>
            <span className='cursor-pointer hover:text-primary transition-colors' >
              <a href="https://x.com/ritikpaltech" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-twitter-x" viewBox="0 0 16 16">
                  <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
                </svg>
              </a>
            </span>

          </div>

        </div>
      </header>

      <main className="max-w-7xl pb-[100px] pt-28 mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="space-y-4">
            {activeRequests.map((request, index) => (
              <div key={index} className="space-y-4">
                <div className="relative">
                  <RequestPanel
                    request={request}
                    onSend={(req) => {
                      updateRequest(index, req);
                      handleSend(req, index);
                    }}
                    onSave={handleSave}
                  />
                  {activeRequests.length > 1 && (
                    <button
                      onClick={() => removeRequest(index)}
                      className="absolute -right-2 -top-2 p-1 bg-primary text-white rounded-full hover:bg-primary-dark"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                {responses.get(index) && (
                  <ResponsePanel
                    response={responses.get(index)?.response || null}
                    error={responses.get(index)?.error || null}
                  />
                )}
              </div>
            ))}

            <div className="flex justify-between items-center">
              <button
                onClick={addRequest}
                className="px-4 py-2 text-primary hover:text-primary-dark flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Request</span>
              </button>

              {activeRequests.length > 1 && (
                <button
                  onClick={handleCompare}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md"
                >
                  Compare Requests
                </button>
              )}
            </div>
          </div>

          {comparisons.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Comparisons</h2>
              {comparisons.map((comparison) => (
                <ComparisonPanel key={comparison.id} comparison={comparison} />
              ))}
            </div>
          )}

          {savedRequests.length > 0 && (
            <div className="bg-secondary-light border border-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Saved Requests
              </h2>
              <div className="space-y-2">
                {savedRequests.map((saved) => (
                  <button
                    key={saved.id}
                    onClick={() => {
                      setSelectedRequest(saved);
                      const index = activeRequests.length;
                      setActiveRequests([...activeRequests, saved.request]);
                      handleSend(saved.request, index);
                    }}
                    className={`w-full text-left p-3 rounded-md transition-colors ${selectedRequest?.id === saved.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-secondary'
                      }`}
                  >
                    <div className="font-medium text-white">
                      {saved.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(saved.createdAt).toLocaleString()}
                    </div>
                    {saved.documentation && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {saved.documentation.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedRequest && (
            <div className="bg-secondary-light border border-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Documentation
              </h2>
              <DocumentationPanel
                documentation={selectedRequest.documentation}
                onSave={handleUpdateDocumentation}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="bg-secondary-light fixed w-full bottom-0 border-t border-gray-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-400">
              Made by <span className="text-primary">Ritik Pal</span>
            </p>
            <a
              href="https://github.com/ritikpal1122"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary transition-colors"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;