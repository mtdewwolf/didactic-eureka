import React, { useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';

const LoginForm: React.FC = () => {
  const { login, isLoading, error } = usePlayer();
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await login(name);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Join Tournament</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label 
            htmlFor="playerName" 
            className="block text-gray-700 font-medium mb-2"
          >
            Enter Your Name
          </label>
          <input
            id="playerName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
            required
            disabled={isLoading}
          />
        </div>
        
        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Joining...' : 'Join Now'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm; 