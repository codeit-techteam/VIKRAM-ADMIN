"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { IconInput } from "@/components/ui/icon-input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AUTH_COPY, AUTH_ASSETS } from "@/constants/auth.constants";
import { ROUTES } from "@/constants/routes";
import {
  loginSchema,
  type LoginSchema,
} from "@/features/auth/schema/login.schema";
import {
  getDevAuthResponse,
  validateDevCredentials,
} from "@/services/dev-auth";
import { useAuthStore } from "@/store/auth-store";
import { notify } from "@/utils/notify";

const defaultValues: z.input<typeof loginSchema> = {
  email: "",
  password: "",
  rememberMe: false,
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay, ease: "easeOut" as const },
  }),
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof loginSchema>, unknown, LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      if (!validateDevCredentials(values)) {
        notify.error("Invalid email or password");
        return;
      }

      const { user, tokens } = getDevAuthResponse();
      login(user, tokens.accessToken, tokens.refreshToken);

      notify.success("Signed in successfully");

      const callbackUrl = searchParams.get("callbackUrl") ?? ROUTES.DASHBOARD;
      router.push(callbackUrl);
      router.refresh();
    } catch {
      notify.error("Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  });

  const motionProps = mounted
    ? { initial: "hidden" as const, animate: "visible" as const }
    : { initial: false as const, animate: false as const };

  return (
    <motion.form
      onSubmit={onSubmit}
      className="flex flex-col gap-7"
      noValidate
      {...motionProps}
    >
      <motion.div
        className="flex flex-col items-center gap-5 text-center"
        custom={0}
        variants={fadeUp}
      >
        <div className="relative size-[72px] overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] ring-1 ring-neutral-100">
          <Image
            src={AUTH_ASSETS.logo}
            alt="Bajriwala logo"
            fill
            className="object-contain p-2"
            priority
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-[1.75rem] font-bold tracking-tight text-neutral-900">
            {AUTH_COPY.heading}
          </h1>
          <p className="max-w-[300px] text-sm leading-relaxed text-neutral-500">
            {AUTH_COPY.subtext}
          </p>
        </div>
      </motion.div>

      <motion.div className="space-y-4" custom={0.1} variants={fadeUp}>
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-neutral-700"
          >
            {AUTH_COPY.emailLabel}
          </Label>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <IconInput
                id="email"
                icon={Mail}
                type="email"
                autoComplete="email"
                placeholder={AUTH_COPY.emailPlaceholder}
                aria-invalid={!!errors.email}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            )}
          />
          {errors.email ? (
            <p className="text-destructive text-sm">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-neutral-700"
            >
              {AUTH_COPY.passwordLabel}
            </Label>
            <Link
              href="/forgot-password"
              className="text-primary text-xs font-medium transition-colors hover:text-[#e66000] hover:underline"
            >
              {AUTH_COPY.forgotPassword}
            </Link>
          </div>

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <PasswordInput
                id="password"
                autoComplete="current-password"
                placeholder={AUTH_COPY.passwordPlaceholder}
                aria-invalid={!!errors.password}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            )}
          />

          {errors.password ? (
            <p className="text-destructive text-sm">
              {errors.password.message}
            </p>
          ) : null}
        </div>
      </motion.div>

      <motion.div
        className="flex items-center gap-2.5"
        custom={0.15}
        variants={fadeUp}
      >
        <Controller
          control={control}
          name="rememberMe"
          render={({ field }) => (
            <>
              <Checkbox
                id="rememberMe"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <Label
                htmlFor="rememberMe"
                className="cursor-pointer text-sm font-normal text-neutral-600"
              >
                {AUTH_COPY.rememberMe}
              </Label>
            </>
          )}
        />
      </motion.div>

      <motion.div custom={0.2} variants={fadeUp}>
        <motion.div whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.01 }}>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary h-12 w-full rounded-xl text-sm font-semibold text-white shadow-[0_4px_14px_rgba(255,107,0,0.35)] transition-shadow hover:bg-[#e66000] hover:shadow-[0_6px_20px_rgba(255,107,0,0.4)]"
          >
            {isSubmitting ? "Signing in…" : AUTH_COPY.signInCta}
            {!isSubmitting ? (
              <ArrowRight className="size-4" aria-hidden="true" />
            ) : null}
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        className="flex items-center justify-center gap-2 text-[10px] font-medium tracking-wider text-neutral-400 uppercase"
        custom={0.25}
        variants={fadeUp}
      >
        <ShieldCheck
          className="size-3.5 shrink-0 text-neutral-300"
          aria-hidden="true"
        />
        <span>{AUTH_COPY.securityFooter}</span>
      </motion.div>
    </motion.form>
  );
}
