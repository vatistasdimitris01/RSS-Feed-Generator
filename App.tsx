import React, { useState, useCallback } from 'react';
import { RssIcon, LinkIcon, CopyIcon, CheckIcon } from './components/icons';

const WebhookUpdater: React.FC = () => {
    const [webhookUrl, setWebhookUrl] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const [error, setError] = useState('');

    const handleUpdate = async () => {
        setIsUpdating(true);
        setUpdateMessage('');
        setError('');
        try {
        const updateEndpoint = webhookUrl
            ? `/api/update?webhook=${encodeURIComponent(webhookUrl)}`
            : '/api/update';
            
        const res = await fetch(updateEndpoint);
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({error: 'Update failed with status: ' + res.status}));
            throw new Error(errorData.error || `Update failed with status: ${res.status}`);
        }
        const data = await res.json();
        setUpdateMessage(`Update successful! Found ${data.updated} new articles. Total: ${data.total}.`);
        } catch (err: any) {
        setError(err.message || 'An unknown error occurred during the update.');
        } finally {
        setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-4">
        <div>
            <label htmlFor="webhook" className="block text-sm font-medium text-gray-700 mb-1">
            Webhook URL (Optional)
            </label>
            <p className="text-xs text-gray-500 mb-2">
            Get notified when new articles are found. We'll send a POST request with the article details.
            </p>
            <input
            type="url"
            id="webhook"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="https://your-service.com/webhook-receiver"
            />
        </div>
        <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
        >
            {isUpdating ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking for updates...
            </>
            ) : (
            'Manually Refresh Feed'
            )}
        </button>
        {updateMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md" role="status">{updateMessage}</div>}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md" role="alert">{error}</div>}
        </div>
    );
};

const App: React.FC = () => {
  const [feedName, setFeedName] = useState('pronews');
  const [copied, setCopied] = useState(false);

  const baseUrl = `${window.location.origin}/api/rss?name=`;
  const feedUrl = `${baseUrl}${encodeURIComponent(feedName)}`;

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(feedUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [feedUrl]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
          <div className="flex justify-center items-center gap-4 mb-4">
            <RssIcon className="w-12 h-12 text-orange-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">Pronews.gr RSS Feed Service</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A dedicated, auto-updating RSS feed for Pronews.gr. Hosted on Vercel.
          </p>
        </header>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6 flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800">Your Feed URL</h2>
            <p className="text-gray-600">
             Use this URL in your RSS reader. You can customize the feed name below.
            </p>
            <div className="relative flex-grow flex flex-col justify-center">
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition">
                <span className="bg-gray-50 px-3 py-2 text-gray-500 text-sm whitespace-nowrap border-r border-gray-300">
                  {baseUrl}
                </span>
                <input
                  type="text"
                  value={feedName}
                  onChange={(e) => setFeedName(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                  className="w-full bg-white px-2 py-2 focus:outline-none"
                  placeholder="your-feed-name"
                  aria-label="Custom feed name"
                />
              </div>
            </div>
            <button onClick={copyToClipboard} className="w-full flex items-center justify-center gap-2 text-center bg-indigo-100 text-indigo-800 font-semibold py-2 px-4 rounded-md hover:bg-indigo-200 transition-colors">
              {copied ? <CheckIcon className="w-5 h-5 text-green-600"/> : <CopyIcon className="w-5 h-5" />}
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-lg mb-2">How It Works</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                <li>This service scrapes Pronews.gr for the latest articles.</li>
                <li>The feed is automatically updated every hour via a cron job.</li>
                <li>You can also manually trigger an update on the right.</li>
              </ul>
            </div>
          </div>
          
          {/* Right Column: Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6">
             <h2 className="text-2xl font-bold text-gray-800">Manual Update & Webhooks</h2>
             <p className="text-gray-600">
               Force a refresh of the feed. Optionally, provide a webhook URL to be notified of new articles.
             </p>
             <WebhookUpdater />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;