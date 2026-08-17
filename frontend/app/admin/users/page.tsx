"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Users, 
  Search, 
  MoreVertical, 
  Eye, 
  Ban, 
  CheckCircle, 
  Trash2, 
  Mail, 
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Download,
  AlertTriangle
} from "lucide-react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MOCK_USERS, AdminUser } from "@/lib/admin-mock-data";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesStatus = statusFilter === "All" || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const handleToggleSuspend = (user: AdminUser) => {
    const newStatus = user.status === "Suspended" ? "Active" : "Suspended";
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );
    showNotification(
      `User ${user.name} has been ${newStatus === "Suspended" ? "suspended" : "reactivated"}.`
    );
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    showNotification(`User ${userToDelete.name} was successfully deleted.`);
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setRoleFilter("All");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl text-sm border border-purple-500/30 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle size={18} className="text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              User Directory & Permissions
            </h1>
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-semibold px-2.5 py-0.5">
              {filteredUsers.length} Total Users
            </Badge>
          </div>
          <p className="text-sm md:text-base text-slate-600 font-medium">
            Manage patient records, licensed dental clinicians, and platform administrator privileges.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-10 px-4 text-sm font-semibold text-slate-700 border-slate-300"
            onClick={() => showNotification("Exporting CSV report for active users...")}
          >
            <Download size={15} className="mr-2 text-slate-500" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <span className="font-bold text-slate-600">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer font-medium"
            >
              <option value="All">All Roles</option>
              <option value="Patient">Patient</option>
              <option value="Dentist">Dentist</option>
              <option value="Clinic Staff">Clinic Staff</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <span className="font-bold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Verified">Verified</option>
              <option value="Suspended">Suspended</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <span className="font-bold text-slate-600">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer font-medium"
            >
              <option value={5}>5 / page</option>
              <option value={8}>8 / page</option>
              <option value={15}>15 / page</option>
              <option value={25}>25 / page</option>
            </select>
          </div>

          {(searchQuery || roleFilter !== "All" || statusFilter !== "All") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-sm text-purple-700 hover:bg-purple-50 font-bold"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Users Data Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-11 w-11 rounded-full" />
                <Skeleton className="h-5 flex-1 rounded-lg" />
                <Skeleton className="h-5 w-28 rounded-lg" />
                <Skeleton className="h-5 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100 shadow-xs">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Users Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              We couldn't find any users matching "{searchQuery}" with the selected filter criteria.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="mt-2 text-sm border-purple-200 text-purple-700 hover:bg-purple-50 font-semibold"
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-72 text-xs font-bold uppercase tracking-wider text-slate-500">User / Identity</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Role</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Signup Date</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Consultations</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Last Active</TableHead>
                  <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-purple-50/40 transition-colors">
                    {/* User info */}
                    <TableCell>
                      <div className="flex items-center gap-3.5">
                        <Avatar className="h-10 w-10 border border-slate-200">
                          <AvatarFallback className={`${user.avatarBg} font-bold text-sm`}>
                            {user.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-900 text-sm truncate">
                            {user.name}
                          </span>
                          <span className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                            <Mail size={13} className="text-slate-400" />
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <Badge className={`text-xs font-semibold ${
                        user.role === 'Admin' 
                          ? 'bg-purple-100 text-purple-800 border-purple-200' 
                          : user.role === 'Dentist'
                          ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                          : user.role === 'Clinic Staff'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {user.role}
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge className={`text-xs font-semibold ${
                        user.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                          : user.status === 'Verified'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : user.status === 'Suspended'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        <span className={`h-2 w-2 rounded-full mr-1.5 ${
                          user.status === 'Active' || user.status === 'Verified' ? 'bg-emerald-500' : user.status === 'Suspended' ? 'bg-red-500' : 'bg-amber-500'
                        }`}></span>
                        {user.status}
                      </Badge>
                    </TableCell>

                    {/* Signup Date */}
                    <TableCell className="text-sm text-slate-600 font-mono">
                      {user.signupDate}
                    </TableCell>

                    {/* Total Chats */}
                    <TableCell className="text-sm text-slate-700">
                      <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                        {user.totalChats} chats
                      </span>
                    </TableCell>

                    {/* Last Active */}
                    <TableCell className="text-sm text-slate-500 font-medium">
                      {user.lastActive}
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-xl">
                            <MoreVertical size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 shadow-xl border border-slate-200 rounded-2xl p-1.5">
                          <DropdownMenuLabel className="text-xs text-slate-500 font-bold px-3 py-1.5 uppercase tracking-wider">
                            User Actions
                          </DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedUser(user);
                              setIsViewSheetOpen(true);
                            }}
                            className="text-sm cursor-pointer rounded-xl flex items-center gap-2.5 py-2 font-medium"
                          >
                            <Eye size={16} className="text-purple-600" />
                            View Full Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleSuspend(user)}
                            className="text-sm cursor-pointer rounded-xl flex items-center gap-2.5 py-2 font-medium"
                          >
                            <Ban size={16} className={user.status === "Suspended" ? "text-emerald-600" : "text-amber-600"} />
                            {user.status === "Suspended" ? "Reactivate User" : "Suspend Account"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              setUserToDelete(user);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-sm text-red-600 cursor-pointer rounded-xl flex items-center gap-2.5 py-2 font-semibold focus:bg-red-50 focus:text-red-700"
                          >
                            <Trash2 size={16} />
                            Delete Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Real Pagination Controls */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600 font-medium">
          <div>
            Showing <strong className="text-slate-900">{filteredUsers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{" "}
            <strong className="text-slate-900">{Math.min(currentPage * pageSize, filteredUsers.length)}</strong> of{" "}
            <strong className="text-slate-900">{filteredUsers.length}</strong> users
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="h-9 px-2 text-slate-600 disabled:opacity-40"
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-9 px-2 text-slate-600 disabled:opacity-40"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </Button>

            {/* Page Buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                return (
                  <React.Fragment key={page}>
                    {prev && page - prev > 1 && <span className="px-1 text-slate-400">...</span>}
                    <Button
                      size="sm"
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className={`h-9 w-9 text-sm font-bold rounded-xl ${
                        currentPage === page
                          ? "bg-purple-700 text-white hover:bg-purple-800"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                );
              })}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-9 px-2 text-slate-600 disabled:opacity-40"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="h-9 px-2 text-slate-600 disabled:opacity-40"
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* User Details Sheet */}
      <Sheet open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
        <SheetContent className="sm:max-w-md p-6 sm:p-8 overflow-y-auto">
          {selectedUser && (
            <div className="space-y-6">
              <SheetHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-purple-200">
                    <AvatarFallback className={`${selectedUser.avatarBg} font-bold text-base`}>
                      {selectedUser.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-xl font-bold text-slate-900">
                      {selectedUser.name}
                    </SheetTitle>
                    <SheetDescription className="text-sm text-slate-500 font-medium">
                      {selectedUser.email}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-5 text-sm">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">Role</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedUser.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">Status</span>
                    <Badge className="mt-1 text-xs bg-purple-100 text-purple-800 border-purple-200">
                      {selectedUser.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">Signed Up</span>
                    <span className="font-semibold text-slate-700 font-mono text-sm mt-0.5 block">{selectedUser.signupDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">Last Active</span>
                    <span className="font-semibold text-slate-700 text-sm mt-0.5 block">{selectedUser.lastActive}</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-purple-100 bg-purple-50/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-950 text-sm">AI Consultations</span>
                    <span className="font-mono font-extrabold text-sm text-purple-700 bg-white px-3 py-1 rounded-xl border border-purple-200">
                      {selectedUser.totalChats} Sessions
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    Patient has active chat history regarding routine dental care, oral hygiene, and emergency symptom triage.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    className="w-full h-11 bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm rounded-xl"
                    onClick={() => {
                      handleToggleSuspend(selectedUser);
                      setIsViewSheetOpen(false);
                    }}
                  >
                    {selectedUser.status === "Suspended" ? "Reactivate Account" : "Suspend User Access"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-11 text-sm font-semibold border-slate-200 rounded-xl"
                    onClick={() => setIsViewSheetOpen(false)}
                  >
                    Close Profile
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md p-6 sm:p-8 rounded-3xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <AlertTriangle size={24} />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Confirm Account Deletion
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to permanently delete user <strong className="text-slate-900">{userToDelete?.name}</strong> ({userToDelete?.email})? This action cannot be undone and will purge all consultation transcripts and booking history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="h-11 px-5 text-sm font-semibold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              className="h-11 px-5 text-sm bg-red-600 hover:bg-red-700 font-bold rounded-xl"
            >
              Delete User Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
