// CompletionPage.tsx (New file)
import React from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, Download, BarChart3, Home } from "lucide-react";

export default function CompletionPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle size={64} className="text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Weighting Completed Successfully!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Your data has been weighted successfully. You can now download the results 
          or view detailed reports of the weighting process.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            to={`/dashboard/project/${id}/download-weighted`}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={20} />
            Download Results
          </Link>
          
          <Link
            to={`/dashboard/project/${id}/rapport-weighted`}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <BarChart3 size={20} />
            View Report
          </Link>
        </div>
        
        <div className="border-t pt-6">
          <Link
            to="/dashboard/projects"
            className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <Home size={18} />
            Return to Projects
          </Link>
        </div>
      </div>
    </div>
  );
}