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
        // Correction: maxRedirects doit être un nombre, pas un boolean
        maxRedirects: 0, // 0 pour désactiver les redirections
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Accepte les codes 200-399
        }
      });
      
      // Si l'API retourne une redirection (3xx), on la gère manuellement
      if (response.status >= 300 && response.status < 400) {
        setMessage("Reset link sent successfully! Redirecting...");
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(data.email)}`);
        }, 1500);
        return;
      }
      
      // Si succès normal (200-299)
      if (response.status >= 200 && response.status < 300) {
        setMessage("Reset link sent successfully! Redirecting...");
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(data.email)}`);
        }, 1500);
      }
      
    } catch (error: any) {
      console.error("Error sending reset link:", error);
      
      if (error.response?.status === 302) {
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
    <form onSubmit={handleSubmit(onSubmit)} className="signup">
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
        {errors.email && <p className="error">{errors.email.message}</p>}
      </div>

      <button type="submit" className="submit" disabled={isSubmitting || loading}>
        {(isSubmitting || loading) ? <Spinner /> : "Send Reset Link"}
      </button>
      
      <div className="text-center mt-4">
        <Link to="/login" className="text-blue-600 hover:underline">
          ← Back to Login
        </Link>
      </div>
    </form>
  );
}