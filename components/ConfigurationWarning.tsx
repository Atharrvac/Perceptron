import React from 'react'

const ConfigurationWarning: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-teal-400 mb-2">HDTN Connect</h1>
          <h2 className="text-2xl font-semibold text-red-400 mb-8">Configuration Required</h2>
        </div>

        <div className="bg-slate-800 p-8 rounded-lg shadow-xl space-y-6">
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
            <h3 className="font-semibold mb-2">Supabase Not Configured</h3>
            <p className="text-sm mb-3">
              Please set up your Supabase environment variables to enable authentication.
            </p>
            <div className="text-xs space-y-1">
              <p>Required variables:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>VITE_SUPABASE_URL</li>
                <li>VITE_SUPABASE_ANON_KEY</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-3 rounded-lg">
            <h3 className="font-semibold mb-2">Setup Instructions</h3>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Connect to Supabase in the Builder.io platform</li>
              <li>Get your project URL and anon key</li>
              <li>Set the environment variables</li>
              <li>Refresh the page</li>
            </ol>
          </div>

          <div className="text-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfigurationWarning
