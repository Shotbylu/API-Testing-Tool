import React, { useState, useEffect, useRef } from 'react';
import { Send, Save, Trash2, AlertCircle, Upload, X } from 'lucide-react';
import type { RequestMethod } from '../types';

interface RequestPanelProps {
  request?: RequestMethod;
  onSend: (request: RequestMethod) => void;
  onSave: (request: RequestMethod) => void;
}

interface FormDataField {
  key: string;
  value: string;
  type: 'text' | 'file';
  file?: File;
}

const CONTENT_TYPES = {
  'application/json': {
    label: 'JSON',
    placeholder: '{\n  "key": "value"\n}',
    validate: (body: string) => {
      try {
        JSON.parse(body);
        return true;
      } catch (e) {
        return false;
      }
    }
  },
  'application/x-www-form-urlencoded': {
    label: 'Form URL Encoded',
    placeholder: 'key1=value1&key2=value2',
    validate: (body: string) => {
      try {
        return body.split('&').every(pair => pair.includes('='));
      } catch (e) {
        return false;
      }
    }
  },
  'text/plain': {
    label: 'Plain Text',
    placeholder: 'Enter plain text...',
    validate: () => true
  },
  'application/xml': {
    label: 'XML',
    placeholder: '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <element>value</element>\n</root>',
    validate: (body: string) => {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(body, 'application/xml');
        return !doc.querySelector('parsererror');
      } catch (e) {
        return false;
      }
    }
  },
  'multipart/form-data': {
    label: 'Form Data',
    placeholder: '',
    validate: () => true
  }
};

export function RequestPanel({ request: initialRequest, onSend, onSave }: RequestPanelProps) {
  const [method, setMethod] = useState<RequestMethod['method']>(initialRequest?.method || 'POST');
  const [url, setUrl] = useState(initialRequest?.url || '');
  const [headers, setHeaders] = useState<Record<string, string>>(initialRequest?.headers || {});
  const [body, setBody] = useState(initialRequest?.body || '');
  const [contentType, setContentType] = useState(initialRequest?.contentType || 'application/json');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [formFields, setFormFields] = useState<FormDataField[]>([{ key: '', value: '', type: 'text' }]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialRequest) {
      setMethod(initialRequest.method);
      setUrl(initialRequest.url);
      setHeaders(initialRequest.headers);
      setBody(initialRequest.body || '');
      setContentType(initialRequest.contentType || 'application/json');
    }
  }, [initialRequest]);

  const validateBody = () => {
    if (!body.trim() || method === 'GET') return true;
    if (contentType === 'multipart/form-data') return true;
    const validator = CONTENT_TYPES[contentType as keyof typeof CONTENT_TYPES]?.validate;
    return validator ? validator(body) : true;
  };

  const handleSend = () => {
    if (!validateBody()) {
      setValidationError(`Invalid ${CONTENT_TYPES[contentType as keyof typeof CONTENT_TYPES]?.label} format`);
      return;
    }
    setValidationError(null);

    // Update headers with content type
    const updatedHeaders = { ...headers };
    if (method !== 'GET' && body) {
      updatedHeaders['Content-Type'] = contentType;
    }

    let finalBody = body;
    if (contentType === 'multipart/form-data') {
      const formData = new FormData();
      formFields.forEach(field => {
        if (field.key) {
          if (field.type === 'file' && field.file) {
            formData.append(field.key, field.file);
          } else {
            formData.append(field.key, field.value);
          }
        }
      });
      finalBody = JSON.stringify(formFields);
    }

    onSend({ method, url, headers: updatedHeaders, body: finalBody, contentType });
  };

  const handleSave = () => {
    if (!validateBody()) {
      setValidationError(`Invalid ${CONTENT_TYPES[contentType as keyof typeof CONTENT_TYPES]?.label} format`);
      return;
    }
    setValidationError(null);
    onSave({ method, url, headers, body, contentType });
  };

  const getBodyPlaceholder = () => {
    return CONTENT_TYPES[contentType as keyof typeof CONTENT_TYPES]?.placeholder || '';
  };

  const handleFileChange = (index: number, file: File | null) => {
    setFormFields(fields => 
      fields.map((field, i) => 
        i === index
          ? { ...field, file, value: file ? file.name : '' }
          : field
      )
    );
  };

  const addFormField = (type: 'text' | 'file' = 'text') => {
    setFormFields([...formFields, { key: '', value: '', type }]);
  };

  const removeFormField = (index: number) => {
    setFormFields(fields => fields.filter((_, i) => i !== index));
  };

  const updateFormField = (index: number, updates: Partial<FormDataField>) => {
    setFormFields(fields =>
      fields.map((field, i) =>
        i === index ? { ...field, ...updates } : field
      )
    );
  };

  return (
    <div className="bg-secondary-light border border-gray-800 rounded-lg shadow-lg p-6 space-y-4">
      <div className="flex space-x-4">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as RequestMethod['method'])}
          className="px-4 py-2 bg-secondary border border-gray-700 rounded-md text-white font-mono focus:border-primary focus:ring-1 focus:ring-primary"
        >
          {['POST', 'GET', 'PUT', 'DELETE', 'PATCH'].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
          className="flex-1 px-4 py-2 bg-secondary border border-gray-700 rounded-md text-white focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">Headers</h3>
        <div className="bg-secondary p-4 rounded-md">
          {Object.entries(headers).map(([key, value], index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                value={key}
                onChange={(e) => {
                  const newHeaders = { ...headers };
                  delete newHeaders[key];
                  newHeaders[e.target.value] = value;
                  setHeaders(newHeaders);
                }}
                placeholder="Key"
                className="flex-1 px-3 py-1 bg-secondary-light border border-gray-700 rounded-md text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  setHeaders({ ...headers, [key]: e.target.value });
                }}
                placeholder="Value"
                className="flex-1 px-3 py-1 bg-secondary-light border border-gray-700 rounded-md text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={() => {
                  const newHeaders = { ...headers };
                  delete newHeaders[key];
                  setHeaders(newHeaders);
                }}
                className="p-1 text-gray-400 hover:text-primary"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setHeaders({ ...headers, '': '' })}
            className="text-sm text-primary hover:text-primary-dark"
          >
            + Add Header
          </button>
        </div>
      </div>

      {method !== 'GET' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-300">Request Body</h3>
            <select
              value={contentType}
              onChange={(e) => {
                setContentType(e.target.value);
                setValidationError(null);
              }}
              className="px-3 py-1 text-sm bg-secondary border border-gray-700 rounded-md text-white focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {Object.entries(CONTENT_TYPES).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {contentType === 'multipart/form-data' ? (
            <div className="space-y-4">
              {formFields.map((field, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => updateFormField(index, { key: e.target.value })}
                    placeholder="Key"
                    className="flex-1 px-3 py-1 bg-secondary-light border border-gray-700 rounded-md text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  {field.type === 'text' ? (
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => updateFormField(index, { value: e.target.value })}
                      placeholder="Value"
                      className="flex-1 px-3 py-1 bg-secondary-light border border-gray-700 rounded-md text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  ) : (
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 bg-secondary-light border border-gray-700 rounded-md text-sm text-white hover:bg-secondary flex items-center space-x-2"
                      >
                        <Upload size={14} />
                        <span>{field.file ? field.file.name : 'Choose File'}</span>
                      </button>
                    </div>
                  )}
                  <div className="flex space-x-1">
                    <button
                      onClick={() => updateFormField(index, { type: field.type === 'text' ? 'file' : 'text' })}
                      className="p-1 text-gray-400 hover:text-primary"
                      title={`Switch to ${field.type === 'text' ? 'file' : 'text'} input`}
                    >
                      {field.type === 'text' ? <Upload size={16} /> : <span className="text-sm">Aa</span>}
                    </button>
                    <button
                      onClick={() => removeFormField(index)}
                      className="p-1 text-gray-400 hover:text-primary"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => addFormField()}
                className="text-sm text-primary hover:text-primary-dark"
              >
                + Add Field
              </button>
            </div>
          ) : (
            <div className="relative">
              <textarea
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  setValidationError(null);
                }}
                placeholder={getBodyPlaceholder()}
                className="w-full h-40 px-4 py-2 bg-secondary border border-gray-700 rounded-md font-mono text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {validationError && (
                <div className="absolute top-2 right-2 text-primary flex items-center gap-1 text-sm bg-secondary-light px-2 py-1 rounded-md">
                  <AlertCircle size={14} />
                  {validationError}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 text-white border border-gray-700 rounded-md hover:bg-secondary flex items-center space-x-2"
        >
          <Save size={16} />
          <span>Save</span>
        </button>
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md flex items-center space-x-2"
        >
          <Send size={16} />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}