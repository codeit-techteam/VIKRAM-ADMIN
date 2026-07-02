import { Layers } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { GlassInfoCard } from "@/components/shared/GlassInfoCard";
import { StatItem } from "@/components/shared/StatItem";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  AUTH_COPY,
  AUTH_HERO_COPY,
  AUTH_HERO_STATS,
} from "@/constants/auth.constants";
import { AuthHeroPanel } from "@/features/auth/components/AuthHeroPanel";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <AuthLayout
      breadcrumb={AUTH_COPY.breadcrumb}
      hero={
        <AuthHeroPanel
          statusBadge={
            <StatusBadge label={AUTH_HERO_COPY.statusLabel} variant="success" />
          }
          glassCard={
            <GlassInfoCard
              icon={Layers}
              title={AUTH_HERO_COPY.cardTitle}
              description={AUTH_HERO_COPY.cardDescription}
            >
              <div className="flex gap-6">
                {AUTH_HERO_STATS.map((stat, index) => (
                  <StatItem
                    key={stat.label}
                    value={stat.value}
                    label={stat.label}
                    showDivider={index > 0}
                  />
                ))}
              </div>
            </GlassInfoCard>
          }
        />
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
