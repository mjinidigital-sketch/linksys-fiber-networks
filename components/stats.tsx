import { StatsContent } from "@/lib/types/content";

const Stats = ({ stats }: { stats?: StatsContent }) => {
  const items = stats?.items ?? [];

  if (!items.length) return null;

  return (
    <div className="border-b pb-20">
      <div className="mx-auto w-full max-w-(--breakpoint-xl) ">
        {stats?.sectionLabel && (
          <p className="font-mono text-base uppercase tracking-[0.2em] text-accent-foreground mb-4">
            {stats.sectionLabel}
          </p>
        )}
        <h2 className="font-bold text-4xl md:text-5xl">
          {stats?.title || "The impact we've made so far"}
        </h2>
        {stats?.subtitle && (
          <p className="mt-4.5 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {stats.subtitle}
          </p>
        )}

        <div className="mt-6 grid justify-center gap-x-10 gap-y-16 sm:mt-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="bg-accent-foreground/5 rounded-2xl p-8 border border-secondary/30">
              <span className="font-bold text-4xl tracking-tight md:text-6xl text-primary dark:text-accent-foreground">
                {item.value}
              </span>
              <hr className="my-3 h-1 bg-secondary w-1/2" />
              <p className=" font-medium text-lg ">
                {item.label}
              </p>
              <p className="mt-2 text-muted-foreground text-xs">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;
