// ResetPasswordForm.tsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthProvider";
import Spinner from "@/components/ui/Spinner";
import { toast } from "react-hot-toast";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import api from "@/services/api";

type FormData = { 
    code: string;
    newPassword: string;
    confirmPassword: string;
};

export default function ResetPasswordForm() {
    const { loading } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get("email");
    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>();
    const [isResetting, setIsResetting] = useState(false);
    const [passwordReset, setPasswordReset] = useState(false);
    const [passwordRequirements, setPasswordRequirements] = useState({
        minLength: 8,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false
    });

    const newPassword = watch("newPassword", "");

    // Vérifier les exigences du mot de passe en temps réel
    useEffect(() => {
        setPasswordRequirements({
            minLength: newPassword.length >= 8,
            hasUpperCase: /[A-Z]/.test(newPassword),
            hasLowerCase: /[a-z]/.test(newPassword),
            hasNumber: /[0-9]/.test(newPassword),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
        });
    }, [newPassword]);

    const validatePassword = (password: string) => {
        const requirements = {
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        return Object.values(requirements).every(Boolean);
    };

    const onSubmit = async (data: FormData) => {
        if (!email) {
            toast.error("Email is required");
            return;
        }

        if (data.newPassword !== data.confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        // Valider le mot de passe
        if (!validatePassword(data.newPassword)) {
            toast.error("Password does not meet security requirements");
            return;
        }

        setIsResetting(true);
        try {
            // Appel à l'API pour réinitialiser le mot de passe
            await api.post('/auth/reset-password', {
                email: email,
                code: data.code,
                new_password: data.newPassword
            });
            
            setPasswordReset(true);
            toast.success("Password reset successfully!");
            
            // Redirection vers la page de login après 2 secondes
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error: any) {
            console.error("Reset error:", error);
            const errorMessage = error.response?.data?.detail || 
                               error.response?.data?.error || 
                               "Error resetting password. Please check your code and try again.";
            toast.error(errorMessage);
        } finally {
            setIsResetting(false);
        }
    };

    if (passwordReset) {
        return (
            <div className="signup">
                <h4>Password Reset Successful!</h4>
                <hr />
                <div className="text-center py-4">
                    <div className="text-green-500 text-5xl mb-4">✓</div>
                    <p className="text-lg mb-2">Your password has been reset successfully.</p>
                    <p>You can now login with your new password.</p>
                    <div className="mt-4">
                        <Link to="/login" className="text-blue-600 hover:underline">
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="signup">
            <h4>Reset Your Password</h4>
            <hr />
            
            {email && (
                <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm font-medium">Resetting password for: <strong>{email}</strong></p>
                    <p className="text-xs text-blue-600 mt-1">
                        Check your email for the verification code we just sent you.
                    </p>
                </div>
            )}
            
            <div className="flex flex-col gap-1">
                <label>Verification Code</label>
                <input
                    type="text"
                    {...register("code", {
                        required: "Verification code is required",
                        minLength: {
                            value: 6,
                            message: "Code must be at least 6 characters"
                        }
                    })}
                    className="input"
                    placeholder="Enter the 6-digit code from your email"
                />
                {errors.code && <p className="error">{errors.code.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
                <label>New Password</label>
                <input
                    type="password"
                    {...register("newPassword", {
                        required: "New password is required",
                        minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters"
                        },
                        validate: {
                            hasUpperCase: value => /[A-Z]/.test(value) || "At least one uppercase letter",
                            hasLowerCase: value => /[a-z]/.test(value) || "At least one lowercase letter",
                            hasNumber: value => /[0-9]/.test(value) || "At least one number",
                            hasSpecialChar: value => /[!@#$%^&*(),.?":{}|<>]/.test(value) || "At least one special character"
                        }
                    })}
                    className="input"
                    placeholder="Enter your new password"
                />
                
                {/* Affichage des exigences du mot de passe */}
                {newPassword && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <p className="font-medium mb-1">Password must contain:</p>
                        <ul className="space-y-1">
                            <li className={passwordRequirements.minLength ? "text-green-600" : "text-red-600"}>
                                • At least 8 characters
                            </li>
                            <li className={passwordRequirements.hasUpperCase ? "text-green-600" : "text-red-600"}>
                                • One uppercase letter (A-Z)
                            </li>
                            <li className={passwordRequirements.hasLowerCase ? "text-green-600" : "text-red-600"}>
                                • One lowercase letter (a-z)
                            </li>
                            <li className={passwordRequirements.hasNumber ? "text-green-600" : "text-red-600"}>
                                • One number (0-9)
                            </li>
                            <li className={passwordRequirements.hasSpecialChar ? "text-green-600" : "text-red-600"}>
                                • One special character (!@#$%^&* etc.)
                            </li>
                        </ul>
                    </div>
                )}
                
                {errors.newPassword && <p className="error">{errors.newPassword.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
                <label>Confirm New Password</label>
                <input
                    type="password"
                    {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: value => value === watch("newPassword") || "Passwords don't match"
                    })}
                    className="input"
                    placeholder="Confirm your new password"
                />
                {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}
            </div>

            <button 
                type="submit" 
                className="submit" 
                disabled={isResetting || loading}
            >
                {isResetting ? <Spinner /> : "Reset Password"}
            </button>
            
            <div className="text-center mt-4">
                <Link to="/forgot-password" className="text-blue-600 hover:underline">
                    ← Back to Forgot Password
                </Link>
            </div>
        </form>
    );
}