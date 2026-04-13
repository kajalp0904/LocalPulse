import React from 'react';

export default function JobsPanel({ jobs }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
         <h2 className="text-lg font-extrabold text-gray-800">Local Jobs <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full ml-2">Adzuna</span></h2>
      </div>
      <div className="p-2 max-h-96 overflow-y-auto">
         {(!jobs || jobs.length === 0) ? (
            <p className="p-4 text-gray-500 text-sm text-center">Add Adzuna API Key to view jobs.</p>
         ) : (
            jobs.map((job, i) => (
               <a key={i} href={job.url} target="_blank" rel="noopener noreferrer" className="block p-4 hover:bg-slate-50 transition-colors border-b border-gray-50 last:border-0 rounded-xl">
                  <h4 className="font-bold text-gray-900 leading-tight mb-1">{job.title}</h4>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                     <span className="font-medium text-indigo-600">{job.company}</span>
                     <span className="mx-2">&bull;</span>
                     <span className="truncate">{job.location}</span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded">{job.salary}</p>
               </a>
            ))
         )}
      </div>
    </div>
  );
}
