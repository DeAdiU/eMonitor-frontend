// LoginComponent.jsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";


export default function LoginComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  async function onSubmit (values) {
    setIsLoading(true);
    try {
      await login(email,password);
    //   form.reset();  

    } catch (error) {
      console.log(error);
      
    }finally {
        setIsLoading(false);
    }
    // Here you would typically send the data to your API
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md bg-white shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-slate-900">Welcome back</CardTitle>
          <CardDescription className="text-center text-slate-600">
            Login to your Acme Inc account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-700">Password</Label>
              <Link 
                href="#" 
                className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" 
            type="submit"
            onClick={onSubmit}
          >
            Login
          </Button>
        </CardContent>
        <div className="px-6 pb-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
          </div>
        </div>
        <CardFooter className="flex flex-col space-y-4 pt-4">
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/auth?mode=register" className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium">
              Sign up
            </Link>
          </div>
          <div className="text-center text-xs text-slate-500 mt-6">
            By clicking continue, you agree to our{" "}
            <Link href="#" className="text-slate-600 hover:underline">
              Terms of Service
            </Link>
            {" "}and{" "}
            <Link href="#" className="text-slate-600 hover:underline">
              Privacy Policy
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}