import React from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function UserPost({ post, onUpvote }) {
   const { token, user } = useAuth();
   
   const handleUpvote = async () => {
       try {
           const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/posts/${post._id}/upvote`, {}, {
               headers: { Authorization: `Bearer ${token}` }
           });
           if(onUpvote) onUpvote(res.data);
       } catch (err) {
           console.error("Upvote failed", err);
       }
   };

   const hasUpvoted = post.upvotes?.includes(user?._id);

   return (
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4 hover:shadow-md transition-all">
         <div className="flex justify-between items-start mb-3">
             <div>
                <h4 className="font-bold text-gray-900 text-lg">{post.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">By {post.author?.name || 'Local Resident'} &bull; {new Date(post.createdAt).toLocaleString()}</p>
             </div>
             <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-gray-100 text-gray-600 rounded">
                {post.category}
             </span>
         </div>
         <p className="text-gray-700 text-sm mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>
         
         <div className="flex items-center gap-2 border-t border-gray-50 pt-3">
             <button 
                onClick={handleUpvote}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${hasUpvoted ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
             >
                 <svg className={`w-4 h-4 ${hasUpvoted ? 'fill-current' : 'fill-none stroke-current stroke-2'}`} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                 </svg>
                 {post.upvotes?.length || 0}
             </button>
         </div>
      </div>
   );
}
