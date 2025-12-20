import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { GraduationCap, ArrowRight, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@shared/routes";

// Define form schemas matching the API types
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  college: z.literal("Alliance University"),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [, setLocation] = useLocation();
  const { loginMutation, registerMutation } = useAuth();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: {
      college: "Alliance University",
    }
  });

  const onSubmit = (data: any) => {
    if (isLogin) {
      loginMutation.mutate(data, {
        onSuccess: () => setLocation("/home"),
      });
    } else {
      registerMutation.mutate(data, {
        onSuccess: () => setLocation("/home"),
      });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-white to-accent/5">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 transform rotate-3">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mt-6">
            CampusRent & Resale
          </h1>
          <p className="text-muted-foreground">
            The exclusive marketplace for Alliance University
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-xl shadow-black/5 backdrop-blur-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1">Username</label>
              <input
                {...registerField("username")}
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                placeholder="Enter your student ID"
              />
              {errors.username && (
                <p className="text-xs text-destructive ml-1">
                  {errors.username.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1">Password</label>
              <input
                type="password"
                {...registerField("password")}
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-xs text-destructive ml-1">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground ml-1">College</label>
                <div className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border text-muted-foreground cursor-not-allowed">
                  Alliance University
                </div>
              </div>
            )}

            <button
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:transform-none transition-all duration-200 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? "New student? Create account" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
