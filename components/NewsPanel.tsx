import React from 'react';
import { NewsArticle } from '../App';
import { GroundingSource } from '../services/geminiService';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';

interface NewsPanelProps {
  articles: NewsArticle[];
  sources: GroundingSource[];
  isLoading: boolean;
  error: string | null;
}

export const NewsPanel: React.FC<NewsPanelProps> = ({ articles, sources, isLoading, error }) => {
  
  const LoadingState = () => (
    <div className="text-center p-8">
      <svg className="animate-spin mx-auto h-8 w-8 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-gray-400">Fetching the latest news from around the world...</p>
    </div>
  );
  
  const ErrorState = () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-red-900/20 border border-red-500/50 rounded-lg p-8 text-center">
      <ExclamationTriangleIcon className="w-10 h-10 text-red-400 mb-4" />
      <h3 className="text-lg font-semibold text-red-300">Could Not Fetch News</h3>
      <p className="text-red-400 mt-2">{error}</p>
    </div>
  );

  if (!isLoading && !error && articles.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-gray-800/50 p-6 rounded-2xl shadow-md border border-gray-700">
      <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-3">
        <NewspaperIcon className="w-6 h-6 text-amber-400"/>
        Latest News Headlines
      </h2>
      
      {isLoading ? <LoadingState /> :
       error ? <ErrorState /> :
       (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
                {articles.map((article, index) => (
                    <a 
                        key={index} 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block bg-gray-900/50 p-4 rounded-lg hover:bg-gray-700/50 border border-gray-700 hover:border-purple-500 transition-all duration-200"
                    >
                        <h3 className="font-semibold text-purple-300 mb-1">{article.title}</h3>
                        <p className="text-sm text-gray-400">{article.summary}</p>
                    </a>
                ))}
            </div>
            {sources.length > 0 && (
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-gray-300 mb-3 text-sm">Sources Used by AI:</h4>
                    <ul className="space-y-2">
                        {sources.map((source, index) => (
                            <li key={index}>
                                <a 
                                    href={source.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-xs text-cyan-400 hover:underline truncate block"
                                    title={source.uri}
                                >
                                    {source.title || source.uri}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
         </div>
       )
      }
    </div>
  );
};
