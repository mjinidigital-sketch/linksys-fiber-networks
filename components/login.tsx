"use client";

import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

import { LoginSchema } from "@/app/schemas/auth";
import { authClient } from "@/lib/auth-client";

import { Card, CardContent, CardTitle } from "./ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { toast } from "./ui/toast";

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectUrl =
    searchParams.get("redirect") || "/admin";

  const [isPending, startTransition] = useTransition();
  const [loginStarted, setLoginStarted] = useState(false);

  const {
    isLoading: convexLoading,
    isAuthenticated,
  } = useConvexAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  /*
   * Redirect ONLY after Convex confirms authentication.
   *
   * This prevents:
   *
   * Better Auth → /admin → Convex says unauthenticated
   * → /auth/login
   *
   * from happening because of a timing race.
   */
  useEffect(() => {
    if (!loginStarted) return;

    if (convexLoading) return;

    if (isAuthenticated) {
      router.replace(redirectUrl);
    }
  }, [
    loginStarted,
    convexLoading,
    isAuthenticated,
    redirectUrl,
    router,
  ]);

  async function onSubmit(values: LoginFormValues) {
    if (isPending) return;

    startTransition(async () => {
      try {
        const result = await authClient.signIn.email({
          email: values.email.trim(),
          password: values.password,
        });

        if (result.error) {
          toast.add({
            title: "Login Failed",
            description:
              result.error.message ||
              "Invalid email or password.",
            type: "error",
          });

          return;
        }

        /*
         * Tell the component that a login has started.
         * We do NOT redirect here.
         *
         * Convex must first recognize the new session.
         */
        setLoginStarted(true);

        toast.add({
          title: "Login Successful",
          description: "Authenticating your account...",
          type: "success",
        });
      } catch (error) {
        console.error("Login error:", error);

        toast.add({
          title: "Login Failed",
          description:
            "Something went wrong while signing in. Please try again.",
          type: "error",
        });
      }
    });
  }

  /*
   * We have successfully logged in and are waiting for
   * Convex to recognize the session.
   */
  if (loginStarted && !isAuthenticated) {
    return (
      <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />

        <p className="text-sm font-medium">
          {convexLoading
            ? "Authenticating..."
            : "Verifying your account..."}
        </p>

        <p className="text-xs text-muted-foreground">
          Please wait a moment.
        </p>
      </div>
    );
  }

  /*
   * Convex already knows the user is authenticated.
   * Avoid showing the login form again.
   */
  if (isAuthenticated) {
    return (
      <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />

        <p className="text-sm font-medium">
          Redirecting...
        </p>
      </div>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-md border-border/60 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="px-6 pb-4 pt-6 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Login to your Account
        </CardTitle>
      </div>

      <Separator />

      <CardContent className="p-6">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-0"
        >
          <FieldGroup className="gap-y-4">

            {/* Email */}
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="email">
                    Email
                  </FieldLabel>

                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />

                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />

            {/* Password */}
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="password">
                    Password
                  </FieldLabel>

                  <Input
                    {...field}
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />

                  <FieldDescription>
                    <div className="mt-2 text-right text-sm">
                      <Link
                        href="/auth/forgot-password"
                        className="text-primary transition-colors hover:text-primary/80 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </FieldDescription>

                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />

            {/* Submit */}
            <Field className="pt-2">
              <Button
                type="submit"
                variant="secondary"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Logging In...
                  </>
                ) : (
                  "Login"
                )}
              </Button>

              <FieldDescription className="mt-3 text-center">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/sign-up"
                  className="font-medium underline transition-colors hover:text-primary"
                >
                  Sign up
                </Link>
              </FieldDescription>
            </Field>

          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}