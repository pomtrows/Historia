import React, { useState } from 'react';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';

export default function AuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-slate-50 items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-serif font-bold text-historia-blue mb-2">Rejoignez Historia</h1>
        <p className="text-slate-600">L'application ultime pour apprendre l'histoire.</p>
      </div>
      
      {isLoginMode ? (
        <LoginForm toggleMode={() => setIsLoginMode(false)} />
      ) : (
        <RegisterForm toggleMode={() => setIsLoginMode(true)} />
      )}
    </div>
  );
}
