'use client';

import { useState } from 'react';
import { Download, Loader2, Music, Video, Youtube } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [type, setType] = useState('video');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleDownload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Gagal mengambil data');
      }

      setResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600 mb-4 shadow-lg shadow-red-500/50">
            <Youtube size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-pink-600">
            YT Downloader
          </h1>
          <p className="text-gray-300 text-sm mt-2">Download Video & Audio dengan Cepat</p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleDownload} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Tempel Link YouTube di sini..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-400"
              required
            />
          </div>

          <div className="flex gap-2 bg-gray-900/50 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('video')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                type === 'video' ? 'bg-red-600 shadow-lg' : 'hover:bg-white/5 text-gray-400'
              }`}
            >
              <Video size={18} /> Video
            </button>
            <button
              type="button"
              onClick={() => setType('audio')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                type === 'audio' ? 'bg-purple-600 shadow-lg' : 'hover:bg-white/5 text-gray-400'
              }`}
            >
              <Music size={18} /> Audio
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 rounded-xl font-semibold shadow-lg shadow-red-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Memproses...
              </>
            ) : (
              'Download Sekarang'
            )}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gray-800/80 rounded-xl overflow-hidden border border-gray-700">
              <div className="relative aspect-video">
                <img 
                  src={result.info.thumbnail} 
                  alt="Thumbnail" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs font-mono">
                  {result.info.duration}
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
                  {result.info.title}
                </h3>
                
                <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                  <span className="bg-gray-700 px-2 py-1 rounded">{result.info.quality}</span>
                  <span className="bg-gray-700 px-2 py-1 rounded">{result.info.size}</span>
                  <span className="bg-gray-700 px-2 py-1 rounded">{result.info.extension}</span>
                </div>

                <a
                  href={result.download}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2.5 bg-green-600 hover:bg-green-500 text-center rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={18} /> Simpan ke Perangkat
                </a>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-center text-xs text-gray-500">
          Powered by Vercel & React
        </div>
      </div>
    </main>
  );
    }
