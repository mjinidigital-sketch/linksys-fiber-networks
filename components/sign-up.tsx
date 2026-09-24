"use client";
import { Controller, useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupSchema } from "@/app/schemas/auth";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
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
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SignUp() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/";
  const syncUserMutation = useMutation(api.users.syncUser);

  const form = useForm<z.infer<typeof SignupSchema>>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof SignupSchema>) {
    startTransition(async () => {
      const { data, error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.add({
          title: "Sign up Failed",
          description: error.message || "Failed to create account",
          type: "error",
        });
        return;
      }

      if (data?.user) {
        try {
          await syncUserMutation({
            userId: data.user.id,
            email: data.user.email,
            name: data.user.name,
            image: data.user.image ?? undefined,
          });
        } catch {
          // Handled by backend hook as well
        }
      }

      toast.add({
        title: "Account Created",
        description: "Account created successfully",
        type: "success",
      });
      router.push(redirectParam.startsWith("/admin") ? "/" : redirectParam);
      router.refresh();
    });
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-border/60 backdrop-blur-sm">
      <div className="pt-6 pb-4 px-6 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
        <CardDescription className="mt-1">
          Enter your details below to register
        </CardDescription>
      </div>
      <Separator />
      <CardContent className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-y-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    placeholder=""
                    autoComplete="name"
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
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder=""
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
                    autoComplete="new-password"
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
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                  <Input
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    type="password"
                    autoComplete="new-password"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Field className="pt-2">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating an account...
                  </>
                ) : (
                  "Create an account"
                )}
              </Button>
              <FieldDescription className="text-center mt-3">
                Already have an account?{" "}
                <Link href="/auth/login" className="underline font-medium hover:text-primary transition-colors">
                  Login
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}