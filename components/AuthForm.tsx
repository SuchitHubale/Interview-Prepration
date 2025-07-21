"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth, googleProvider, githubProvider } from "@/firebase/client";
import { GoogleAuthProvider } from "firebase/auth";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";
import { FormType } from "@/types";
import React, { useState } from "react";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();
        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          idToken,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Account created successfully.");
        router.push("/");
      } else {
        const { email, password } = data;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.error("Sign in Failed. Please try again.");
          return;
        }

        await signIn({
          email,
          idToken,
        });

        toast.success("Signed in successfully.");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result?.user;

      if (!user) {
        toast.error("Google popup did not return a user.");
        return;
      }

      const idToken = await user.getIdToken();
      if (!idToken) {
        toast.error("Could not get ID token from Google user.");
        return;
      }

      const name = user.displayName;
      const email = user.email;

      if (!name || !email) {
        toast.error("Google user does not have a valid name or email.");
        return;
      }

      const signUpResult = await signUp({
        uid: user.uid,
        name,
        email,
        idToken,
      });

      if (!signUpResult.success && signUpResult.message.includes("already exists")) {
        console.log("User already exists. Proceeding to sign in.");
      } else if (!signUpResult.success) {
        toast.error(signUpResult.message || "Sign-up failed.");
        return;
      }

      const signInResult = await signIn({
        email: user.email!,
        idToken,
      });


      toast.success("Signed in successfully.");
      router.push("/");
    } catch (error) {
      console.log("Error in signInWithGoogle:", error);
      toast.error(`There was an error: ${error}`);
    }
  };

  const signInWithGithub = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result?.user;

      if (!user) {
        toast.error("Github popup did not return a user. This may be due to a popup blocker. Please allow popups and try again.");
        setLoading(false);
        return;
      }

      const idToken = await user.getIdToken();
      if (!idToken) {
        toast.error("Could not get ID token from Github user.");
        setLoading(false);
        return;
      }

      let name = user.displayName;
      let email = user.email;

      // If email or name is missing, prompt user to enter it
      if (!name || !email) {
        toast.error("Your GitHub account does not have a public name or email. Please update your GitHub profile or use another sign-in method.");
        setLoading(false);
        return;
      }

      const signUpResult = await signUp({
        uid: user.uid,
        name,
        email,
        idToken,
      });

      if (!signUpResult.success && signUpResult.message.includes("already exists")) {
        console.log("User already exists. Proceeding to sign in.");
      } else if (!signUpResult.success) {
        toast.error(signUpResult.message || "Sign-up failed.");
        setLoading(false);
        return;
      }

      const signInResult = await signIn({
        email: user.email!,
        idToken,
      });

      if (!signInResult || !signInResult.success) {
        toast.error((signInResult && signInResult.message) || "Sign-in failed.");
        setLoading(false);
        return;
      }

      toast.success("Signed in successfully.");
      router.push("/");
    } catch (error: any) {
      if (error?.code === 'auth/popup-blocked') {
        toast.error("Popup was blocked. Please allow popups and try again.");
      } else {
        console.log("Error in signInWithGithub:", error);
        toast.error(`There was an error: ${error?.message || error}`);
      }
    } finally {
      setLoading(false);
    }
  };



  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">Intervue.AI</h2>
        </div>

        <h3>{isSignIn ? "Sign in to your existing account" : "Create a new account"}</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (

              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your Name"
                type="text" />
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

            <Button className="btn" type="submit">
              {isSignIn ? "Sign In" : "Create an Account"}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? "No account yet?" : "Have an account already?"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-user-primary ml-1"
          >
            {!isSignIn ? "Sign In" : "Sign Up"}
          </Link>
        </p>
        <div className="flex flex-row gap-2">
          <button
            onClick={signInWithGoogle}
            type="button"
            className="w-full flex items-center justify-center gap-3 mt-2 bg-white border border-gray-300 text-gray-700 font-medium text-sm rounded-lg shadow-lg hover:bg-black hover:text-white hover:shadow-xl transition-all duration-300 ease-out px-4 py-2"
            style={{ height: 40, minWidth: 200 }}
          >
            <span className="flex items-center justify-center mr-2">
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <g>
                  <path d="M17.64 9.2045c0-.638-.0573-1.2527-.1636-1.8363H9v3.4818h4.8445c-.2082 1.1218-.8345 2.0736-1.7764 2.7136v2.2582h2.8736C16.3464 14.1627 17.64 11.9273 17.64 9.2045z" fill="#4285F4" />
                  <path d="M9 18c2.43 0 4.4673-.8064 5.9564-2.1864l-2.8736-2.2582c-.7973.5345-1.8136.8491-3.0827.8491-2.3709 0-4.3818-1.6018-5.0982-3.7573H.9391v2.3218C2.4227 16.875 5.4818 18 9 18z" fill="#34A853" />
                  <path d="M3.9018 10.6473c-.1818-.5345-.2864-1.1045-.2864-1.6473s.1045-1.1127.2864-1.6473V5.0309H.9391C.3409 6.2582 0 7.5791 0 9c0 1.4209.3409 2.7418.9391 3.9691l2.9627-2.3218z" fill="#FBBC05" />
                  <path d="M9 3.5791c1.3227 0 2.5045.4545 3.4364 1.3455l2.5773-2.5773C13.4645.8064 11.4273 0 9 0 5.4818 0 2.4227 1.125 0 3.0309l2.9627 2.3218C4.6182 5.1809 6.6291 3.5791 9 3.5791z" fill="#EA4335" />
                </g>
              </svg>
            </span>
            <span>Continue With Google</span>
          </button>
          <button
            onClick={signInWithGithub}
            type="button"
            className="w-full flex items-center justify-center gap-3 mt-2 bg-white border border-gray-300 text-gray-700 font-medium text-sm rounded-lg shadow-lg hover:bg-black hover:text-white hover:shadow-xl transition-all duration-300 ease-out px-4 py-2"
            style={{ height: 40, minWidth: 200, opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}
            disabled={loading}
          >
            <span className="flex items-center justify-center mr-2">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" fill="#181717"/>
              </svg>
            </span>
            <span>{loading ? 'Processing...' : 'Continue With GitHub'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
