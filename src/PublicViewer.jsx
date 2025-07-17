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

// Icons (inline SVG components)
const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const FileTextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
);

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
    <path d="M16 6l-4-4-4 4" />
    <path d="M12 2v13" />
  </svg>
);

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
  const [linkCopied, setLinkCopied] = useState(false);

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

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    const textarea = document.createElement('textarea');
    textarea.value = currentUrl;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleExportToPDF = () => {
    if (typeof html2pdf !== 'undefined' && contentData?.generatedContent) {
      const htmlContent = `
        <html>
          <head>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                color: #000000;
                background-color: #ffffff;
                padding: 20px;
                line-height: 1.6;
              }
              h1 { color: #000000; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <h1>${contentData.name || 'Shared Educational Content'}</h1>
            ${contentData.generatedContent.replace(/\n/g, '<br />')}
          </body>
        </html>
      `;

      html2pdf().from(htmlContent).set({
        margin: 1,
        filename: `${contentData.name || 'ECC-Content'}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      }).save();
    } else {
      alert('PDF export is not available. Please try copying the content instead.');
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
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(262, 83%, 58%) 25%, hsl(199, 89%, 48%) 50%, hsl(142, 76%, 36%) 75%, hsl(38, 92%, 50%) 100%)',
      color: '#1a202c',
      position: 'relative'
    }}>
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '6s' }}></div>
      </div>
      
      {/* Header */}
      <header className="backdrop-blur-sm border-b sticky top-0 z-10" style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        borderColor: 'rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">ECC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold truncate max-w-md" style={{ color: '#1a202c' }}>
                  {contentData.name || 'Shared Educational Content'}
                </h1>
                <p className="text-sm" style={{ color: '#718096' }}>
                  📅 Shared on {contentData.timestamp?.toDate().toLocaleDateString() || 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCopyContent}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
                <span className="text-sm">{copied ? 'Copied!' : 'Copy Content'}</span>
              </button>
              
              <button
                onClick={handleCopyLink}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                  linkCopied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                {linkCopied ? <CheckIcon /> : <ShareIcon />}
                <span className="text-sm">{linkCopied ? 'Link Copied!' : 'Share Link'}</span>
              </button>
              
              <button
                onClick={handleExportToPDF}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <FileTextIcon />
                <span className="text-sm">Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 relative z-10">
        <div className="backdrop-blur-lg rounded-3xl shadow-2xl border overflow-hidden" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Content Header */}
          <div className="px-8 py-6 border-b" style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)',
            borderColor: 'rgba(255, 255, 255, 0.2)'
          }}>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">📚 Educational Content</h2>
            <p className="text-gray-700 mt-2 font-medium">Generated with AI-powered educational content creator</p>
          </div>
          
          {/* Content Body */}
          <div className="px-8 py-8">
            <div 
              className="whitespace-pre-wrap"
              style={{
                color: '#000000',
                fontSize: '17px',
                lineHeight: '1.7',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: '32px',
                borderRadius: '20px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                minHeight: '400px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              {contentData.generatedContent}
            </div>
          </div>
          
          {/* Content Footer */}
          <div className="px-8 py-6 border-t" style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 50%, rgba(236, 72, 153, 0.05) 100%)',
            borderColor: 'rgba(255, 255, 255, 0.2)'
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                  <span className="text-sm font-semibold text-blue-700">📝 {contentData.generatedContent?.split(' ').length || 0} words</span>
                </div>
                <div className="px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(147, 51, 234, 0.1)' }}>
                  <span className="text-sm font-semibold text-purple-700">🔤 {contentData.generatedContent?.length || 0} characters</span>
                </div>
              </div>
              <div className="px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)' }}>
                <span className="text-sm font-semibold text-pink-700">⚡ Powered by ECC App</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 relative z-10">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="backdrop-blur-lg rounded-2xl border text-center" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            padding: '32px'
          }}>
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">ECC</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Educational Content Creator</span>
            </div>
            <p className="text-gray-700 text-lg mb-4 font-medium">
              Create, share, and discover educational content with AI-powered assistance
            </p>
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-blue-200">
                <span className="text-blue-700 text-xs font-semibold">🌐 Global Access</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-purple-200">
                <span className="text-purple-700 text-xs font-semibold">🤖 AI-Powered</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-pink-100 to-pink-200">
                <span className="text-pink-700 text-xs font-semibold">🚀 Fast & Secure</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} ECC App. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicViewer;
