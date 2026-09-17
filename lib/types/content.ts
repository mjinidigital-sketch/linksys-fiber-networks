export interface SocialLink {
  id: string
  platform: string
  label: string
  url: string
  icon?: string
  username?: string
}

export interface NavLink {
  label: string
  href: string
  isExternal?: boolean
}

export interface GeneralSettings {
  siteName: string
  siteTagline: string
  displayName: string
  role: string
  shortBio: string
  avatarUrl: string
  location: string
  primaryLocation?: string
  areasServed?: string[]
  email: string
  phone?: string
  resumeUrl?: string
  availableForWork: boolean
  statusBadge: string
}

export interface HeroSlide {
  url: string
  alt: string
}

export interface HeroContent {
  badge: string
  titleLine1: string
  titleHighlight1: string
  titleLine2: string
  titleHighlight2: string
  bio: string
  primaryCtaText: string
  primaryCtaLink: string
  secondaryCtaText: string
  secondaryCtaLink: string
  locationText: string
  avatarUrl: string
  statusCardLabel: string
  statusCardText: string
  statusCardHighlight: string
  images?: (string | HeroSlide)[]
}

export interface TechStackContent {
  sectionLabel: string
  subtitle: string
  items: string[]
}

export interface LogosContent {
  sectionLabel: string
  title: string
  subtitle: string
  items: string[]
}

export type CollectionStructuredDataType =
  | 'default'
  | 'Article'
  | 'BlogPosting'
  | 'TechArticle'
  | 'SoftwareApplication'
  | 'WebApplication'
  | 'Service'
  | 'Product'
  | 'CreativeWork'
  | 'Custom'

export interface CollectionItemSeo {
  metaTitle?: string
  metaDescription?: string
  metaImage?: string
  keywords?: string
  canonicalUrl?: string
  noIndex?: boolean
  structuredDataType?: CollectionStructuredDataType
  structuredDataCustomJson?: string
}

export interface ProjectItem {
  id: string
  title: string
  type: string
  description: string
  summary?: string
  content?: string
  tags: string[]
  accent: string
  link: string
  featured: boolean
  category?: string
  liveUrl?: string
  githubUrl?: string
  image?: string
  completionDate?: string
  seo?: CollectionItemSeo
}

export interface ProjectsContent {
  sectionLabel: string
  title: string
  ctaText: string
  ctaLink: string
  items: ProjectItem[]
}

export interface ProcessStep {
  id: string
  stepNumber: string
  title: string
  description: string
}

export interface ProcessContent {
  sectionLabel: string
  title: string
  steps: ProcessStep[]
}

export interface ServiceItem {
  id: string
  title: string
  description: string
  summary?: string
  content?: string
  icon: string
  price?: string
  popular?: boolean
  features: string[]
  seo?: CollectionItemSeo
}

export interface ServicesContent {
  sectionLabel: string
  title: string
  subtitle: string
  items: ServiceItem[]
}

export interface TemplateItem {
  id: string
  title: string
  slug?: string
  category: string
  description: string
  summary?: string
  content?: string
  tags: string[]
  price?: string
  liveDemoUrl?: string
  githubUrl?: string
  previewImage?: string
  features: string[]
  featured?: boolean
  downloadUrl?: string
  seo?: CollectionItemSeo
}

export interface TemplatesContent {
  sectionLabel: string
  title: string
  subtitle: string
  items: TemplateItem[]
}

export interface BlogPostItem {
  id: string
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
  coverImage?: string
  published: boolean
  content?: string
  seo?: CollectionItemSeo
}

export interface BlogContent {
  sectionLabel: string
  title: string
  subtitle: string
  posts: BlogPostItem[]
}

export interface ContactContent {
  sectionLabel: string
  title: string
  subtitle: string
  email: string
  ctaText: string
  location: string
  socials: SocialLink[]
}

export type PageStructuredDataType =
  | 'default'
  | 'WebSite'
  | 'Product'
  | 'Service'
  | 'LocalBusiness'
  | 'Organization'
  | 'Article'
  | 'SoftwareApplication'
  | 'WebPage'
  | 'ProfilePage'
  | 'AboutPage'
  | 'ContactPage'
  | 'CollectionPage'
  | 'FAQPage'
  | 'Custom'

export interface PageSeoMeta {
  path: string
  pageName: string
  title: string
  description: string
  keywords: string
  ogImage?: string
  canonicalUrl?: string
  noIndex?: boolean
  structuredDataType?: PageStructuredDataType
  structuredDataCustomJson?: string
}

export interface ExternalSeoApis {
  googleSiteVerification?: string
  googleAnalyticsId?: string
  googleTagManagerId?: string
  bingVerification?: string
  customHeadScript?: string
}

export interface SeoSettings {
  title: string
  description: string
  keywords: string
  canonicalUrl: string
  ogImage: string
  twitterCard: string
  allowIndexing: boolean
  areasServed?: string[]
  primaryLocation?: string
  pages?: Record<string, PageSeoMeta>
  apis?: ExternalSeoApis
}

export interface NavigationContent {
  brandName: string
  brandAccent: string
  links: NavLink[]
}

export interface FooterContent {
  copyright: string
  links: NavLink[]
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  order: number
}

export interface FaqContent {
  sectionLabel: string
  title: string
  subtitle: string
  items: FaqItem[]
}

export interface FeatureItem {
  id: string
  title: string
  description: string
  icon?: string
}

export interface FeaturesContent {
  sectionLabel?: string
  title: string
  subtitle?: string
  items: FeatureItem[]
}

export interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  isRecommended: boolean
  icon?: string
  features: string[]
}

export interface PricingContent {
  sectionLabel?: string
  title?: string
  subtitle?: string
  plans: PricingPlan[]
}

export interface StatItem {
  id: string
  value: string
  label: string
  description: string
}

export interface StatsContent {
  sectionLabel?: string
  title: string
  subtitle?: string
  items: StatItem[]
}

export interface CodeBlockFile {
  id: string
  filename: string
  code: string
  language?: string
}

export interface CodeBlockContent {
  files: CodeBlockFile[]
}

export interface GalleryImage {
  src: string
  alt: string
  title?: string
  category?: string
  description?: string
}

export interface GallerySection {
  type?: string
  title?: string
  description?: string
  images: GalleryImage[]
}

export interface GalleryContent {
  sectionLabel?: string
  title?: string
  titleHighlight?: string
  subtitle?: string
  categories?: string[]
  images?: (GalleryImage | string)[]
  sections?: GallerySection[]
}

export type ComponentBlockType =
  | 'hero'
  | 'hero2'
  | 'techStack'
  | 'logos'
  | 'projects'
  | 'process'
  | 'services'
  | 'templates'
  | 'blog'
  | 'contact'
  | 'faq'
  | 'ctaBanner'
  | 'customHtml'
  | 'features'
  | 'pricing'
  | 'stats'
  | 'codeBlock'
  | 'careers'
  | 'gallery'

export interface PageComponentBlock {
  id: string
  type: ComponentBlockType
  title: string
  description?: string
  enabled: boolean
  // Per-page content overrides — merged over global section data when rendering
  data?: Record<string, any>
}

export interface PageConfig {
  id: string
  name: string
  path: string
  description?: string
  seoTitle?: string
  seoDescription?: string
  enabled: boolean
  blocks: PageComponentBlock[]
}

export interface WebsiteContent {
  general: GeneralSettings
  navigation: NavigationContent
  hero: HeroContent
  techStack: TechStackContent
  logos: LogosContent
  projects: ProjectsContent
  process: ProcessContent
  services: ServicesContent
  templates?: TemplatesContent
  blog: BlogContent
  contact: ContactContent
  seo: SeoSettings
  footer: FooterContent
  faq: FaqContent
  features?: FeaturesContent
  pricing?: PricingContent
  stats?: StatsContent
  codeBlock?: CodeBlockContent
  gallery?: GalleryContent
  pageLayouts?: Record<string, PageConfig>
  lastUpdated?: string
}


