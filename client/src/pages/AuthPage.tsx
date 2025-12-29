import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Mail, Phone, User, Lock, ShieldCheck } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email").endsWith("@stu.alliance.edu.in", "Only Alliance University student emails are allowed"),
  phone: z.string().min(10, "Invalid phone number"),
});

const verifySchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register" | "verify">("login");
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", email: "", phone: "" },
  });

  const verifyForm = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: { otp: "" },
  });

  const onLogin = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/login", data);
      const user = await res.json();
      localStorage.setItem("user", JSON.stringify(user));
      toast({ title: "Welcome back!", description: "Successfully logged in." });
      setLocation("/home");
    } catch (error: any) {
      if (error.status === 403) {
        const body = await error.json();
        setUserId(body.userId);
        setMode("verify");
        toast({ title: "Account not verified", description: "Please enter the OTP sent to your email." });
      } else {
        toast({ title: "Login failed", description: "Invalid username or password.", variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/register", data);
      const body = await res.json();
      setUserId(body.userId);
      setMode("verify");
      toast({ title: "Registration successful!", description: "Check your email for the simulated OTP." });
    } catch (error: any) {
      const body = await error.json();
      toast({ title: "Registration failed", description: body.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const onVerify = async (data: z.infer<typeof verifySchema>) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/verify", { userId, otp: data.otp });
      const user = await res.json();
      localStorage.setItem("user", JSON.stringify(user));
      toast({ title: "Account verified!", description: "Welcome to CampusRent." });
      setLocation("/home");
    } catch (error: any) {
      toast({ title: "Verification failed", description: "Invalid or expired OTP.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-display font-black text-primary mb-2">CampusRent</h1>
          <p className="text-muted-foreground">Alliance University Marketplace</p>
        </div>

        <Card className="border-border/40 shadow-lg-elevation">
          <CardHeader>
            <CardTitle>{mode === "login" ? "Login" : mode === "register" ? "Create Account" : "Verify OTP"}</CardTitle>
            <CardDescription>
              {mode === "login" 
                ? "Enter your credentials to continue" 
                : mode === "register" 
                ? "Join the Alliance student marketplace" 
                : "Enter the 6-digit code sent to your student email"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === "login" && (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="johndoe" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-10" type="password" placeholder="••••••••" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Login
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button type="button" onClick={() => setMode("register")} className="text-primary font-semibold hover:underline">
                      Register
                    </button>
                  </p>
                </form>
              </Form>
            )}

            {mode === "register" && (
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="johndoe" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="name@stu.alliance.edu.in" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="+91 00000 00000" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-10" type="password" placeholder="••••••••" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Account
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setMode("login")} className="text-primary font-semibold hover:underline">
                      Login
                    </button>
                  </p>
                </form>
              </Form>
            )}

            {mode === "verify" && (
              <Form {...verifyForm}>
                <form onSubmit={verifyForm.handleSubmit(onVerify)} className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <ShieldCheck className="w-12 h-12 text-primary animate-pulse" />
                  </div>
                  <FormField
                    control={verifyForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-center block">6-Digit OTP</FormLabel>
                        <FormControl>
                          <Input className="text-center text-2xl tracking-[1em] h-14" maxLength={6} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Verify Account
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    OTP is simulated. Check the server logs (backend) to find the code.
                  </p>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
