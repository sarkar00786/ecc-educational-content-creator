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
  const { publicId } = useParams();
  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadPublicContent = async () => {
      try {
        if (!getApps().length) {
          initializeApp(firebaseConfig);
        }
        const db = getFirestore();
        const docRef = doc(db, `artifacts/${appId}/public/data/sharedContent/${publicId}`);
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
  }, [publicId]);

  if (loading) return <div className="p-6 text-center text-gray-600">🔄 Loading public content...</div>;
  if (notFound) return <div className="p-6 text-center text-red-600">❌ Content not found or has been removed.</div>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-10 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{contentData.name || 'Shared Educational Content'}</h1>
        <p className="text-sm text-gray-500 mb-6">
          📅 Shared On: {contentData.timestamp?.toDate().toLocaleString() || 'N/A'}
        </p>
        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-inner">
          {contentData.generatedContent}
        </div>
      </div>
    </div>
  );
};

export default PublicViewer;
