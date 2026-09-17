'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import {
  Plus,
  Trash2,
  Pencil,
  Briefcase,
  MapPin,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Search,
  X,
  Download,
  ExternalLink,
  FileText,
  Paperclip,
  Folder,
  Phone,
  Mail,
  Calendar,
  Copy,
  Check,
  Loader2,
  FileCheck,
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ContentHeader } from '@/components/admin/ContentHeader'

// ─── Types ────────────────────────────────────────────────────────────────

type JobType = 'full-time' | 'part-time' | 'contract' | 'remote'
type AppStatus = 'pending' | 'reviewing' | 'accepted' | 'rejected'

interface JobForm {
  title: string
  department: string
  location: string
  type: JobType
  description: string
  requirements: string[]
  salary: string
  published: boolean
}

const defaultJob: JobForm = {
  title: '',
  department: '',
  location: '',
  type: 'full-time',
  description: '',
  requirements: [],
  salary: '',
  published: false,
}

const JOB_TYPE_LABELS: Record<JobType, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  'contract': 'Contract',
  'remote': 'Remote',
}

const STATUS_CONFIG: Record<AppStatus, { label: string; color: string; Icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-500 border-amber-500/30', Icon: AlertCircle },
  reviewing: { label: 'Reviewing', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30', Icon: RotateCcw },
  accepted: { label: 'Accepted', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30', Icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive border-destructive/30', Icon: XCircle },
}

// ─── File Download Link Helpers ──────────────────────────────────────────

function StorageDownloadButton({
  storageId,
  label,
  fileName,
  variant = 'outline',
  size = 'sm',
  className = '',
}: {
  storageId: Id<'_storage'> | string
  label?: string
  fileName?: string
  variant?: 'outline' | 'default' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}) {
  const url = useQuery(api.careers.getFileUrl, { storageId: storageId as Id<'_storage'> })

  if (!url) {
    return (
      <Button variant={variant} size={size} disabled className={`gap-1.5 text-xs ${className}`}>
        <Loader2 className="size-3.5 animate-spin" />
        <span>Loading...</span>
      </Button>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download={fileName || true}
      className="inline-block"
    >
      <Button variant={variant} size={size} className={`gap-1.5 text-xs cursor-pointer ${className}`}>
        <Download className="size-3.5" />
        <span>{label || fileName || 'Download File'}</span>
        <ExternalLink className="size-3 opacity-60 ml-0.5" />
      </Button>
    </a>
  )
}

// ─── Application Detail Dialog (Popup) ───────────────────────────────────

function ApplicationDetailDialog({
  app,
  open,
  onClose,
  onStatusChange,
  onDelete,
}: {
  app: any | null
  open: boolean
  onClose: () => void
  onStatusChange: (id: Id<'applications'>, status: AppStatus) => void
  onDelete: (id: Id<'applications'>, name: string) => void
}) {
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false)

  if (!app) return null

  const cfg = STATUS_CONFIG[app.status as AppStatus] || STATUS_CONFIG.pending

  const handleCopyCoverLetter = () => {
    if (app.coverLetter) {
      navigator.clipboard.writeText(app.coverLetter)
      setCopiedCoverLetter(true)
      setTimeout(() => setCopiedCoverLetter(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[92vw] max-w-3xl max-h-[90vh] overflow-y-auto" onClose={onClose}>
        <DialogHeader className="pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-xl font-bold">{app.applicantName}</DialogTitle>
                <Badge className={`text-xs border ${cfg.color}`}>
                  <cfg.Icon className="size-3 mr-1" />
                  {cfg.label}
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                <span>Applied for: <strong className="text-foreground">{app.jobTitle || 'Role'}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {new Date(app.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </DialogDescription>
            </div>

            {/* Status Change Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-muted-foreground">Status:</span>
              <Select
                value={app.status}
                onValueChange={(v) => onStatusChange(app._id, v as AppStatus)}
              >
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['pending', 'reviewing', 'accepted', 'rejected'] as AppStatus[]).map((s) => (
                    <SelectItem key={s} value={s} className="text-xs capitalize">
                      {STATUS_CONFIG[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Contact Information Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-border/70 bg-card/60">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Mail className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-muted-foreground">Email Address</p>
                <a
                  href={`mailto:${app.applicantEmail}`}
                  className="text-xs font-semibold text-foreground hover:text-primary transition-colors underline"
                >
                  {app.applicantEmail}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Phone className="size-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-muted-foreground">Phone Number</p>
                {app.phone ? (
                  <a
                    href={`tel:${app.phone}`}
                    className="text-xs font-semibold text-foreground hover:text-emerald-500 transition-colors"
                  >
                    {app.phone}
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">Not provided</span>
                )}
              </div>
            </div>
          </div>

          {/* Resume / CV Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Paperclip className="size-3.5 text-primary" />
                Resume / Curriculum Vitae
              </h4>
            </div>

            <div className="p-4 rounded-xl border border-border/80 bg-background/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <FileCheck className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {app.resumeFileName || `${app.applicantName}_Resume`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {app.resumeStorageId ? 'Stored file attachment' : app.resumeUrl ? 'External link' : 'No resume file'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {app.resumeStorageId ? (
                  <StorageDownloadButton
                    storageId={app.resumeStorageId}
                    fileName={app.resumeFileName || `${app.applicantName}_Resume.pdf`}
                    label="Download Resume"
                    variant="default"
                  />
                ) : app.resumeUrl ? (
                  <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="gap-1.5 text-xs">
                      <ExternalLink className="size-3.5" />
                      <span>Open Resume Link</span>
                    </Button>
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">No file available</span>
                )}
              </div>
            </div>
          </div>

          {/* Cover Letter Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="size-3.5 text-primary" />
                Cover Letter
              </h4>

              {app.coverLetter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCoverLetter}
                  className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {copiedCoverLetter ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  <span>{copiedCoverLetter ? 'Copied' : 'Copy Text'}</span>
                </Button>
              )}
            </div>

            {app.coverLetter ? (
              <div className="p-4 rounded-xl border border-border/80 bg-muted/20 text-xs leading-relaxed text-foreground whitespace-pre-wrap max-h-60 overflow-y-auto">
                {app.coverLetter}
              </div>
            ) : null}

            {app.coverLetterStorageId && (
              <div className="p-3 rounded-xl border border-border/80 bg-background/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="size-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">Attached Cover Letter File</span>
                </div>
                <StorageDownloadButton
                  storageId={app.coverLetterStorageId}
                  fileName={`${app.applicantName}_Cover_Letter.pdf`}
                  label="Download Cover Letter"
                  variant="outline"
                />
              </div>
            )}

            {!app.coverLetter && !app.coverLetterStorageId && (
              <p className="text-xs text-muted-foreground italic">No cover letter provided.</p>
            )}
          </div>

          {/* Additional Documents Section */}
          {app.additionalDocs && app.additionalDocs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Folder className="size-3.5 text-primary" />
                Additional Documents ({app.additionalDocs.length})
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {app.additionalDocs.map((doc: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-border/80 bg-background/50 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {doc.title || `Document ${i + 1}`}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">{doc.fileName}</p>
                    </div>
                    <StorageDownloadButton
                      storageId={doc.storageId}
                      fileName={doc.fileName || doc.title}
                      label="Download"
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-border/60 flex flex-row items-center justify-between sm:justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(app._id, app.applicantName)}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive text-xs gap-1.5 cursor-pointer"
          >
            <Trash2 className="size-3.5" />
            <span>Delete Application</span>
          </Button>

          <Button variant="outline" size="sm" onClick={onClose} className="text-xs cursor-pointer">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Admin Careers Page Component ───────────────────────────────────

export default function CareersAdminPage() {
  const { toast } = useToast()

  const jobs = useQuery(api.careers.listAllJobs) ?? []
  const applications = useQuery(api.careers.listAllApplications, {}) ?? []

  const createJob = useMutation(api.careers.createJob)
  const updateJob = useMutation(api.careers.updateJob)
  const deleteJob = useMutation(api.careers.deleteJob)
  const updateStatus = useMutation(api.careers.updateApplicationStatus)
  const deleteApp = useMutation(api.careers.deleteApplication)

  const [jobForm, setJobForm] = useState<JobForm>(defaultJob)
  const [editingJobId, setEditingJobId] = useState<Id<'jobs'> | null>(null)
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newRequirement, setNewRequirement] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedJobId, setExpandedJobId] = useState<Id<'jobs'> | null>(null)
  const [selectedJobFilter, setSelectedJobFilter] = useState<Id<'jobs'> | 'all'>('all')

  // Selected application for popup modal
  const [viewingApp, setViewingApp] = useState<any | null>(null)

  // ── Derived ─────────────────────────────────────────────────────────────

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredApps = selectedJobFilter === 'all'
    ? applications
    : applications.filter((a) => a.jobId === selectedJobFilter)

  const jobAppCount = (jobId: Id<'jobs'>) =>
    applications.filter((a) => a.jobId === jobId).length

  // ── Dialog helpers ───────────────────────────────────────────────────────

  const openNewJob = () => {
    setJobForm(defaultJob)
    setEditingJobId(null)
    setIsJobDialogOpen(true)
  }

  const openEditJob = (job: (typeof jobs)[0]) => {
    setJobForm({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      description: job.description,
      requirements: job.requirements,
      salary: job.salary ?? '',
      published: job.published,
    })
    setEditingJobId(job._id)
    setIsJobDialogOpen(true)
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  const handleSaveJob = async () => {
    if (!jobForm.title.trim()) {
      toast({ title: 'Title required', variant: 'destructive' })
      return
    }
    if (!jobForm.department.trim() || !jobForm.location.trim()) {
      toast({ title: 'Department and location are required', variant: 'destructive' })
      return
    }
    if (!jobForm.description.trim()) {
      toast({ title: 'Description required', variant: 'destructive' })
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        title: jobForm.title.trim(),
        department: jobForm.department.trim(),
        location: jobForm.location.trim(),
        type: jobForm.type,
        description: jobForm.description.trim(),
        requirements: jobForm.requirements.filter(Boolean),
        salary: jobForm.salary.trim() || undefined,
        published: jobForm.published,
      }

      if (editingJobId) {
        await updateJob({ jobId: editingJobId, ...payload })
        toast({ title: 'Job updated successfully' })
      } else {
        await createJob(payload)
        toast({ title: 'Job created successfully' })
      }
      setIsJobDialogOpen(false)
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteJob = async (jobId: Id<'jobs'>, title: string) => {
    if (!confirm(`Delete "${title}" and all its applications? This cannot be undone.`)) return
    try {
      await deleteJob({ jobId })
      toast({ title: 'Job deleted' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    }
  }

  const handleTogglePublish = async (job: (typeof jobs)[0]) => {
    try {
      await updateJob({ jobId: job._id, published: !job.published })
      toast({ title: job.published ? 'Job unpublished' : 'Job published' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    }
  }

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setJobForm((f) => ({ ...f, requirements: [...f.requirements, newRequirement.trim()] }))
      setNewRequirement('')
    }
  }

  const handleRemoveRequirement = (i: number) => {
    setJobForm((f) => ({ ...f, requirements: f.requirements.filter((_, idx) => idx !== i) }))
  }

  const handleAppStatus = async (appId: Id<'applications'>, status: AppStatus) => {
    try {
      await updateStatus({ applicationId: appId, status })
      toast({ title: `Application marked as ${status}` })
      // Keep modal in sync if open
      if (viewingApp && viewingApp._id === appId) {
        setViewingApp((prev: any) => (prev ? { ...prev, status } : null))
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    }
  }

  const handleDeleteApp = async (appId: Id<'applications'>, name: string) => {
    if (!confirm(`Are you sure you want to delete the application from ${name}? This will also delete any uploaded resume and documents.`)) {
      return
    }
    try {
      await deleteApp({ applicationId: appId })
      toast({ title: 'Application deleted successfully' })
      if (viewingApp && viewingApp._id === appId) {
        setViewingApp(null)
      }
    } catch (err: any) {
      toast({ title: 'Error deleting application', description: err.message, variant: 'destructive' })
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      <ContentHeader
        title="Careers & Job Listings"
        description="Manage open positions, review incoming applications, download candidate files, and track applicant statuses."
        badge={`${jobs.length} Jobs · ${applications.length} Applications`}
        saving={isSaving}
      >
        <Button onClick={openNewJob} size="sm" className="gap-1.5 text-xs font-semibold">
          <Plus className="size-3.5" />
          <span>New Job</span>
        </Button>
      </ContentHeader>

      {/* ── Metrics ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Jobs', value: jobs.length, color: 'text-primary' },
          { label: 'Published', value: jobs.filter((j) => j.published).length, color: 'text-emerald-500' },
          { label: 'Applications', value: applications.length, color: 'text-blue-500' },
          { label: 'Pending Review', value: applications.filter((a) => a.status === 'pending').length, color: 'text-amber-500' },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-xs">
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{m.label}</p>
            <p className={`mt-1 text-2xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* ── Job Listings ───────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title, department, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
          <span className="text-xs text-muted-foreground">{filteredJobs.length} of {jobs.length}</span>
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            <Briefcase className="size-10 mx-auto mb-3 opacity-30" />
            <p>No job listings yet. Create your first one above.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredJobs.map((job) => {
            const appCount = jobAppCount(job._id)
            const isExpanded = expandedJobId === job._id
            return (
              <Card
                key={job._id}
                className="border-border/80 bg-card/60 hover:border-primary/40 transition-all"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] capitalize border-border/80 bg-background/50 dark:bg-card/60"
                      >
                        {JOB_TYPE_LABELS[job.type]}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(job)}
                        title={job.published ? 'Published: Click to unpublish' : 'Draft: Click to publish'}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                          job.published
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25 shadow-2xs'
                            : 'bg-muted text-muted-foreground border-border/80 hover:bg-muted/80 hover:text-foreground'
                        }`}
                      >
                        <span className={`size-1.5 rounded-full ${job.published ? 'bg-emerald-500' : 'bg-muted-foreground/60'}`} />
                        <span>{job.published ? 'Published' : 'Draft'}</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        onClick={() => openEditJob(job)}
                        title="Edit Job"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteJob(job._id, job.title)}
                        title="Delete Job"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  <CardTitle className="mt-2 text-base font-bold group-hover:text-primary dark:group-hover:text-accent-foreground transition-colors">
                    {job.title}
                  </CardTitle>

                  <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Briefcase className="size-3 text-primary" />
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-primary" />
                      {job.location}
                    </span>
                    {job.salary && (
                      <span className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[9px] font-bold border border-emerald-500/20">
                          KES
                        </span>
                        <span className="font-medium text-foreground">
                          {job.salary.replace(/^KES\s*/i, '').replace(/^KSh\s*/i, '')}
                        </span>
                      </span>
                    )}
                  </div>

                  <CardDescription className="text-xs line-clamp-2 mt-1.5">
                    {job.description}
                  </CardDescription>
                </CardHeader>

                <CardFooter className="p-4 pt-2 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedJobId(isExpanded ? null : job._id)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <Users className="size-3.5" />
                    <span>{appCount} application{appCount !== 1 ? 's' : ''}</span>
                    {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                  </button>
                </CardFooter>

                {/* Applications panel inside job card */}
                {isExpanded && (
                  <div className="border-t border-border/60 px-4 py-3 space-y-2">
                    {applications.filter((a) => a.jobId === job._id).length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-2">No applications yet.</p>
                    ) : (
                      applications
                        .filter((a) => a.jobId === job._id)
                        .map((app) => {
                          const cfg = STATUS_CONFIG[app.status as AppStatus] || STATUS_CONFIG.pending
                          return (
                            <div
                              key={app._id}
                              className="rounded-lg border border-border/60 bg-background/50 p-3 space-y-2 hover:border-primary/40 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <p className="text-xs font-semibold">{app.applicantName}</p>
                                  <p className="text-[11px] text-muted-foreground">{app.applicantEmail}</p>
                                  {app.phone && <p className="text-[11px] text-muted-foreground">{app.phone}</p>}
                                </div>
                                <Badge className={`text-[10px] border ${cfg.color} shrink-0`}>
                                  <cfg.Icon className="size-2.5 mr-1" />
                                  {cfg.label}
                                </Badge>
                              </div>

                              <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setViewingApp(app)}
                                  className="h-7 text-xs gap-1.5 font-medium cursor-pointer"
                                >
                                  <Eye className="size-3.5" />
                                  <span>View & Download Files</span>
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteApp(app._id, app.applicantName)}
                                  className="size-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                                  title="Delete Application"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            </div>
                          )
                        })
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* ── All Applications Table ─────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold">All Applications</h2>
            <p className="text-xs text-muted-foreground">Click on any candidate to view their complete profile, cover letter, resume and downloaded documents.</p>
          </div>
          <Select
            value={selectedJobFilter === 'all' ? 'all' : selectedJobFilter}
            onValueChange={(v) => setSelectedJobFilter(v === 'all' ? 'all' : (v as Id<'jobs'>))}
          >
            <SelectTrigger className="h-9 w-52 text-xs">
              <SelectValue placeholder="Filter by job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs ({applications.length})</SelectItem>
              {jobs.map((j) => (
                <SelectItem key={j._id} value={j._id}>
                  {j.title} ({jobAppCount(j._id)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredApps.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <Users className="size-8 mx-auto mb-2 opacity-30" />
            <p>No applications yet.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/80 overflow-hidden bg-card/40">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b border-border/60">
                <tr>
                  {['Applicant', 'Job Applied', 'Date', 'Documents', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app, i) => {
                  const cfg = STATUS_CONFIG[app.status as AppStatus] || STATUS_CONFIG.pending
                  const docCount = (app.resumeStorageId || app.resumeUrl ? 1 : 0) +
                    (app.coverLetterStorageId ? 1 : 0) +
                    (app.additionalDocs?.length || 0)

                  return (
                    <tr
                      key={app._id}
                      className={`border-b border-border/40 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/5'}`}
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setViewingApp(app)}
                          className="text-left group cursor-pointer"
                        >
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                            {app.applicantName}
                            <Eye className="size-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                          </p>
                          <p className="text-muted-foreground text-[11px]">{app.applicantEmail}</p>
                          {app.phone && <p className="text-muted-foreground text-[11px]">{app.phone}</p>}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{app.jobTitle}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingApp(app)}
                          className="h-7 text-[11px] gap-1 px-2 font-medium cursor-pointer"
                        >
                          <Paperclip className="size-3 text-primary" />
                          <span>{docCount} file{docCount !== 1 ? 's' : ''}</span>
                        </Button>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-[10px] border ${cfg.color}`}>
                          <cfg.Icon className="size-2.5 mr-1" />
                          {cfg.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setViewingApp(app)}
                            className="h-7 text-[11px] gap-1 px-2.5 font-medium cursor-pointer"
                          >
                            <Eye className="size-3" />
                            <span>View</span>
                          </Button>

                          <Select
                            value={app.status}
                            onValueChange={(v) => handleAppStatus(app._id, v as AppStatus)}
                          >
                            <SelectTrigger className="h-7 w-28 text-[11px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(['pending', 'reviewing', 'accepted', 'rejected'] as AppStatus[]).map((s) => (
                                <SelectItem key={s} value={s} className="text-xs capitalize">{STATUS_CONFIG[s].label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteApp(app._id, app.applicantName)}
                            className="size-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                            title="Delete Application"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Job Create/Edit Dialog ─────────────────────────────────── */}
      <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
        <DialogContent className="w-[90vw] max-w-2xl" onClose={() => setIsJobDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editingJobId ? 'Edit Job Listing' : 'Create New Job Listing'}</DialogTitle>
            <DialogDescription>Fill in the details for this position. Published jobs appear on the careers page.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">Job Title *</Label>
              <Input
                value={jobForm.title}
                onChange={(e) => setJobForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Senior Fiber Optic Technician"
                className="mt-1 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Department *</Label>
                <Input
                  value={jobForm.department}
                  onChange={(e) => setJobForm((f) => ({ ...f, department: e.target.value }))}
                  placeholder="e.g. Field Engineering"
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Location *</Label>
                <Input
                  value={jobForm.location}
                  onChange={(e) => setJobForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Molo, Nakuru County"
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Type</Label>
                <Select
                  value={jobForm.type}
                  onValueChange={(v) => setJobForm((f) => ({ ...f, type: v as JobType }))}
                >
                  <SelectTrigger className="mt-1 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(JOB_TYPE_LABELS) as [JobType, string][]).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Salary / Compensation (optional)</Label>
                <Input
                  value={jobForm.salary}
                  onChange={(e) => setJobForm((f) => ({ ...f, salary: e.target.value }))}
                  placeholder="e.g. KES 40,000 - 60,000 / month"
                  className="mt-1 text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Description *</Label>
              <Textarea
                value={jobForm.description}
                onChange={(e) => setJobForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe the role, responsibilities, team, and what success looks like..."
                rows={4}
                className="mt-1 text-sm"
              />
            </div>

            <div>
              <Label className="text-xs">Requirements</Label>
              <div className="mt-1 space-y-2">
                {jobForm.requirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex-1 text-xs px-3 py-1.5 rounded-md bg-muted/40 border border-border/60">{req}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                      onClick={() => handleRemoveRequirement(i)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
                    placeholder="Add a requirement and press Enter..."
                    className="text-xs"
                  />
                  <Button variant="outline" size="sm" onClick={handleAddRequirement} className="cursor-pointer">
                    <Plus className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-muted/20 dark:bg-card/50">
              <div className="space-y-0.5 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">Listing Visibility</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    jobForm.published
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}>
                    {jobForm.published ? 'Published & Active' : 'Draft (Hidden)'}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {jobForm.published
                    ? 'Publicly visible on the careers page and accepting candidate applications.'
                    : 'Saved as a private draft and hidden from visitors on the website.'}
                </p>
              </div>
              <Switch
                id="job-published"
                checked={jobForm.published}
                onCheckedChange={(v) => setJobForm((f) => ({ ...f, published: v }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/60">
            <Button variant="outline" onClick={() => setIsJobDialogOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleSaveJob} disabled={isSaving} className="cursor-pointer">
              {isSaving ? 'Saving...' : editingJobId ? 'Update Job' : 'Create Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Application Details Popup Dialog ──────────────────────── */}
      <ApplicationDetailDialog
        app={viewingApp}
        open={!!viewingApp}
        onClose={() => setViewingApp(null)}
        onStatusChange={handleAppStatus}
        onDelete={handleDeleteApp}
      />
    </div>
  )
}
