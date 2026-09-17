"use client";

import NumberFlow from "@number-flow/react";
import { CircleCheck, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PricingContent, PricingPlan } from "@/lib/types/content";
import * as LucideIcons from "lucide-react";
import Link from "next/link";

type BillingPeriod = "monthly" | "yearly";

const YEARLY_DISCOUNT_PERCENTAGE = 20;

const Pricing = ({ pricing }: { pricing?: PricingContent }) => {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("yearly");

  const plans = pricing?.plans ?? [];

  if (!plans.length) return null;

  const handleBillingPeriodChange = (value: string) => {
    setBillingPeriod(value as BillingPeriod);
  };

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-12 border-b pb-20">
      <div className="text-left">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-secondary">
          {pricing?.sectionLabel || "Pricing"}
        </p>
        <h2 className="mt-4 text-4xl md:text-5xl font-bold ">
          {pricing?.title || "Simple, transparent pricing"}
        </h2>
        {pricing?.subtitle && (
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            {pricing.subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
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

  const Icon = (plan.icon && (LucideIcons as any)[plan.icon]) || Zap;

  return (
    <div
      className={cn("rounded-3xl bg-card p-8 shadow-xs/3 ring ring-border/85 border-b-4 border-secondary", {
        "relative bg-secondary/5 ring-2 ring-primary": plan.isRecommended,
      })}
    >
      {plan.isRecommended && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Most Popular
        </Badge>
      )}
      <div className="mt-4 flex justify-start items-center gap-4"><Icon className="text-primary dark:text-accent-foreground" size={42} />

      <div className="flex mt-2 gap-1">
        <h3 className="font-bold text-2xl text-primary dark:text-accent-foreground">{plan.name}</h3>
      </div></div>
      <p className="mt-2 min-h-[2lh] text-muted-foreground text-sm line-clamp-2">
        {plan.description}
      </p>
      <p className="mt-4 font-semibold text-4xl">
        <NumberFlow className="font-satoshi" prefix="$" value={price} />
        <span className="ms-0.5 font-normal text-lg text-muted-foreground tracking-tight">
          /month
        </span>
      </p>
      
      <ul className="space-y-2 mt-4">
        {plan.features.map((feature, idx) => (
          <li className="flex items-center gap-2 text-sm" key={idx}>
            <CircleCheck className="size-4 shrink-0 text-secondary" />
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-8">
      <Button  className="w-full bg-secondary " size="lg">
   <Link href="https://wa.me/254713366366"  target="_blank" rel="noopener noreferrer" >Get Started</Link>
      </Button>
      </div>
    </div>
  );
};

export default Pricing;
