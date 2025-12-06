import React, { useState } from 'react';

export const FirebaseRulesHelper = () => {
  const [showRules, setShowRules] = useState(false);

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for development - REMOVE THIS IN PRODUCTION
    match /{document=**} {
      allow read, write;
    }
  }
}`;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-red-800 mb-4">
          🔴 Firebase Permission Error - Fix Required
        </h1>

        <p className="text-red-700 mb-4">
          The Firestore security rules need to be updated to allow data access.
          Since CLI deployment isn't working in this environment, please manually update
          the rules in the Firebase Console.
        </p>

        <div className="mb-4">
          <button
            onClick={() => setShowRules(!showRules)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showRules ? 'Hide' : 'Show'} Firestore Rules
          </button>
        </div>

        {showRules && (
          <div className="bg-white border rounded p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Copy and paste this into your Firebase Console Firestore Rules:
            </p>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              <code>{firestoreRules}</code>
            </pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <h3 className="font-bold text-blue-800 mb-2">Manual Setup Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
            <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
            <li>Select project: <strong>baumprofis-invoice-platf-3a831</strong></li>
            <li>Go to <strong>Firestore Database</strong> in the left sidebar</li>
            <li>Click <strong>Rules</strong> tab</li>
            <li>Replace all existing rules with the code above</li>
            <li>Click <strong>Publish</strong></li>
          </ol>
          <p className="text-blue-600 text-sm mt-2 font-medium">
            After publishing, refresh this page and try saving an invoice again.
          </p>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 text-sm">
            <strong>Note:</strong> This enables global read/write access for development.
            In production, implement proper user authentication and scoped rules.
          </p>
        </div>
      </div>
    </div>
  );
};
