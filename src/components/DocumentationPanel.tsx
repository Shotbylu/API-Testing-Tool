import React, { useState } from 'react';
import { Save, Tag, X, Download, FileJson, File as FilePdf } from 'lucide-react';
import { jsPDF } from 'jspdf';
import type { Documentation } from '../types';

interface DocumentationPanelProps {
  documentation?: Documentation;
  onSave: (doc: Documentation) => void;
}

export function DocumentationPanel({ documentation, onSave }: DocumentationPanelProps) {
  const [isEditing, setIsEditing] = useState(!documentation);
  const [title, setTitle] = useState(documentation?.title || '');
  const [description, setDescription] = useState(documentation?.description || '');
  const [notes, setNotes] = useState(documentation?.notes || '');
  const [tags, setTags] = useState<string[]>(documentation?.tags || []);
  const [newTag, setNewTag] = useState('');

  const handleSave = () => {
    onSave({
      title,
      description,
      notes,
      tags,
      lastUpdated: new Date(),
    });
    setIsEditing(false);
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleDownloadJSON = () => {
    if (!documentation) return;

    const docContent = {
      ...documentation,
      lastUpdated: new Date(documentation.lastUpdated).toLocaleString(),
    };

    const blob = new Blob([JSON.stringify(docContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentation.title.toLowerCase().replace(/\s+/g, '-')}-documentation.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!documentation) return;

    const doc = new jsPDF();
    const lineHeight = 10;
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(documentation.title, 20, yPosition);
    yPosition += lineHeight * 2;

    // Description
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const descriptionLines = doc.splitTextToSize(documentation.description, 170);
    doc.text(descriptionLines, 20, yPosition);
    yPosition += (descriptionLines.length * lineHeight) + 10;

    // Tags
    if (documentation.tags.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Tags:', 20, yPosition);
      yPosition += lineHeight;
      doc.setFont('helvetica', 'normal');
      doc.text(documentation.tags.join(', '), 20, yPosition);
      yPosition += lineHeight * 2;
    }

    // Notes
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 20, yPosition);
    yPosition += lineHeight;
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(documentation.notes, 170);
    doc.text(notesLines, 20, yPosition);
    yPosition += notesLines.length * lineHeight;

    // Last Updated
    doc.setFontSize(10);
    doc.setTextColor(128);
    doc.text(`Last updated: ${new Date(documentation.lastUpdated).toLocaleString()}`, 20, yPosition + 10);

    doc.save(`${documentation.title.toLowerCase().replace(/\s+/g, '-')}-documentation.pdf`);
  };

  if (!isEditing && documentation) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">{documentation.title}</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadJSON}
              className="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 rounded-md flex items-center gap-2"
              title="Download as JSON"
            >
              <FileJson size={14} />
              JSON
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 rounded-md flex items-center gap-2"
              title="Download as PDF"
            >
              <FilePdf size={14} />
              PDF
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 text-sm text-primary hover:text-primary-dark"
            >
              Edit
            </button>
          </div>
        </div>
        <p className="text-gray-300">{documentation.description}</p>
        <div className="bg-secondary-light p-4 rounded-md">
          <pre className="text-gray-300 whitespace-pre-wrap">{documentation.notes}</pre>
        </div>
        <div className="flex flex-wrap gap-2">
          {documentation.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
              {tag}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-400">
          Last updated: {new Date(documentation.lastUpdated).toLocaleString()}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Documentation Title"
        className="w-full px-4 py-2 bg-secondary-light border border-gray-700 rounded-md text-white focus:border-primary focus:ring-1 focus:ring-primary"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add a description"
        rows={2}
        className="w-full px-4 py-2 bg-secondary-light border border-gray-700 rounded-md text-white focus:border-primary focus:ring-1 focus:ring-primary"
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add detailed notes, examples, and usage instructions..."
        rows={6}
        className="w-full px-4 py-2 bg-secondary-light border border-gray-700 rounded-md text-white focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm"
      />
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
            placeholder="Add tags"
            className="flex-1 px-4 py-2 bg-secondary-light border border-gray-700 rounded-md text-white focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={addTag}
            className="p-2 text-primary hover:text-primary-dark"
          >
            <Tag size={20} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm flex items-center gap-1"
            >
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-primary-dark">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md flex items-center gap-2"
        >
          <Save size={16} />
          Save Documentation
        </button>
      </div>
    </div>
  );
}