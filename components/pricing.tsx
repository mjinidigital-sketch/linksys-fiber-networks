"use client";

import NumberFlow from "@number-flow/react";
import { CircleCheck, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PricingContent, PricingPlan } from "@/lib/types/content";
import { defaultContent } from "@/lib/default-content";
import * as LucideIcons from "lucide-react";
import Link from "next/link";

type BillingPeriod = "monthly" | "yearly";

const YEARLY_DISCOUNT_PERCENTAGE = 20;

const Pricing = ({ pricing }: { pricing?: PricingContent }) => {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");

  const effectivePricing = (pricing?.plans && pricing.plans.length > 0)
    ? pricing
    : defaultContent.pricing;

  const plans = effectivePricing?.plans ?? [];

  if (!plans.length) return null;

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-10 border-b pb-20 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div className="text-left max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-secondary font-semibold">
            {effectivePricing?.sectionLabel || "Pricing Packages"}
          </p>
          <h2 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight">
            {effectivePricing?.title || "Simple, transparent pricing"}
          </h2>
          {effectivePricing?.subtitle && (
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              {effectivePricing.subtitle}
            </p>
          )}
        </div>

        {/* Monthly / Yearly Billing Toggle */}
        <div className="shrink-0">
          <Tabs
            value={billingPeriod}
            onValueChange={(val) => setBillingPeriod(val as BillingPeriod)}
            className="w-auto"
          >
            <TabsList className="bg-muted/70 p-1">
              <TabsTrigger value="monthly" className="text-xs font-medium">
                Monthly
              </TabsTrigger>
              <TabsTrigger value="yearly" className="text-xs font-medium flex items-center gap-1.5">
                Yearly
                <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 text-[10px] font-bold">
                  Save 20%
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard billingPeriod={billingPeriod} key={plan.id || plan.name} plan={plan} />
        ))}
      </div>
    </section>
  );
};

const PlanCard = ({
  plan,
  billingPeriod,
}: {
  plan: PricingPlan;
  billingPeriod: BillingPeriod;
}) => {
  const price =
    billingPeriod === "yearly"
      ? Math.floor((plan.price * (100 - YEARLY_DISCOUNT_PERCENTAGE)) / 100)
      : plan.price;

  const IconComponent = (plan.icon && (LucideIcons as any)[plan.icon]) || Zap;
  const currencyPrefix = "KES ";

  return (
    <div
      className={cn(
        "rounded-3xl bg-card p-7 shadow-xs ring-1 ring-border/70 border-b-4 border-secondary flex flex-col justify-between transition-all hover:shadow-md",
        {
          "relative bg-secondary/5 ring-2 ring-primary shadow-lg border-b-4 border-primary": plan.isRecommended,
        }
      )}
    >
      <div>
        {plan.isRecommended && (
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 shadow-sm font-semibold">
            Most Popular
          </Badge>
        )}

        <div className="flex items-center gap-3.5 mt-1">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <IconComponent size={28} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-foreground">{plan.name}</h3>
            {plan.isRecommended && (
              <span className="text-[11px] font-medium text-primary">Best Value</span>
            )}
          </div>
        </div>

        {plan.description && (
          <p className="mt-3 text-muted-foreground text-xs leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {plan.description}
          </p>
        )}

        <div className="mt-5 border-y border-border/50 py-3.5">
          <div className="flex items-baseline gap-1">
            <NumberFlow
              className="font-satoshi text-3xl font-bold text-foreground"
              prefix={currencyPrefix}
              value={price}
            />
            <span className="font-normal text-xs text-muted-foreground">
              /{billingPeriod === "yearly" ? "month (billed annually)" : "month"}
            </span>
          </div>
        </div>

        <ul className="space-y-2 mt-5">
          {(plan.features ?? []).map((feature, idx) => (
            <li className="flex items-start gap-2 text-xs text-foreground/90" key={idx}>
              <CircleCheck className="size-4 shrink-0 text-emerald-500 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <Button
          className={cn("w-full font-semibold", plan.isRecommended ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}
          size="lg"
          
        >
          <Link
            href={`https://wa.me/254713366366?text=Hello,%20I'm%20interested%20in%20the%20${encodeURIComponent(plan.name)}%20package`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get Started
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Pricing;
