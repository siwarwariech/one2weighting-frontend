import React from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
//import "./SignInForm.css";


type SignInRequest = {
  email: string;
  password: string;
};

type ApiError = {
  message: string;
  field?: "email" | "password";
};

export default function SignInForm() {
  const { signIn, loading } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<SignInRequest>({
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data: SignInRequest) => {
    try {
      await signIn(data);
      toast.success("Connexion réussie !");
      // La navigation est gérée dans le AuthProvider après un signIn réussi
    } catch (error: unknown) {
      // Gestion typée des erreurs
      const apiError = error as ApiError;
      
      // Afficher l'erreur sous le champ concerné
      if (apiError.field === "email") {
        setError("email", {
          type: "manual",
          message: apiError.message
        });
      } else if (apiError.field === "password") {
        setError("password", {
          type: "manual",
          message: apiError.message
        });
      } else {
        // Pour les erreurs générales
        toast.error(apiError.message || "Une erreur est survenue", {
          style: {
            background: '#ef4444',
            color: '#ffffff',
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#ef4444',
          }
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="signup">
      <h4>CONNEXION</h4>
      <hr />

      {/* Global error message */}
      {errors.root && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
          {errors.root.message}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email"
            }
          })}
          className={`input ${errors.email ? "border-red-500" : ""}`}
          aria-invalid={errors.email ? "true" : "false"}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1 mt-4">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters"
            }
          })}
          className={`input ${errors.password ? "border-red-500" : ""}`}
          aria-invalid={errors.password ? "true" : "false"}
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className={`submit mt-6 ${!isValid || loading ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={!isValid || loading}
      >
        {loading ? <Spinner /> : "Sign In"}
      </button>

      <div className="mt-4 text-sm text-center space-y-2">
        <p>
          <Link to="/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
        </p>
        <p>
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </form>
  );
}