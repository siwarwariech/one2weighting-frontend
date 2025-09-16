// src/components/Auth/SignUpForm.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import Spinner from "@/components/ui/Spinner";
import axios from 'axios';
import { toast } from "react-hot-toast";

type FormData = {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  password: string;
  accepted: boolean;
};

export default function SignUpForm() {
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      companyName: '',
      email: '',
      password: '',
      accepted: false
    }
  });

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    
    try {
      const payload = {
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        company_name: data.companyName.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password
      };

      console.log("Sending payload:", payload);
      
      await signUp(payload);
      toast.success("Registration successful!");
      navigate("/signin");
    } catch (error) {
      let errorMessage = "An error occurred during registration";
      
      if (axios.isAxiosError(error)) {
        // Network error
        if (error.code === "ERR_NETWORK") {
          errorMessage = "Server connection error";
        } 
        // Backend error (400, 422, etc.)
        else if (error.response) {
          const backendError = error.response.data;
          
          if (backendError.detail) {
            if (Array.isArray(backendError.detail)) {
              errorMessage = backendError.detail.map((err: any) => err.msg).join(", ");
            } else {
              errorMessage = backendError.detail;
            }
          }
        }
      }
      
      console.error("SignUp error:", error);
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="signup space-y-4">
      <h4 className="text-xl font-bold text-center">REGISTRATION</h4>
      <hr className="my-4" />

      {submitError && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {submitError}
        </div>
      )}

        <div className="flex flex-col gap-1">
          <label className="font-medium">Last Name</label>
          <input 
          type="text"
            {...register("lastName", { 
              required: "This field is required",
              minLength: {
                value: 2,
                message: "Minimum 2 characters"
              }
            })} 
            className="input"
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm">{errors.lastName.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium">First Name</label>
          <input 
          type="text"
            {...register("firstName", { 
              required: "This field is required",
              minLength: {
                value: 2,
                message: "Minimum 2 characters"
              }
            })} 
            className="input"
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm">{errors.firstName.message}</p>
          )}
        </div>
      

      <div className="flex flex-col gap-1">
        <label className="font-medium">Company Name</label>
        <input 
        type="text"
          {...register("companyName", { 
            required: "This field is required",
            minLength: {
              value: 2,
              message: "Minimum 2 characters"
            }
          })} 
          className="input"
        />
        {errors.companyName && (
          <p className="text-red-500 text-sm">{errors.companyName.message}</p>
        )}
      </div>
       
      <div className="flex flex-col gap-1">
        <label className="font-medium">Email</label>
        <input
          type="email"
          {...register("email", {
            required: "Email required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email"
            }  
          })}
          className="input"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-medium">Password</label>
        <input
          type="password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Minimum 8 characters"
            },
            validate: {
              hasUpper: v => /[A-Z]/.test(v) || "Need at least 1 uppercase",
              hasNumber: v => /[0-9]/.test(v) || "Need at least 1 number",
              hasSpecial: v => /[!@#$%^&*()]/.test(v) || "Need at least 1 special char"
            }
          })}
          className="input"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          id="terms"
          {...register("accepted", { 
            required: "You must accept the terms and conditions" 
          })} 
          className="h-4 w-4"
        />
        <label htmlFor="terms" className="text-sm">
          I accept the <a href="#" className="text-primary">Terms and Conditions</a>
        </label>
      </div>
      {errors.accepted && (
        <p className="text-red-500 text-sm">{errors.accepted.message}</p>
      )}

      <button 
        type="submit" 
        className="btn-primary flex items-center gap-2 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? <><Spinner /> Processing...</> : "Register"}
      </button>

      <p className="text-center text-sm mt-4">
        Already have an account?{" "}
        <Link to="/signin" className="text-primary font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}