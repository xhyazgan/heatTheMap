import React, { useState, useRef } from 'react';
import type { VideoSource, VideoSourceType } from '../../types/videoSource';

interface VideoSourceSelectorProps {
  onSourceSelect: (source: VideoSource) => void;
  disabled?: boolean;
}

const tabs: { key: VideoSourceType; label: string }[] = [
  { key: 'webcam', label: 'Kamera' },
  { key: 'file', label: 'Dosya' },
  { key: 'url', label: 'URL / IP Kamera' },
];

export const VideoSourceSelector: React.FC<VideoSourceSelectorProps> = ({
  onSourceSelect,
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState<VideoSourceType>('webcam');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleWebcamSelect = () => {
    onSourceSelect({ type: 'webcam' });
  };

  const handleFileSelect = () => {
    if (selectedFile) {
      onSourceSelect({ type: 'file', file: selectedFile });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleUrlSelect = () => {
    if (!url.trim()) return;
    const source: VideoSource = {
      type: 'url',
      url: url.trim(),
      ...(showAuth && username ? { username, password } : {}),
    };
    onSourceSelect(source);
  };

  return (
    <div className="mb-3">
      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            disabled={disabled}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-2">
        {activeTab === 'webcam' && (
          <button
            onClick={handleWebcamSelect}
            disabled={disabled}
            className="w-full px-3 py-2 text-xs font-medium rounded bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Webcam Baslat
          </button>
        )}

        {activeTab === 'file' && (
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              disabled={disabled}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="w-full px-3 py-2 text-xs font-medium rounded bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-left"
            >
              {selectedFile ? selectedFile.name : 'Video dosyasi sec...'}
            </button>
            <button
              onClick={handleFileSelect}
              disabled={disabled || !selectedFile}
              className="w-full px-3 py-2 text-xs font-medium rounded bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Yukle
            </button>
          </div>
        )}

        {activeTab === 'url' && (
          <div className="space-y-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={disabled}
              placeholder="http://... veya .m3u8 URL"
              className="w-full px-3 py-2 text-xs rounded bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-sky-500 focus:outline-none disabled:opacity-40"
            />
            <button
              onClick={() => setShowAuth(!showAuth)}
              disabled={disabled}
              className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
            >
              {showAuth ? '- Kimlik dogrulamayi gizle' : '+ Kimlik dogrulama'}
            </button>
            {showAuth && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={disabled}
                  placeholder="Kullanici adi"
                  className="w-full px-3 py-2 text-xs rounded bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-sky-500 focus:outline-none disabled:opacity-40"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={disabled}
                  placeholder="Sifre"
                  className="w-full px-3 py-2 text-xs rounded bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-sky-500 focus:outline-none disabled:opacity-40"
                />
              </div>
            )}
            <button
              onClick={handleUrlSelect}
              disabled={disabled || !url.trim()}
              className="w-full px-3 py-2 text-xs font-medium rounded bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Baglan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
