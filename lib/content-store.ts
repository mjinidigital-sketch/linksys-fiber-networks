import fs from 'fs'
import path from 'path'
import { WebsiteContent } from './types/content'

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'website-content.json')

export function getWebsiteContent(): WebsiteContent | null {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const fileData = fs.readFileSync(DATA_FILE_PATH, 'utf-8')
      return JSON.parse(fileData) as WebsiteContent
    }
  } catch (error) {
    console.error('Error reading website content:', error)
  }
  return null
}

export function saveWebsiteContent(newContent: Partial<WebsiteContent>): WebsiteContent | null {
  try {
    const current = getWebsiteContent() || ({} as WebsiteContent)
    const updated: WebsiteContent = {
      ...current,
      ...newContent,
      lastUpdated: new Date().toISOString(),
    }

    const dir = path.dirname(DATA_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8')
    return updated
  } catch (error) {
    console.error('Error saving website content:', error)
    throw error
  }
}

export function resetWebsiteContent(): WebsiteContent | null {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      fs.unlinkSync(DATA_FILE_PATH)
    }
    return null
  } catch (error) {
    console.error('Error resetting website content:', error)
    throw error
  }
}
