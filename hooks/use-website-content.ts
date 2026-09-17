'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { WebsiteContent } from '@/lib/types/content'

// Helper to trigger Next.js cache revalidation when admin edits content
async function triggerRevalidate(section?: string, path?: string) {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, path }),
    })
  } catch (err) {
    console.error('Failed to trigger cache revalidation:', err)
  }
}

export function useWebsiteContent(initialData?: WebsiteContent | null) {
  const convexData = useQuery(api.content.get)
  const updateSectionMutation = useMutation(api.content.updateSection)
  const saveAllMutation = useMutation(api.content.saveAll)
  const resetMutation = useMutation(api.content.resetToDefault)
  const seedMutation = useMutation(api.seed.seedWebsiteContent)

  const activeContent = useMemo(() => {
    if (convexData) return convexData as WebsiteContent
    if (initialData) return initialData
    return null
  }, [convexData, initialData])

  const [localContent, setLocalContent] = useState<WebsiteContent | null>(activeContent)
  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    if (convexData === null) {
      // Database not seeded yet, seed it automatically
      seedMutation().catch((err) => console.error('Seed error:', err))
    }
  }, [convexData, seedMutation])

  useEffect(() => {
    if (activeContent) {
      setLocalContent(activeContent)
    }
  }, [activeContent])

  const loading = convexData === undefined && !initialData

  const updateSection = useCallback(
    async <K extends keyof WebsiteContent>(section: K, data: WebsiteContent[K]) => {
      try {
        setSaving(true)
        setError(null)

        const base = localContent || ({} as WebsiteContent)
        const updated = {
          ...base,
          [section]: data,
          lastUpdated: new Date().toISOString(),
        } as WebsiteContent

        setLocalContent(updated)

        await updateSectionMutation({
          section: section as string,
          data,
        })

        setLastSaved(new Date())
        await triggerRevalidate(section as string)

        return { success: true, data: updated }
      } catch (err: any) {
        console.error('Convex updateSection error:', err)
        setError(err?.message || 'Failed to save section')
        return { success: false, error: err?.message }
      } finally {
        setSaving(false)
      }
    },
    [localContent, updateSectionMutation]
  )

  const saveAll = useCallback(
    async (fullContent: WebsiteContent) => {
      try {
        setSaving(true)
        setError(null)
        setLocalContent(fullContent)

        await saveAllMutation({
          content: fullContent,
        })

        setLastSaved(new Date())
        await triggerRevalidate()

        return { success: true, data: fullContent }
      } catch (err: any) {
        console.error('Convex saveAll error:', err)
        setError(err?.message || 'Failed to save content')
        return { success: false, error: err?.message }
      } finally {
        setSaving(false)
      }
    },
    [saveAllMutation]
  )

  const resetToDefault = useCallback(async () => {
    try {
      setSaving(true)
      setError(null)

      // Re-trigger seed mutation to restore full database content
      await seedMutation()
      await triggerRevalidate()

      setLastSaved(new Date())
      return { success: true }
    } catch (err: any) {
      console.error('Convex reset error:', err)
      setError(err?.message || 'Failed to reset')
      return { success: false, error: err?.message }
    } finally {
      setSaving(false)
    }
  }, [seedMutation])

  return {
    content: localContent,
    setContent: setLocalContent,
    loading,
    saving,
    error,
    lastSaved,
    fetchContent: () => {},
    updateSection,
    saveAll,
    resetToDefault,
  }
}
