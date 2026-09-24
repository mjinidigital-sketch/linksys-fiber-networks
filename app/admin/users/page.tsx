'use client'

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { authClient } from '@/lib/auth-client'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  flexRender,
} from '@tanstack/react-table'

import {
  Users,
  ShieldCheck,
  UserCheck,
  Edit,
  Save,
  Trash2,
  ExternalLink,
  Plus,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Filter,
  RefreshCw,
} from 'lucide-react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ImageUploader } from '@/components/ui/image-uploader'
import { toast } from '@/components/ui/toast'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'

export default function AdminUsersPage() {
  const session = authClient.useSession()
  const usersList = useQuery(
    api.users.list,
    session.data?.user ? {} : 'skip'
  )
  const currentUserWithProfile = useQuery(
    api.users.getCurrentUserWithProfile,
    session.data?.user ? {} : 'skip'
  )

  const updateUserRole = useMutation(api.users.updateUserRole)
  const updateProfile = useMutation(api.users.updateProfile)
  const syncExistingUsersAction = useAction(api.users.syncExistingUsers)

  const [isSyncing, setIsSyncing] = useState(false)

  // Table states
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false)

  // Edit modal state
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user' | 'editor') => {
    try {
      await updateUserRole({ userId, role: newRole })
      toast.add({
        title: 'Role Updated',
        description: `User role has been changed to ${newRole.toUpperCase()}.`,
        type: 'success',
      })
    } catch (err: any) {
      console.error(err)
      toast.add({
        title: 'Failed to update role',
        description: err?.message || 'Permission denied',
        type: 'error',
      })
    }
  }

  const handleSyncUsers = async () => {
    try {
      setIsSyncing(true)
      const res = await syncExistingUsersAction({})
      toast.add({
        title: 'Better Auth Sync Complete',
        description: `Synced ${res.totalFound} users (${res.created} new created, ${res.updated} updated, ${res.alreadyInSync} up to date).`,
        type: 'success',
      })
    } catch (err: any) {
      toast.add({
        title: 'Sync Failed',
        description: err?.message || 'Failed to sync users with Better Auth',
        type: 'error',
      })
    } finally {
      setIsSyncing(false)
    }
  }

  // Bulk role update action
  const handleBulkRoleChange = async (newRole: 'admin' | 'user' | 'editor') => {
    const selectedRowIndices = Object.keys(rowSelection).filter(k => rowSelection[k])
    if (selectedRowIndices.length === 0) return

    const selectedUsers = selectedRowIndices
      .map(idx => filteredData[parseInt(idx, 10)])
      .filter(Boolean)

    let successCount = 0
    for (const u of selectedUsers) {
      try {
        await updateUserRole({ userId: u.userId, role: newRole })
        successCount++
      } catch (err) {
        console.error(`Failed to update role for ${u.name}:`, err)
      }
    }

    toast.add({
      title: 'Bulk Role Update',
      description: `Successfully updated ${successCount} user(s) to ${newRole.toUpperCase()}.`,
      type: 'success',
    })
    setRowSelection({})
  }

  const handleSaveProfile = async () => {
    if (!editingUser) return
    try {
      setIsSaving(true)
      await updateProfile({
        userId: editingUser.userId,
        name: editingUser.name,
        bio: editingUser.bio,
        phone: editingUser.phone,
        profilePic: editingUser.profilePic,
        profilePicStorageId: editingUser.profilePicStorageId,
        socials: editingUser.socials,
      })

      toast.add({
        title: 'Profile Saved',
        description: 'User profile details updated in Convex.',
        type: 'success',
      })
      setEditingUser(null)
    } catch (err: any) {
      console.error(err)
      toast.add({
        title: 'Save Failed',
        description: err?.message || 'Error updating profile',
        type: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addSocialToEditingUser = () => {
    if (!editingUser) return
    const currentSocials = editingUser.socials || []
    setEditingUser({
      ...editingUser,
      socials: [
        ...currentSocials,
        { platform: 'github', label: 'GitHub', url: 'https://github.com/' },
      ],
    })
  }

  const removeSocialFromEditingUser = (index: number) => {
    if (!editingUser) return
    const currentSocials = [...(editingUser.socials || [])]
    currentSocials.splice(index, 1)
    setEditingUser({
      ...editingUser,
      socials: currentSocials,
    })
  }

  const updateSocialField = (index: number, field: string, value: string) => {
    if (!editingUser) return
    const currentSocials = [...(editingUser.socials || [])]
    currentSocials[index] = {
      ...currentSocials[index],
      [field]: value,
    }
    setEditingUser({
      ...editingUser,
      socials: currentSocials,
    })
  }

  // Filter data by Role selection if active
  const filteredData = useMemo(() => {
    const list = usersList || []
    if (roleFilter === 'all') return list
    return list.filter((u: any) => u.role === roleFilter)
  }, [usersList, roleFilter])

  // Column definitions for TanStack Table
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => {
          const isSorted = column.getIsSorted()
          return (
            <button
              onClick={() => column.toggleSorting(isSorted === 'asc')}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors focus:outline-none"
            >
              User Info
              {isSorted === 'asc' ? (
                <ArrowUp className="size-3.5 text-primary" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="size-3.5 text-primary" />
              ) : (
                <ArrowUpDown className="size-3.5 text-muted-foreground/60" />
              )}
            </button>
          )
        },
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex items-center gap-3">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/60">
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.name || 'User'}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center font-bold text-primary text-xs">
                    {(user.name || user.email || 'U').substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{user.name || 'Anonymous User'}</p>
                <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                  <Mail className="size-3 shrink-0" />
                  {user.email}
                </p>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'role',
        header: ({ column }) => {
          const isSorted = column.getIsSorted()
          return (
            <button
              onClick={() => column.toggleSorting(isSorted === 'asc')}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors focus:outline-none"
            >
              Role
              {isSorted === 'asc' ? (
                <ArrowUp className="size-3.5 text-primary" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="size-3.5 text-primary" />
              ) : (
                <ArrowUpDown className="size-3.5 text-muted-foreground/60" />
              )}
            </button>
          )
        },
        cell: ({ row }) => {
          const user = row.original
          const isAdmin = user.role === 'admin'
          const isEditor = user.role === 'editor'
          return (
            <div className="flex items-center gap-2">
              <Badge
                variant={isAdmin ? 'default' : isEditor ? 'secondary' : 'outline'}
                className="uppercase text-[9px] px-2 py-0.5"
              >
                {isAdmin ? (
                  <ShieldCheck className="size-3 mr-1 text-emerald-400" />
                ) : (
                  <UserCheck className="size-3 mr-1 text-purple-400" />
                )}
                {isEditor ? 'Editor (Staff)' : (user.role || 'user')}
              </Badge>

              <select
                value={user.role || 'user'}
                onChange={(e) => handleRoleChange(user.userId, e.target.value as any)}
                className="rounded-lg border border-border bg-background px-2 py-1 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-primary hover:border-primary/50 cursor-pointer transition-colors"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor (Staff)</option>
              </select>
            </div>
          )
        },
      },
      {
        accessorKey: 'phone',
        header: ({ column }) => {
          const isSorted = column.getIsSorted()
          return (
            <button
              onClick={() => column.toggleSorting(isSorted === 'asc')}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors focus:outline-none"
            >
              Phone
              {isSorted === 'asc' ? (
                <ArrowUp className="size-3.5 text-primary" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="size-3.5 text-primary" />
              ) : (
                <ArrowUpDown className="size-3.5 text-muted-foreground/60" />
              )}
            </button>
          )
        },
        cell: ({ row }) => {
          const phone = row.original.phone
          return phone ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="size-3" />
              {phone}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/40 font-mono">—</span>
          )
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => {
          const isSorted = column.getIsSorted()
          return (
            <button
              onClick={() => column.toggleSorting(isSorted === 'asc')}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors focus:outline-none"
            >
              Joined Date
              {isSorted === 'asc' ? (
                <ArrowUp className="size-3.5 text-primary" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="size-3.5 text-primary" />
              ) : (
                <ArrowUpDown className="size-3.5 text-muted-foreground/60" />
              )}
            </button>
          )
        },
        cell: ({ row }) => {
          const createdAt = row.original.createdAt
          return (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="size-3" />
              {createdAt ? new Date(createdAt).toLocaleDateString() : 'Active'}
            </span>
          )
        },
      },
      // {
      //   accessorKey: 'socials',
      //   header: 'Socials & Bio',
      //   enableSorting: false,
      //   cell: ({ row }) => {
      //     const user = row.original
      //     const socialsCount = user.socials?.length || 0
      //     return (
      //       <div className="space-y-1">
      //         {user.bio ? (
      //           <p className="text-[11px] text-muted-foreground truncate max-w-[180px] italic">
      //             &quot;{user.bio}&quot;
      //           </p>
      //         ) : null}
      //         {socialsCount > 0 ? (
      //           <div className="flex items-center gap-1">
      //             <Badge variant="outline" className="text-[9px] px-1.5 py-0">
      //               {socialsCount} {socialsCount === 1 ? 'link' : 'links'}
      //             </Badge>
      //             <div className="flex gap-1">
      //               {user.socials.slice(0, 2).map((s: any, idx: number) => (
      //                 <a
      //                   key={idx}
      //                   href={s.url}
      //                   target="_blank"
      //                   rel="noreferrer"
      //                   className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5"
      //                 >
      //                   <span>{s.label || s.platform}</span>
      //                   <ExternalLink className="size-2.5" />
      //                 </a>
      //               ))}
      //             </div>
      //           </div>
      //         ) : (
      //           <span className="text-[11px] text-muted-foreground/40 font-mono">No bio</span>
      //         )}
      //       </div>
      //     )
      //   },
      // },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-2.5 hover:bg-primary/10 hover:border-primary/50"
                onClick={() => setEditingUser(user)}
              >
                <Edit className="size-3 mr-1 text-primary" />
                Edit
              </Button>
            </div>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const selectedCount = Object.keys(rowSelection).filter(k => rowSelection[k]).length

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/15 via-card to-card p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <Badge variant="success">Convex RBAC Active</Badge>
              <span className="text-[11px] font-mono text-muted-foreground">
                Total Users: {usersList?.length ?? '...'}
              </span>
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">
              User Directory & Permissions
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Manage accounts, roles, and profiles using TanStack Table with real-time Convex sync.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
                  {currentUserWithProfile?.user?.name ? currentUserWithProfile.user.name.substring(0, 1).toUpperCase() : 'ME'}
                </div>
                <div>
                  <p className="text-xs font-semibold">{currentUserWithProfile?.user?.name || 'Admin User'}</p>
                  <p className="text-[10px] text-muted-foreground">{currentUserWithProfile?.user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar & Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Global Search & Filters */}
          <div className="flex flex-1 flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search all columns (name, email, role...)..."
                className="pl-9 text-xs h-9"
              />
              {globalFilter && (
                <button
                  onClick={() => setGlobalFilter('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Role Filter Selector */}
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs h-9">
              <Filter className="size-3.5 text-muted-foreground" />
              <span className="text-muted-foreground text-[11px]">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent font-medium focus:outline-none text-xs cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor (Staff)</option>
                <option value="user">User</option>
              </select>
            </div>

            {/* Column Toggle Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs gap-1.5"
                onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
              >
                <SlidersHorizontal className="size-3.5" />
                Columns
              </Button>

              {showVisibilityMenu && (
                <div className="absolute right-0 sm:left-0 top-11 z-30 w-48 rounded-2xl border border-border bg-popover p-3 shadow-xl backdrop-blur-md space-y-2">
                  <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                    <span className="text-xs font-semibold">Toggle Columns</span>
                    <button
                      onClick={() => setShowVisibilityMenu(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {table
                      .getAllColumns()
                      .filter((col) => col.getCanHide())
                      .map((column) => (
                        <label
                          key={column.id}
                          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer py-1 px-1 rounded-lg hover:bg-muted/50"
                        >
                          <Checkbox
                            checked={column.getIsVisible()}
                            onChange={column.getToggleVisibilityHandler()}
                          />
                          <span className="capitalize">{column.id}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Table summary & Sync Better Auth Button */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs gap-1.5 border-primary/30 hover:bg-primary/10"
              onClick={handleSyncUsers}
              disabled={isSyncing}
            >
              <RefreshCw className={`size-3.5 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
              {isSyncing ? 'Syncing Users...' : 'Sync Better Auth'}
            </Button>
            <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-2">
              <span>
                Showing <strong>{table.getRowModel().rows.length}</strong> of{' '}
                <strong>{filteredData.length}</strong> users
              </span>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar (Visible when rows selected) */}
        {selectedCount > 0 && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-3 text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px]">
                {selectedCount} selected
              </Badge>
              <span className="text-muted-foreground">Apply bulk actions to selected users:</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-[11px]">Set Role:</span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] bg-background"
                onClick={() => handleBulkRoleChange('admin')}
              >
                Make Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] bg-background"
                onClick={() => handleBulkRoleChange('editor')}
              >
                Make Editor (Staff)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] bg-background"
                onClick={() => handleBulkRoleChange('user')}
              >
                Make User
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
                onClick={() => setRowSelection({})}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* TanStack Data Table */}
      {usersList === undefined ? (
        <div className="flex items-center justify-center p-16 rounded-2xl border border-border bg-card/40">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : table.getRowModel().rows.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Users className="mx-auto size-12 text-muted-foreground/40" />
          <p className="mt-4 text-base font-semibold">No matching users found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {globalFilter || roleFilter !== 'all'
              ? 'Try resetting your search query or filters.'
              : 'Users will appear here once they register.'}
          </p>
          {(globalFilter || roleFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 text-xs"
              onClick={() => {
                setGlobalFilter('')
                setRoleFilter('all')
              }}
            >
              Reset Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Rows per page:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="rounded-lg border border-border bg-card px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {[5, 10, 20, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-6">
              <span className="text-xs text-muted-foreground">
                Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of{' '}
                <strong>{table.getPageCount()}</strong>
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="size-8 p-0"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="First page"
                >
                  <ChevronsLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="size-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="size-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="size-8 p-0"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  aria-label="Last page"
                >
                  <ChevronsRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-background p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold">Edit User Profile</h3>
                <p className="text-xs text-muted-foreground">
                  Update personal info, socials, and avatar stored in Convex.
                </p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Avatar Upload with Convex Storage */}
              <div className="space-y-1.5">
                <Label>Profile Picture (Convex Storage)</Label>
                <ImageUploader
                  value={editingUser.profilePic}
                  onChange={(url, storageId) =>
                    setEditingUser({
                      ...editingUser,
                      profilePic: url,
                      profilePicStorageId: storageId,
                    })
                  }
                  aspectRatio="square"
                  placeholder="Upload profile photo"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input
                    value={editingUser.name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    placeholder="e.g. Victor Maina"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone Number</Label>
                  <Input
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    placeholder="+254 700 000 000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Bio / Headline</Label>
                <Input
                  value={editingUser.bio || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, bio: e.target.value })}
                  placeholder="Full-Stack Engineer & Designer..."
                />
              </div>

              {/* Social Profiles */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label>Social Profiles</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={addSocialToEditingUser}
                  >
                    <Plus className="size-3 mr-1" /> Add Social
                  </Button>
                </div>

                <div className="space-y-2">
                  {(editingUser.socials || []).map((s: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={s.label || ''}
                        onChange={(e) => updateSocialField(idx, 'label', e.target.value)}
                        placeholder="Platform (e.g. GitHub)"
                        className="w-1/3 text-xs"
                      />
                      <Input
                        value={s.url || ''}
                        onChange={(e) => updateSocialField(idx, 'url', e.target.value)}
                        placeholder="https://..."
                        className="flex-1 text-xs"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={() => removeSocialFromEditingUser(idx)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <Button variant="outline" onClick={() => setEditingUser(null)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? <Loader2 className="size-4 animate-spin mr-1" /> : <Save className="size-4 mr-1" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
