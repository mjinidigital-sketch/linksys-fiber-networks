import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlogContent } from "@/lib/types/content";

const Blog = ({ blog }: { blog?: BlogContent }) => {
  const posts = blog?.posts?.filter((p) => p.published) || [];

  if (!posts.length) return null;

  return (
    <div className="border-t border-b mx-auto max-w-(--breakpoint-xl) px-6 py-20 xl:px-0 -mt-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          {blog?.sectionLabel && (
            <p className="font-mono text-md uppercase tracking-[0.2em] text-accent-foreground">
              {blog.sectionLabel}
            </p>
          )}
          <h2 className="mt-2 font-bold text-2xl sm:text-4xl lg:text-5xl">
            {blog?.title || "Recommended Posts"}
          </h2>
          {blog?.subtitle && (
            <p className="mt-2 text-base text-muted-foreground">{blog.subtitle}</p>
          )}
        </div>
        <Select defaultValue="recommended">
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recommended">Recommended</SelectItem>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="popular">Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card
            className="gap-0 overflow-hidden rounded-lg py-0 shadow-none flex flex-col"
            key={post.id || post.slug}
          >
            {post.coverImage && (
              <CardHeader className="relative p-0 shrink-0">
                <Link href={`/blog/${post.slug}`}>
                  <div className="relative aspect-video w-full border-b overflow-hidden group">
                    <Image
                      alt={post.title}
                      className="object-cover size-full transition-transform duration-500 group-hover:scale-105"
                      src={post.coverImage}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </Link>
              </CardHeader>
            )}
            <CardContent className="p-4 flex flex-col flex-1">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary/5 text-primary shadow-none hover:bg-primary/5">
                  {post.category}
                </Badge>
                <span className="font-medium text-muted-foreground text-xs">
                  {post.readTime}
                </span>
                <span className="font-medium text-muted-foreground text-xs">
                  {post.date}
                </span>
              </div>

              <Link href={`/blog/${post.slug}`} className="group/title block">
                <h3 className="mt-4 font-bold text-xl  group-hover/title:text-primary transition-colors">
                  {post.title}
                </h3>
              </Link>
              <p className="mt-2 text-muted-foreground line-clamp-3 mb-6 text-sm">
                {post.excerpt}
              </p>

              <div className="mt-auto">
                <Link href={`/blog/${post.slug}`}>
                  <Button className="shadow-none">
                    Read more <ChevronRight className="ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Blog;
