// ForgotPasswordForm.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthProvider";
import Spinner from "@/components/ui/Spinner";
import { Link, useNavigate } from "react-router-dom";
import api from "@/services/api";

type FormData = { email: string };

export default function ForgotPasswordForm() {
  const { loading } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setMessage("");
      
      // Appel à l'API pour envoyer l'email de réinitialisation
      const response = await api.post('/auth/forgot-password', { 
        email: data.email 
      }, {
        // Empêche les redirections automatiques
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 303; // Accepte aussi les redirections
        }
      });
      
      // Si l'API retourne une redirection (302), on la gère manuellement
      if (response.status >= 300 && response.status < 400) {
        // L'API veut rediriger, mais on veut rester sur cette page
        console.log("API attempted redirect, but we're handling it manually");
        
        // Afficher un message de succès
        setMessage("Reset link sent successfully! Please check your email.");
        
        // Rediriger manuellement vers la page de reset après un délai
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(data.email)}`);
        }, 2000);
        
        return;
      }
      
      // Si succès normal (200)
      if (response.status === 200) {
        setMessage("Reset link sent successfully! Redirecting...");
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(data.email)}`);
        }, 1500);
      }
      
    } catch (error: any) {
      console.error("Error sending reset link:", error);
      
      if (error.response?.status === 302) {
        // L'API a retourné une redirection, mais on veut la gérer
        setMessage("Reset link sent successfully! Redirecting...");
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(data.email)}`);
        }, 1500);
      } else {
        setMessage("Failed to send reset link. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="wrapper">
      {/* Colonne image */}
      <div className="hero">
        <img 
          src="https://images.unsplash.com/photo-1579546929662-711aa81148cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" 
          alt="Password recovery" 
        />
        <div className="hero-caption">
          Recover Your Account Access
        </div>
      </div>

      {/* Colonne formulaire */}
      <div className="signin">
        <div className="app-header">
          <h1>Reset Password</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h4>Forgot Password</h4>
          <hr />

          {message && (
            <div className={`p-3 mb-4 rounded ${
              message.includes("Failed") 
                ? "bg-red-100 text-red-700 border border-red-200" 
                : "bg-green-100 text-green-700 border border-green-200"
            }`}>
              {message}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label>Email</label>
            <div className="relative">
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email format"
                  }
                })}
                className="input"
                placeholder="Enter your email"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>
            {errors.email && (
              <p className="error flex items-center mt-1">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email.message}
              </p>
            )}
          </div>

          <button 
            type="submit" 
            className="submit w-full flex items-center justify-center" 
            disabled={isSubmitting || loading}
          >
            {(isSubmitting || loading) ? (
              <>
                <Spinner />
                <span className="ml-2">Processing...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Reset Link
              </>
            )}
          </button>
          
          <div className="text-center mt-4">
            <Link to="/login" className="text-blue-600 hover:underline flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}