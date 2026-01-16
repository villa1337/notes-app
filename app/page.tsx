'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<'write' | 'browse' | 'view'>('write');
  const [folders, setFolders] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [notes, setNotes] = useState<string[]>([]);
  const [currentNote, setCurrentNote] = useState<string>('');
  const [saving, setSaving] = useState(false);
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

    setSaving(true);
    try {
      await fetch(`${API_URL}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder, filename, content: noteContent })
      });
      setContent('');
      setMode('browse');
    } catch (err) {
      console.error('Failed to save note:', err);
    }
    setSaving(false);
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden" style={{backgroundColor: '#000'}}>
      {mode === 'write' && (
        <>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 w-full bg-black text-white border-none outline-none resize-none p-3 font-mono text-sm"
            style={{backgroundColor: '#000', color: '#fff'}}
            placeholder="folder&#10;filename.txt&#10;content..."
            autoFocus
          />
          <div className="flex gap-2 p-3 bg-black border-t border-gray-800 safe-area-bottom">
            <button
              onClick={saveNote}
              disabled={saving}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded font-bold disabled:opacity-50 active:bg-green-700"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setMode('browse')}
              className="flex-1 bg-gray-700 text-white py-3 px-4 rounded font-bold active:bg-gray-600"
            >
              Browse
            </button>
          </div>
        </>
      )}

      {mode === 'browse' && !currentFolder && (
        <div className="flex-1 flex flex-col bg-black overflow-hidden">
          <div className="flex justify-between items-center p-3 border-b border-gray-800">
            <h2 className="text-lg font-bold">Folders</h2>
            <button
              onClick={() => setMode('write')}
              className="bg-green-600 text-white py-2 px-3 rounded font-bold text-sm active:bg-green-700"
            >
              + New
            </button>
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {folders.length === 0 ? (
              <p className="text-gray-500 text-sm">No folders yet. Create your first note!</p>
            ) : (
              folders.map((folder) => (
                <div
                  key={folder}
                  onClick={() => fetchNotes(folder)}
                  className="p-3 border border-gray-800 rounded cursor-pointer active:bg-gray-800 text-sm"
                >
                  📁 {folder}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {mode === 'browse' && currentFolder && (
        <div className="flex-1 flex flex-col bg-black overflow-hidden">
          <div className="flex justify-between items-center p-3 border-b border-gray-800">
            <button
              onClick={() => setCurrentFolder('')}
              className="text-gray-400 active:text-white text-sm"
            >
              ← Back
            </button>
            <h2 className="text-lg font-bold">{currentFolder}</h2>
            <div className="w-12"></div>
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {notes.length === 0 ? (
              <p className="text-gray-500 text-sm">No notes in this folder</p>
            ) : (
              notes.map((note) => (
                <div
                  key={note}
                  onClick={() => fetchNote(currentFolder, note)}
                  className="p-3 border border-gray-800 rounded cursor-pointer active:bg-gray-800 text-sm"
                >
                  📄 {note}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {mode === 'view' && (
        <div className="flex-1 flex flex-col bg-black overflow-hidden">
          <div className="p-3 border-b border-gray-800">
            <button
              onClick={() => { setMode('browse'); setCurrentNote(''); }}
              className="text-gray-400 active:text-white text-sm"
            >
              ← Back
            </button>
          </div>
          <div className="flex-1 overflow-auto p-3">
            <pre className="whitespace-pre-wrap font-mono text-xs">{currentNote}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
