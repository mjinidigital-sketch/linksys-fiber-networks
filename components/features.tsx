import {
  ArrowUpRight,
  Smile,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { FeaturesContent } from "@/lib/types/content";
import * as LucideIcons from "lucide-react";

const Features = ({ features }: { features?: FeaturesContent }) => {
  const items = features?.items ?? [];

  if (!items.length) return null;

  return (
    <div className="flex max-w-7xl flex-col ">
      <h2 className="text-pretty text-left font-bold text-4xl md:text-5xl">
        {features?.title || "Designed to scale"}
      </h2>
      <p className="mt-3 text-left text-muted-foreground text-xl -tracking-[0.01em] sm:text-2xl">
        {features?.subtitle || "Spend less time configuring and more time creating"}
      </p>

      <div className="mt-12 grid grid-cols-1 bg-card sm:grid-cols-2 lg:grid-cols-3 rounded-xl">
        <div className=" flex h-16 items-center border px-6 font-medium text-lg sm:col-span-2 md:col-span-1 text-secondary">
          <Smile className="mr-4 text-accent-foreground" /> {features?.sectionLabel || "Features that make you happy"}
        </div>
        <div className="-mr-px hidden h-16 border bg-[repeating-linear-gradient(315deg,var(--muted)_0,var(--muted)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed md:block lg:col-span-2" />
        {items.map((feature, index) => {
          const Icon = (feature.icon && (LucideIcons as any)[feature.icon]) || Zap;
          return (
          <div
            className="-mt-px -mr-px border border-border/75 px-5 pt-7 pb-5"
            key={feature.id || index}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/7 text-primary dark:bg-primary/10">
                <Icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-xl tracking-[-0.005em] ">
                {feature.title}
              </h3>
            </div>
            <p className="mt-4 text-foreground/80">{feature.description}</p>

            <Button className="mt-6 bg-white/10" variant="outline" render={<Link href="#" target="_blank"  />} nativeButton={false}>Learn more <ArrowUpRight className="text-secondary"/></Button>
          </div>
        )})}
      </div>
    </div>
  );
};

export default Features;
