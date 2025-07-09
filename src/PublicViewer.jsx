import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getFirestore,
  doc,
  getDoc
} from 'firebase/firestore';
import {
  initializeApp,
  getApps
} from 'firebase/app';

// ✅ Use same config as in your App.jsx (inlined here for independence)
const firebaseConfig = {
  apiKey: "AIzaSyC0Mx48gIXYN81RT3S_Dixr2w2nsqleEzU",
  authDomain: "ecc-app-ab284.firebaseapp.com",
  projectId: "ecc-app-ab284",
  storageBucket: "ecc-app-ab284.appspot.com",
  messagingSenderId: "182753260281",
  appId: "1:182753260281:web:03449c99b6b6530416e828",
  measurementId: "G-PW5ZCJKP9K"
};

// Get appId from config (same logic as in App.jsx)
const appId = firebaseConfig.appId;

const PublicViewer = () => {
  const { id } = useParams(); // Changed from publicId to id to match the route
  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadPublicContent = async () => {
      try {
        if (!getApps().length) {
          initializeApp(firebaseConfig);
        }
        const db = getFirestore();
        const docRef = doc(db, `artifacts/${appId}/public/data/sharedContent/${id}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setContentData(docSnap.data());
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Error loading public content:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadPublicContent();
  }, [id]);

  const handleCopyContent = () => {
    if (contentData?.generatedContent) {
      const textarea = document.createElement('textarea');
      textarea.value = contentData.generatedContent;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading shared content...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Content Not Found</h1>
          <p className="text-gray-600 mb-6">The shared content you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ECC</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800 truncate max-w-md">
                {contentData.name || 'Shared Educational Content'}
              </h1>
              <p className="text-xs text-gray-500">
                Shared on {contentData.timestamp?.toDate().toLocaleDateString() || 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCopyContent}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              copied 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Copy Content</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white">
          {/* Content Display */}
          <div className="prose prose-lg max-w-none">
            <div 
              className="text-black leading-relaxed whitespace-pre-wrap"
              style={{
                fontSize: '16px',
                lineHeight: '1.6',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}
            >
              {contentData.generatedContent}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-600 text-sm mb-2">
            This content was created using <span className="font-semibold text-blue-600">ECC App</span>
          </p>
          <p className="text-gray-500 text-xs">
            Educational Content Creator - Powered by AI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicViewer;
