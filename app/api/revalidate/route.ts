import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { section, path, tag } = body

    const invalidateTag = (t: string) => {
      try {
        ;(revalidateTag as any)(t, 'default')
      } catch {
        try {
          ;(revalidateTag as any)(t)
        } catch (e) {
          console.warn(`Could not revalidate tag ${t}:`, e)
        }
      }
    }

    // Always revalidate the core website-content tag
    invalidateTag('website-content')

    if (tag) {
      invalidateTag(tag)
    }

    if (section) {
      invalidateTag(`content-${section}`)
    }

    if (path) {
      revalidatePath(path)
    } else {
      revalidatePath('/', 'layout')
    }

    return NextResponse.json({
      success: true,
      revalidated: true,
      section,
      path,
      timestamp: Date.now(),
    })
  } catch (error: any) {
    console.error('Error revalidating Next.js cache:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Revalidation failed' },
      { status: 500 }
    )
  }
}
