import React from 'react';

/**
 * HelloNavis Component
 * A simple welcome component to verify the setup
 */
const HelloNavis: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Navis MVP
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          AI-powered customer service and sales platform
        </p>
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Setup Complete! 🎉
          </h2>
          <p className="text-gray-600">
            Your Navis frontend is ready for development with React, TypeScript, Tailwind CSS, and Redux Toolkit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelloNavis;
