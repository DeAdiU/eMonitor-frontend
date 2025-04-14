// RegisterComponent.jsx
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Create schema for form validation
const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  first_name: z.string(),
  last_name: z.string(),
  confirm_password: z.string(),
  role: z.enum(["student", "teacher", "admin"]),
  enrollment_year: z.number().min(2000).max(2030),
  graduation_year: z.number().min(2000).max(2040),
  date_of_birth: z.string(),
  phone_number: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

export default function RegisterComponent() {

    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
    
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
      role: "student",
      enrollment_year: 2024,
      graduation_year: 2028,
      date_of_birth: "",
      phone_number: "",
    },
  });

  async function onSubmit (values) {
    setIsLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register/', values);
      console.log(response);
      if (response.data.message) {
        setMessage(response.data.message);
        toast(response.data.message);
      }
      router.push('/auth?mode=login');
    //   form.reset();

    } catch (error) {
      console.log(error);
      
    }finally {
        setIsLoading(false);
    }
    // Here you would typically send the data to your API
  };

  // Generate years for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted py-8 px-4">
      <Card className="w-full max-w-4xl bg-white shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-slate-900">Create an account</CardTitle>
          <CardDescription className="text-center text-slate-600">
            Join Acme Inc to start your journey
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 sm:px-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* First name */}
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">First Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John" 
                          {...field} 
                          className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Last Name */}
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          placeholder="Doe" 
                          {...field} 
                          className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Username */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="johndoe32" 
                          {...field} 
                          className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="your.email@example.com" 
                          {...field} 
                          className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="********" 
                          {...field} 
                          className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="********" 
                          {...field} 
                          className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Role */}
                {/* <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                /> */}

                {/* Date of Birth */}
                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Date of Birth</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Enrollment Year */}
                <FormField
                  control={form.control}
                  name="enrollment_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Enrollment Year</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Graduation Year */}
                <FormField
                  control={form.control}
                  name="graduation_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Graduation Year</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year + 4} value={(year + 4).toString()}>
                              {year + 4}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="+1234567890" 
                          {...field} 
                          className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-8"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <div className="px-10 pb-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
          </div>
        </div>

        <CardFooter className="flex flex-col space-y-4 pt-4 px-10">
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth?mode=login" className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium">
              Login instead
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