'use client'

import { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { useRouter } from 'next/navigation'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { authClient } from '@/lib/auth-client'
import {
  Briefcase,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Lock,
  Search,
  X,
  FileText,
  Loader2,
  Upload,
  Paperclip,
  Plus,
  Trash2,
  Phone,
  Mail,
  User,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  File,
  FileCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'

// ─── Types ────────────────────────────────────────────────────────────────

type JobType = 'full-time' | 'part-time' | 'contract' | 'remote'

const TYPE_BADGE: Record<JobType, string> = {
  'full-time': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'part-time': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'contract': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'remote': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
}

const TYPE_LABEL: Record<JobType, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  'contract': 'Contract',
  'remote': 'Remote',
}

interface AdditionalDoc {
  file: File
  title: string
  storageId?: Id<'_storage'>
  uploading?: boolean
  error?: string
}

// ─── File Upload Hook ─────────────────────────────────────────────────────

function useFileUpload() {
  const generateUploadUrl = useMutation(api.careers.generateUploadUrl)

  const uploadFile = useCallback(async (file: File): Promise<Id<'_storage'>> => {
    const uploadUrl = await generateUploadUrl()
    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    })
    if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`)
    const { storageId } = await res.json()
    return storageId as Id<'_storage'>
  }, [generateUploadUrl])

  return { uploadFile }
}

// ─── File Drop Zone ────────────────────────────────────────────────────────

function FileDropZone({
  accept,
  label,
  hint,
  file,
  onFile,
  onClear,
  uploading,
  uploaded,
}: {
  accept: string
  label: string
  hint: string
  file: File | null
  onFile: (f: File) => void
  onClear: () => void
  uploading?: boolean
  uploaded?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }

  return (
    <div
      className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer ${
        dragging
          ? 'border-primary bg-primary/5 scale-[1.01]'
          : file
          ? 'border-emerald-500/50 bg-emerald-500/5'
          : 'border-border/60 bg-card/30 hover:border-primary/40 hover:bg-primary/5'
      }`}
      onClick={() => !file && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }}
      />
      <div className="flex items-center gap-3 p-3">
        {file ? (
          <>
            <div className="size-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              {uploading ? (
                <Loader2 className="size-4 text-emerald-500 animate-spin" />
              ) : uploaded ? (
                <FileCheck className="size-4 text-emerald-500" />
              ) : (
                <File className="size-4 text-emerald-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{file.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {uploading ? 'Uploading...' : uploaded ? 'Ready to submit' : `${(file.size / 1024).toFixed(0)} KB`}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear() }}
              className="size-6 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </>
        ) : (
          <>
            <div className="size-9 rounded-lg bg-muted/50 border border-border/60 flex items-center justify-center shrink-0">
              <Upload className="size-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground">{label}</p>
              <p className="text-[11px] text-muted-foreground">{hint}</p>
            </div>
            <span className="text-[11px] text-primary font-medium">Browse</span>
          </>
        )}
      </div>
    </div>
  )
}

// ─── ApplyModal ───────────────────────────────────────────────────────────

function ApplyModal({
  jobId,
  jobTitle,
  open,
  onClose,
  currentUser,
}: {
  jobId: Id<'jobs'>
  jobTitle: string
  open: boolean
  onClose: () => void
  currentUser: { name?: string | null; email?: string | null } | null
}) {
  const { toast } = useToast()
  const applyMutation = useMutation(api.careers.applyToJob)
  const alreadyApplied = useQuery(api.careers.hasApplied, { jobId })
  const { uploadFile } = useFileUpload()

  // ── Personal details
  const [name, setName] = useState(currentUser?.name ?? '')
  const [email, setEmail] = useState(currentUser?.email ?? '')
  const [phone, setPhone] = useState('')

  // ── Cover letter
  const [clMode, setClMode] = useState<'write' | 'upload'>('write')
  const [coverLetter, setCoverLetter] = useState('')
  const [clFile, setClFile] = useState<File | null>(null)
  const [clStorageId, setClStorageId] = useState<Id<'_storage'> | null>(null)
  const [clUploading, setClUploading] = useState(false)

  // ── Resume
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeStorageId, setResumeStorageId] = useState<Id<'_storage'> | null>(null)
  const [resumeUploading, setResumeUploading] = useState(false)

  // ── Additional docs
  const [additionalDocs, setAdditionalDocs] = useState<AdditionalDoc[]>([])

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [step, setStep] = useState<'details' | 'documents'>('details')

  // Upload cover letter file
  const handleClFileSelect = async (file: File) => {
    setClFile(file)
    setClUploading(true)
    try {
      const sid = await uploadFile(file)
      setClStorageId(sid)
    } catch {
      toast({ title: 'Upload failed', description: 'Could not upload cover letter. Try again.', variant: 'destructive' })
      setClFile(null)
    } finally {
      setClUploading(false)
    }
  }

  // Upload resume file
  const handleResumeSelect = async (file: File) => {
    setResumeFile(file)
    setResumeUploading(true)
    try {
      const sid = await uploadFile(file)
      setResumeStorageId(sid)
    } catch {
      toast({ title: 'Upload failed', description: 'Could not upload resume. Try again.', variant: 'destructive' })
      setResumeFile(null)
    } finally {
      setResumeUploading(false)
    }
  }

  // Add additional doc slot
  const addDocSlot = () => {
    setAdditionalDocs((prev) => [...prev, { file: null as any, title: '' }])
  }

  const handleAdditionalDocFile = async (idx: number, file: File) => {
    setAdditionalDocs((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, file, uploading: true, error: undefined } : d))
    )
    try {
      const sid = await uploadFile(file)
      setAdditionalDocs((prev) =>
        prev.map((d, i) => (i === idx ? { ...d, storageId: sid, uploading: false } : d))
      )
    } catch {
      setAdditionalDocs((prev) =>
        prev.map((d, i) => (i === idx ? { ...d, uploading: false, error: 'Upload failed' } : d))
      )
    }
  }

  const removeAdditionalDoc = (idx: number) => {
    setAdditionalDocs((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateDocTitle = (idx: number, title: string) => {
    setAdditionalDocs((prev) => prev.map((d, i) => (i === idx ? { ...d, title } : d)))
  }

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      toast({ title: 'Name and email are required', variant: 'destructive' })
      return
    }
    const hasCl = (clMode === 'write' && coverLetter.trim().length >= 50) ||
      (clMode === 'upload' && !!clStorageId)
    if (!hasCl) {
      if (clMode === 'write') {
        toast({ title: 'Cover letter too short', description: 'Minimum 50 characters.', variant: 'destructive' })
      } else {
        toast({ title: 'Please upload a cover letter file', variant: 'destructive' })
      }
      return
    }
    if (additionalDocs.some((d) => d.uploading)) {
      toast({ title: 'Please wait for uploads to finish', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const docsPayload = additionalDocs
        .filter((d) => d.storageId && d.file)
        .map((d) => ({
          storageId: d.storageId!,
          title: d.title || d.file.name,
          fileName: d.file.name,
        }))

      await applyMutation({
        jobId,
        applicantName: name.trim(),
        applicantEmail: email.trim(),
        phone: phone.trim() || undefined,
        coverLetter: clMode === 'write' ? coverLetter.trim() : undefined,
        coverLetterStorageId: clMode === 'upload' ? clStorageId ?? undefined : undefined,
        resumeStorageId: resumeStorageId ?? undefined,
        resumeFileName: resumeFile?.name,
        additionalDocs: docsPayload.length > 0 ? docsPayload : undefined,
      })
      setSubmitted(true)
      toast({ title: 'Application submitted! 🎉', description: "We'll review it and get back to you soon." })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  // Success state
  if (alreadyApplied || submitted) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md" onClose={onClose}>
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="size-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="size-10 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Application Submitted!</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                You've applied for <span className="text-foreground font-semibold">{jobTitle}</span>.
                Our team reviews every application personally — we'll be in touch soon!
              </p>
            </div>
            <Button onClick={onClose} variant="outline" className="mt-2 gap-2">
              <CheckCircle2 className="size-4" /> Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onClose={onClose}>
        <DialogHeader className="pb-2">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <Briefcase className="size-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Apply for {jobTitle}</DialogTitle>
              <DialogDescription className="text-sm mt-0.5">
                We review every application personally — fill this in carefully.
              </DialogDescription>
            </div>
          </div>

          {/* Step tabs */}
          <div className="flex gap-1 mt-4 p-1 rounded-xl bg-muted/40 border border-border/60">
            {(['details', 'documents'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  step === s
                    ? 'bg-background text-foreground shadow-sm border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {s === 'details' ? '① Personal Details' : '② Documents & Cover Letter'}
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* ── Step 1: Personal Details ── */}
        {step === 'details' && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs flex items-center gap-1.5 mb-1.5">
                  <User className="size-3.5 text-muted-foreground" /> Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs flex items-center gap-1.5 mb-1.5">
                  <Mail className="size-3.5 text-muted-foreground" /> Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  className="text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs flex items-center gap-1.5 mb-1.5">
                <Phone className="size-3.5 text-muted-foreground" /> Phone Number
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254 700 000 000"
                type="tel"
                className="text-sm"
              />
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                <AlertCircle className="size-3.5 shrink-0 mt-0.5 text-primary" />
                Make sure your contact info is correct — we'll reach out to schedule interviews.
              </p>
            </div>
          </div>
        )}

        {/* ── Step 2: Documents ── */}
        {step === 'documents' && (
          <div className="space-y-5 py-2">
            {/* Cover Letter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <FileText className="size-3.5 text-muted-foreground" /> Cover Letter
                  <span className="text-destructive">*</span>
                </Label>
                {/* Toggle write / upload */}
                <div className="flex p-0.5 rounded-lg bg-muted/50 border border-border/60 gap-0.5">
                  {(['write', 'upload'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setClMode(m)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        clMode === m
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {m === 'write' ? '✏️ Write' : '📎 Upload'}
                    </button>
                  ))}
                </div>
              </div>

              {clMode === 'write' ? (
                <div>
                  <Textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell us why you're a great fit for this role. Mention your relevant experience, passion, and what you'd bring to the team..."
                    rows={7}
                    className="text-sm resize-none"
                  />
                  <p className={`text-[11px] mt-1 ${coverLetter.length >= 50 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                    {coverLetter.length} characters {coverLetter.length < 50 ? `(${50 - coverLetter.length} more to go)` : '✓'}
                  </p>
                </div>
              ) : (
                <div>
                  <FileDropZone
                    accept=".pdf,.doc,.docx,.txt"
                    label="Upload your cover letter"
                    hint="PDF, Word, or TXT — up to 10 MB"
                    file={clFile}
                    onFile={handleClFileSelect}
                    onClear={() => { setClFile(null); setClStorageId(null) }}
                    uploading={clUploading}
                    uploaded={!!clStorageId}
                  />
                </div>
              )}
            </div>

            {/* Resume / CV */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Paperclip className="size-3.5 text-muted-foreground" /> Resume / CV
                <span className="text-muted-foreground font-normal">(recommended)</span>
              </Label>
              <FileDropZone
                accept=".pdf,.doc,.docx"
                label="Upload your CV or Resume"
                hint="PDF or Word document — up to 10 MB"
                file={resumeFile}
                onFile={handleResumeSelect}
                onClear={() => { setResumeFile(null); setResumeStorageId(null) }}
                uploading={resumeUploading}
                uploaded={!!resumeStorageId}
              />
            </div>

            {/* Additional Documents */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Paperclip className="size-3.5 text-muted-foreground" /> Additional Documents
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addDocSlot}
                  className="h-7 gap-1.5 text-[11px] font-semibold"
                >
                  <Plus className="size-3" /> Add Document
                </Button>
              </div>

              {additionalDocs.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-3 rounded-xl border border-dashed border-border/50">
                  Portfolios, certificates, references — add any supporting document.
                </p>
              )}

              {additionalDocs.map((doc, idx) => (
                <div key={idx} className="rounded-xl border border-border/60 bg-card/30 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={doc.title}
                      onChange={(e) => updateDocTitle(idx, e.target.value)}
                      placeholder="Document title (e.g. Portfolio, Certificate)"
                      className="text-xs h-8 flex-1"
                    />
                    <button
                      onClick={() => removeAdditionalDoc(idx)}
                      className="size-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors shrink-0"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <FileDropZone
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                    label="Upload document"
                    hint="PDF, Word, image, or ZIP"
                    file={doc.file || null}
                    onFile={(f) => handleAdditionalDocFile(idx, f)}
                    onClear={() => {
                      setAdditionalDocs((prev) =>
                        prev.map((d, i) => (i === idx ? { ...d, file: null as any, storageId: undefined } : d))
                      )
                    }}
                    uploading={doc.uploading}
                    uploaded={!!doc.storageId}
                  />
                  {doc.error && (
                    <p className="text-[11px] text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" /> {doc.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border/60">
          {step === 'details' ? (
            <>
              <Button variant="outline" onClick={onClose} className="sm:mr-auto">Cancel</Button>
              <Button
                onClick={() => {
                  if (!name.trim() || !email.trim()) {
                    toast({ title: 'Name and email are required', variant: 'destructive' })
                    return
                  }
                  setStep('documents')
                }}
                className="gap-2"
              >
                Next: Documents <ArrowRight className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep('details')} className="sm:mr-auto gap-2">
                ← Back
              </Button>
              <Button
                variant="secondary"
                onClick={handleSubmit}
                disabled={submitting || clUploading || resumeUploading}
                className="gap-2 min-w-32 font-semibold shadow-xs cursor-pointer"
              >
                {submitting ? (
                  <><Loader2 className="size-4 animate-spin" /> Submitting...</>
                ) : (
                  <><FileText className="size-4" /> Submit Application</>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Job Details & Requirements Modal (Popup) ───────────────────────────

function JobDetailsModal({
  job,
  open,
  onClose,
  onApply,
  isAuthenticated,
}: {
  job: {
    _id: Id<'jobs'>
    title: string
    department: string
    location: string
    type: JobType
    description: string
    requirements: string[]
    salary?: string
  } | null
  open: boolean
  onClose: () => void
  onApply: (id: Id<'jobs'>, title: string) => void
  isAuthenticated: boolean
}) {
  if (!job) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[92vw] max-w-2xl max-h-[90vh] overflow-y-auto" onClose={onClose}>
        <DialogHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge className={`text-xs border font-medium ${TYPE_BADGE[job.type]}`}>
              {TYPE_LABEL[job.type]}
            </Badge>
            <Badge variant="outline" className="text-xs font-mono">
              {job.department}
            </Badge>
          </div>

          <DialogTitle className="text-2xl font-bold text-foreground">
            {job.title}
          </DialogTitle>

          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" />
              {job.location}
            </span>
            {job.salary && (
              <span className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20">
                  KES
                </span>
                <span className="text-foreground font-medium">
                  {job.salary.replace(/^KES\s*/i, '').replace(/^KSh\s*/i, '')}
                </span>
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Job Overview / Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Briefcase className="size-3.5 text-primary" />
              About the Role
            </h4>
            <div className="p-4 rounded-xl border border-border/80 bg-muted/10 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          {/* Key Requirements */}
          {job.requirements.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                Key Requirements & Qualifications ({job.requirements.length})
              </h4>
              <div className="rounded-xl border border-border/80 bg-card/60 p-4 space-y-2.5">
                {job.requirements.map((req, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                    <div className="size-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="size-3 text-emerald-500" />
                    </div>
                    <span className="leading-snug">{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Why Work With Us */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <FileCheck className="size-3.5" />
              Why Join Linksys Fiber Networks
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary shrink-0" />
                Competitive pay & transparent growth
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary shrink-0" />
                Direct fiber networking hands-on training
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary shrink-0" />
                High-speed employee internet connection
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary shrink-0" />
                Supportive, community-first team in Molo
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border/60 flex flex-row items-center justify-between sm:justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs cursor-pointer">
            Close
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="gap-2 font-semibold text-xs cursor-pointer shadow-xs"
            onClick={() => {
              onClose()
              onApply(job._id, job.title)
            }}
          >
            {isAuthenticated ? (
              <>
                <FileText className="size-3.5" /> Apply for Position
              </>
            ) : (
              <>
                <Lock className="size-3.5" /> Sign in to Apply
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Job Card ─────────────────────────────────────────────────────────────

function JobCard({
  job,
  onApply,
  onViewRequirements,
  isAuthenticated,
}: {
  job: {
    _id: Id<'jobs'>
    title: string
    department: string
    location: string
    type: JobType
    description: string
    requirements: string[]
    salary?: string
  }
  onApply: (id: Id<'jobs'>, title: string) => void
  onViewRequirements: (job: any) => void
  isAuthenticated: boolean
}) {
  return (
    <Card className="w-full border-border/80 bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden">
      <div className="p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left / Middle: Details */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`text-xs border font-medium ${TYPE_BADGE[job.type]}`}>
              {TYPE_LABEL[job.type]}
            </Badge>
            <Badge variant="outline" className="text-xs font-mono">
              {job.department}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
              <MapPin className="size-3.5 text-primary" />
              {job.location}
            </span>
            {job.salary && (
              <span className="flex items-center gap-1.5 text-xs">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20">
                  KES
                </span>
                <span className="font-semibold text-foreground">
                  {job.salary.replace(/^KES\s*/i, '').replace(/^KSh\s*/i, '')}
                </span>
              </span>
            )}
          </div>

          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold group-hover:text-primary dark:group-hover:text-accent-foreground transition-colors">
              {job.title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1.5 line-clamp-2 max-w-3xl leading-relaxed">
              {job.description}
            </CardDescription>
          </div>

          {job.requirements.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {job.requirements.slice(0, 3).map((req, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2.5 py-0.5 rounded-md bg-muted/40 border border-border/60 text-muted-foreground truncate max-w-xs"
                >
                  ✓ {req}
                </span>
              ))}
              {job.requirements.length > 3 && (
                <span className="text-[11px] px-2 py-0.5 text-primary font-medium">
                  +{job.requirements.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Far Right: Actions */}
        <div className="flex flex-row sm:flex-row lg:flex-col items-center lg:items-end justify-between sm:justify-end gap-3 w-full lg:w-auto shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border/50">
          <Button
            variant="outline"
            size="lg"
            onClick={() => onViewRequirements(job)}
            className="border-secondary dark:border-secondary text-sm gap-1.5 cursor-pointer font-medium hover:text-primary hover:border-primary/50 flex-1 sm:flex-initial"
          >
            <FileText className="size-3.5 text-secondary" />
            <span>Requirements</span>
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="gap-2 font-semibold text-sm cursor-pointer shadow-xs min-w-[140px] flex-1 sm:flex-initial"
            onClick={() => onApply(job._id, job.title)}
          >
            {isAuthenticated ? (
              <><FileText className="size-4" /> Apply For Job</>
            ) : (
              <><Lock className="size-4" /> Sign in to Apply</>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ─── Careers Section ───────────────────────────────────────────────────────

export function CareersSection() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const jobs = useQuery(api.careers.listPublishedJobs)
  const isLoading = jobs === undefined

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<JobType | 'all'>('all')
  const [selectedJob, setSelectedJob] = useState<{ id: Id<'jobs'>; title: string } | null>(null)
  const [viewingDetailsJob, setViewingDetailsJob] = useState<any | null>(null)

  const jobsList = jobs ?? []
  const filteredJobs = jobsList.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || j.type === typeFilter
    return matchesSearch && matchesType
  })

  const handleApply = (jobId: Id<'jobs'>, jobTitle: string) => {
    if (!session?.user) {
      router.push(`/auth/login?redirect=/careers`)
      return
    }
    setSelectedJob({ id: jobId, title: jobTitle })
  }

  const handleViewRequirements = (job: any) => {
    setViewingDetailsJob(job)
  }

  const totalJobs = jobsList.length
  const noResults = !isLoading && filteredJobs.length === 0

  return (
    <div id="open-positions" className="w-full">
      <div className="rounded-3xl border border-border/80 bg-card/50 p-6 sm:p-8 md:p-10 shadow-sm space-y-8">
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, department, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            {(['all', 'full-time', 'part-time', 'contract', 'remote'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  typeFilter === t
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card text-muted-foreground border-border/80 hover:border-primary/50 hover:text-foreground'
                }`}
              >
                {t === 'all' ? 'All Roles' : TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Skeleton state */}
        {isLoading && (
          <div className="flex flex-col gap-4 w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 w-full rounded-2xl border border-border/60 bg-card/30 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {noResults && (
          <div className="text-center py-20">
            <Briefcase className="size-12 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="text-lg font-bold text-foreground">
              {totalJobs === 0 ? 'No open positions right now' : 'No positions match your search'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              {totalJobs === 0
                ? 'Check back soon or send your CV for future openings!'
                : 'Try adjusting your search query or filter options.'}
            </p>
          </div>
        )}

        {/* Full-width Job Cards Column List */}
        <div className="flex flex-col gap-4 w-full">
          {filteredJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job as any}
              onApply={handleApply}
              onViewRequirements={handleViewRequirements}
              isAuthenticated={!!session?.user}
            />
          ))}
        </div>

        {/* Auth nudge banner */}
        {!session?.user && totalJobs > 0 && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center mt-8">
            <Lock className="size-8 mx-auto mb-3 text-primary/70" />
            <h3 className="text-base font-bold text-foreground">Sign in to Apply</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Create a free account or sign in to submit your job application.
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Button variant="outline" size="sm" onClick={() => router.push('/auth/sign-up')}>
                Create Account
              </Button>
              <Button size="sm" onClick={() => router.push('/auth/login?redirect=/careers')}>
                Sign In <ArrowRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Requirements & Details Popup Modal */}
      <JobDetailsModal
        job={viewingDetailsJob}
        open={!!viewingDetailsJob}
        onClose={() => setViewingDetailsJob(null)}
        onApply={handleApply}
        isAuthenticated={!!session?.user}
      />

      {/* Apply Modal */}
      {selectedJob && (
        <ApplyModal
          jobId={selectedJob.id}
          jobTitle={selectedJob.title}
          open={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          currentUser={session?.user ?? null}
        />
      )}
    </div>
  )
}
