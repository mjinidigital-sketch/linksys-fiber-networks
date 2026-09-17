'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import {
  ArrowUpRight,
  ExternalLink,
  FileText,
  
} from 'lucide-react'
import { FaGithub } from 'react-icons/fa'; // FontAwesome GitHub icon

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { ProjectsContent } from '@/lib/types/content'
import { useRouter } from 'next/navigation'

const reveal: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: 'easeOut',
    },
  },
}

const cardReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: index * 0.08,
      ease: 'easeOut',
    },
  }),
}

interface ProjectsProps {
  projects?: ProjectsContent
}

export function Projects({
  projects,
}: ProjectsProps) {
  const reduceMotion = useReducedMotion()
  const router = useRouter()

  if (!projects) return null

  return (
    <motion.section
      id="work"
      aria-labelledby="work-title"
      initial={reduceMotion ? false : 'hidden'}
      whileInView={reduceMotion ? undefined : 'visible'}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      variants={reveal}
      className="border-t border-border py-20 "
    >
      <div className="mx-auto max-w-7xl mt-8">
        {/* Section Header */}
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary dark:text-secondary">
              {projects.sectionLabel}
            </p>

            <h2
              id="work-title"
              className="mt-3 text-4xl font-bold text-foreground sm:text-4xl lg:text-5xl"
            >
              {projects.title}
            </h2>
          </div>

          <Button
            
            variant="ghost"
            className="w-fit flex gap-2 px-0 text-primary dark:text-secondary hover:bg-transparent hover:text-primary"
          >
            <Link href={projects.ctaLink} className="flex items-center gap-2 text-sm font-medium">
            
              <ArrowUpRight className="size-4" />
              {projects.ctaText}
            </Link>
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="mt-12 lg:mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.items.map((project, index) => (
            <motion.div
              key={project.id || project.title}
              custom={index}
              initial={reduceMotion ? false : 'hidden'}
              whileInView={reduceMotion ? undefined : 'visible'}
              viewport={{
                once: true,
                amount: 0.15,
              }}
              variants={cardReveal}
            >
              <Card className="group flex h-full flex-col overflow-hidden border-border bg-card transition-all duration-300 shadow-lg hover:-translate-y-1 hover:shadow-xl">
                {/* Project Image */}
                <Link
                  href={`/projects/${project.id}`}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div
                    className={`relative aspect-video overflow-hidden ${
                      project.accent || 'bg-primary'
                    }`}
                  >
                    {project.image ? (
                      <>
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-black/35 transition-colors duration-300 group-hover:bg-black/25" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-primary" />
                    )}

                    
                    
                  </div>
                </Link>

                {/* Content */}
                <CardHeader className="space-y-0 pb-3">
                   <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-primary dark:text-secondary">
                          {project.type}
                        </p>

                        <h3 className="mt-1.5 text-xl font-semibold tracking-tight  sm:text-2xl">
                          {project.title}
                        </h3>
                 
                </CardHeader>

                <CardContent className="flex-1 pt-0">
                   <p className="text-sm leading-6 text-muted-foreground clamp-4">
                    {project.description}
                  </p>
                 
                  {/* Technologies */}
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="rounded-md px-2 py-0.5 font-mono text-[10px] font-medium"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>

                {/* Footer */}
                <CardFooter className="flex items-center justify-between gap-4 border-t border-border pt-4">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => router.push(`/projects/${project.id}`)}
                        >
                   
                      
                      Explore Case Study
                    
                  </Button>

                  <div className="flex items-center gap-1">
                    {project.githubUrl && (
                      <Button
                        
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground"
                      >
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} source code on GitHub`}
                        >
                          <FaGithub className="size-4" />
                        </a>
                      </Button>
                    )}

                    {project.liveUrl && (
                      <Button
                        
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-primary"
                      >
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${project.title} live project`}
                        >
                          <ExternalLink className="size-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-16 -mb-16">
        <Button variant="link" size="lg">
          <Link href="/projects" className="flex items-center gap-2 text-sm font-medium text-primary dark:text-secondary">
            <ArrowUpRight className="size-4" />
          View All Projects
          </Link>
        </Button>
      </div>
    </motion.section>
  )
}