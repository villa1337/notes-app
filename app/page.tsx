'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<'write' | 'browse' | 'view'>('write');
  const [folders, setFolders] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [notes, setNotes] = useState<string[]>([]);
  const [currentNote, setCurrentNote] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (mode === 'write' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'browse') {
      fetchFolders();
    }
  }, [mode]);

  const fetchFolders = async () => {
    try {
      const res = await fetch(`${API_URL}/folders`);
      const data = await res.json();
      setFolders(data.folders || []);
    } catch (err) {
      console.error('Failed to fetch folders:', err);
    }
  };

  const fetchNotes = async (folder: string) => {
    try {
      const res = await fetch(`${API_URL}/notes/${folder}`);
      const data = await res.json();
      setNotes(data.notes || []);
      setCurrentFolder(folder);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  };

  const fetchNote = async (folder: string, filename: string) => {
    try {
      const res = await fetch(`${API_URL}/note/${folder}/${filename}`);
      const data = await res.json();
      setCurrentNote(data.content || '');
      setMode('view');
    } catch (err) {
      console.error('Failed to fetch note:', err);
    }
  };

  const saveNote = async () => {
    const lines = content.split('\n');
    if (lines.length < 3) return;

    const folder = lines[0].trim();
    const filename = lines[1].trim();
    const noteContent = lines.slice(2).join('\n');

    if (!folder || !filename) return;

    try {
      await fetch(`${API_URL}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder, filename, content: noteContent })
      });
      setContent('');
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touches = e.touches.length;
    
    if (touches === 2) {
      e.preventDefault();
    } else if (touches === 3) {
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touches = e.changedTouches.length;
    
    if (touches === 2 && mode === 'write') {
      // Two finger swipe up = save
      saveNote();
    } else if (touches === 2 && mode === 'browse') {
      // Two finger swipe down = browse
      setMode('browse');
    } else if (touches === 3) {
      // Three finger tap = new folder (handled in write mode)
      if (mode === 'write') {
        // User creates folder by typing folder name
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY < 0 && mode === 'write') {
        // Two finger scroll up = save
        saveNote();
      } else if (e.deltaY > 0) {
        // Two finger scroll down = browse
        setMode('browse');
      }
    }
  };

  return (
    <div 
      className="min-h-screen bg-black text-white p-4"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {mode === 'write' && (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-screen bg-black text-white border-none outline-none resize-none font-mono"
          placeholder="folder&#10;filename.txt&#10;content..."
        />
      )}

      {mode === 'browse' && !currentFolder && (
        <div className="space-y-2">
          <h2 className="text-xl mb-4">Folders</h2>
          {folders.map((folder) => (
            <div
              key={folder}
              onClick={() => fetchNotes(folder)}
              className="p-4 border border-gray-800 cursor-pointer hover:bg-gray-900"
            >
              {folder}
            </div>
          ))}
          <button
            onClick={() => setMode('write')}
            className="mt-4 p-4 border border-gray-800 w-full"
          >
            New Note
          </button>
        </div>
      )}

      {mode === 'browse' && currentFolder && (
        <div className="space-y-2">
          <button
            onClick={() => setCurrentFolder('')}
            className="mb-4 text-gray-500"
          >
            ← Back
          </button>
          <h2 className="text-xl mb-4">{currentFolder}</h2>
          {notes.map((note) => (
            <div
              key={note}
              onClick={() => fetchNote(currentFolder, note)}
              className="p-4 border border-gray-800 cursor-pointer hover:bg-gray-900"
            >
              {note}
            </div>
          ))}
        </div>
      )}

      {mode === 'view' && (
        <div className="space-y-4">
          <button
            onClick={() => { setMode('browse'); setCurrentNote(''); }}
            className="text-gray-500"
          >
            ← Back
          </button>
          <pre className="whitespace-pre-wrap font-mono">{currentNote}</pre>
        </div>
      )}
    </div>
  );
}
