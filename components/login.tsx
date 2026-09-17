"use client";

import { Controller, useForm } from "react-hook-form";
import { Card, CardContent, CardTitle } from "./ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/app/schemas/auth";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { toast } from "./ui/toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/admin";
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof LoginSchema>) {
    startTransition(async () => {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.add({
          title: "Login Failed",
          description: error.message || "Invalid email or password",
          type: "error",
        });
        return;
      }

      toast.add({
        title: "Login Successful",
        description: "Welcome back!",
        type: "success",
      });
      router.push(redirectUrl);
    });
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-border/60 backdrop-blur-sm">
      <div className="pt-6 pb-4 px-6 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Login to your Account</CardTitle>
      </div>
      <Separator />
      <CardContent className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-y-4">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    type="password"
                    autoComplete="current-password"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    <p className='mt-2 text-right text-sm'>
                      <Link href='/auth/forgot-password' className='text-primary dark:text-secondary hover:text-primary/80 hover:underline'>Forgot password?</Link>
                    </p>
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
               
              )}
            />

            <Field className="pt-2">
              <Button type="submit" className="w-full" disabled={isPending} variant="secondary">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging In...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
              <FieldDescription className="text-center mt-3">
                Don&apos;t have an account?{" "}
                <Link href="/auth/sign-up" className="underline font-medium hover:text-primary transition-colors">
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