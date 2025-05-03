"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  Eye,
  EyeOff,
  Github,
  Lock,
  Mail,
  ShoppingBag,
  ShoppingBasketIcon,
  User,
} from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

const signUpSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function AuthForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState({
    signin: false,
    signup: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSignInSubmit(values: z.infer<typeof signInSchema>) {
    setIsLoading((prev) => ({ ...prev, signin: true }));
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        toast.error(result.error);
        throw new Error(result.error);
      }

      router.push("/dashboard");
    } catch (error) {
      signInForm.setError("root", {
        type: "manual",
        message: String(error) ?? "Invalid credentials",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, signin: false }));
    }
  }

  async function onSignUpSubmit(values: z.infer<typeof signUpSchema>) {
    setIsLoading((prev) => ({ ...prev, signup: true }));
    try {
      // First create the user
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: values.name,
          email: values.email,
          password: values.password,
          repeatPassword: values.confirmPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error);
        throw new Error(error.error);
      }

      // Then sign in the user
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        toast.error(result.error);
        throw new Error(result.error);
      }

      router.push("/dashboard");
    } catch (error) {
      signUpForm.setError("root", {
        type: "manual",
        message: String(error) ?? "Invalid credentials",
      });
    } finally {
      toast.error("Invalid credentials");
      setIsLoading((prev) => ({ ...prev, signup: false }));
    }
  }

  async function handleGitHubSignIn() {
    try {
      const result = await signIn("github", { redirect: true });
      if (result?.error) {
        toast.error(result.error);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to sign in with GitHub");
    }
  }
  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
        <TabsTrigger
          value="signin"
          className="text-base data-[state=active]:bg-black data-[state=active]:text-white transition-all duration-300"
        >
          Sign In
        </TabsTrigger>
        <TabsTrigger
          value="signup"
          className="text-base data-[state=active]:bg-black data-[state=active]:text-white transition-all duration-300"
        >
          Sign Up
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="signin"
        className="animate-in fade-in-50 duration-300"
      >
        <Card className="border-gray-200 bg-white text-black shadow-xl shadow-black/5">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShoppingBag className="h-6 w-6 text-black" />
              <CardTitle className="text-2xl text-center">
                Welcome back
              </CardTitle>
            </div>
            <CardDescription className="text-center text-gray-500">
              Enter your Credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...signInForm}>
              <form
                onSubmit={signInForm.handleSubmit(onSignInSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="you@example.com"
                            className="pl-10 border-gray-200 bg-gray-50 focus-visible:ring-black"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signInForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            className="pl-10 pr-10 border-gray-200 bg-gray-50 focus-visible:ring-black"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-10 w-10 text-gray-400 hover:text-black"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <Button
                  disabled={isLoading.signin}
                  type="submit"
                  className="w-full bg-black hover:bg-gray-800 text-white transition-all duration-300"
                >
                  Sign In
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="link" className="text-black hover:text-gray-600">
              Forgot your password?
            </Button>
          </CardFooter>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-gray-200 bg-white text-black hover:bg-gray-50 hover:text-black"
            onClick={handleGitHubSignIn}
          >
            <Github className="mr-2 h-4 w-4" />
            Sign in with GitHub
          </Button>
        </Card>
      </TabsContent>

      <TabsContent
        value="signup"
        className="animate-in fade-in-50 duration-300"
      >
        <Card className="border-gray-200 bg-white text-black shadow-xl shadow-black/5">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShoppingBasketIcon className="h-6 w-6 text-black" />
              <CardTitle className="text-2xl text-center">
                Create Your an Account
              </CardTitle>
            </div>
            <CardDescription className="text-center text-gray-500">
              Enter your information to create a new account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...signUpForm}>
              <form
                onSubmit={signUpForm.handleSubmit(onSignUpSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={signUpForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="John Doe"
                            className="pl-10 border-gray-200 bg-gray-50 focus-visible:ring-black"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="you@example.com"
                            className="pl-10 border-gray-200 bg-gray-50 focus-visible:ring-black"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            className="pl-10 pr-10 border-gray-200 bg-gray-50 focus-visible:ring-black"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-10 w-10 text-gray-400 hover:text-black"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            className="pl-10 pr-10 border-gray-200 bg-gray-50 focus-visible:ring-black"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-10 w-10 text-gray-400 hover:text-black"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <Button
                  disabled={isLoading.signup}
                  type="submit"
                  className="w-full bg-gradient-to-r from-black to-gray-800 hover:from-gray-900 hover:to-black text-white transition-all duration-300"
                >
                  Create Account
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 items-center">
            <p className="text-sm text-gray-500">
              By creating an account, you agree to our
            </p>
            <div className="flex space-x-2">
              <Button
                variant="link"
                className="text-black hover:text-gray-600 p-0 h-auto"
              >
                Terms of Service
              </Button>
              <span className="text-gray-500">and</span>
              <Button
                variant="link"
                className="text-black hover:text-gray-600 p-0 h-auto"
              >
                Privacy Policy
              </Button>
            </div>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
