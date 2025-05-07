"use client";

import React, { use } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Form
} from "@/components/ui/form";
import Image from "next/image";
import { toast } from "sonner";
import FormField from "@/components/FormField";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/client";
import { signIn, signUp } from "@/lib/actions/auth.action";
import { sign } from "crypto";

const formSchema = z.object({
  username: z.string().min(2).max(50),
});

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(2) : z.string().optional(),
    email: z.string().email().min(2).max(50),
    password: z.string().min(8).max(20),
  });
}

const AuthForm = ({ type }: { type : FormType }) => {
  const router = useRouter();
  const formSchema = authFormSchema(type);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if(type === 'sign-up') {
        const { name, email, password } = values;

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        })

        if(!result?.success) {
          toast.error(result?.message || "An error occurred during sign up");
          return;
        }

        toast.success("Account created successfully!. Please sign in to continue.");
        router.push('/sign-in');
      }
      else {
        const { email, password } = values;

        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        const idToken = await userCredential.user.getIdToken();

        if(!idToken) {
          toast.error("An error occurred during sign in. Please try again later.");
          return;
        }

        await signIn({
          email,
          idToken
        })

        toast.success("Logged in successfully!");
        router.push('/');
      }
    }catch (error) {
      console.log(error);
      toast.error(`There was an error :$(error}`);
    }
  }

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} style={{ width: 'auto', height: 'auto' }} />
          <h2 className="text-primary-100">PrepWise</h2>
        </div>
        <h3>Practice job interviews with AI</h3>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your name"
              />
            )}
            <FormField
                control={form.control}
                name="email"
                label="Email"
                placeholder="Your email address"
                type="email"
              />
            <FormField
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter your password"
                type="password"
              />
            <Button className="btn" type="submit">{isSignIn ? 'Sign in' : 'Create an Account'}</Button>
          </form>
        </Form>

        <p className="text-center">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}
            <Link href={!isSignIn ? "/sign-in" : "/sign-up"} className="font-bold text-user-primary ml-1">
                {!isSignIn ? "Sign in" : "Sign up"}
            </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
