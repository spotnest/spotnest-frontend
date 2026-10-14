"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import {
    getAdminUsers,
    adminUpdateUser,
    adminDeleteUser,
} from "@/src/modules/auth/services/authServices";
import type { AdminUser, AdminUpdateUserPayload, UserRole } from "@/src/modules/auth/types/auth";
import { dashboardPathForRole } from "@/src/constants/routes";
import { useAppSelector } from "@/src/store/hook";

function RoleBadge({ role }: { role: UserRole }) {
    const styles: Record<UserRole, string> = {
        admin: "bg-[#d9f4f3] text-[#00696b] border-[#9bd9d6]",
        owner: "bg-[#ede9fe] text-[#5b21b6] border-[#ddd6fe]",
        tenant: "bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]",
        user: "bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                styles[role] ?? styles.user
            }`}
        >
            {role}
        </span>
    );
}

function StatusBadge({ user }: { user: AdminUser }) {
    if (user.isBlock || user.status === ("blocked" as unknown)) {
        return (
            <span className="inline-flex items-center rounded-full bg-[#fee2e2] px-2.5 py-0.5 text-xs font-bold text-[#b91c1c] border border-[#fca5a5]">
                Blocked
            </span>
        );
    }

    if (user.status === "active") {
        return (
            <span className="inline-flex items-center rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-xs font-bold text-[#15803d] border border-[#86efac]">
                Active
            </span>
        );
    }

    if (user.status === "suspended") {
        return (
            <span className="inline-flex items-center rounded-full bg-[#fef3c7] px-2.5 py-0.5 text-xs font-bold text-[#b45309] border border-[#fde68a]">
                Suspended
            </span>
        );
    }

    return (
        <span className="inline-flex items-center rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-xs font-bold text-[#64748b] border border-[#cbd5e1]">
            Inactive
        </span>
    );
}

function VerificationStatus({ user }: { user: AdminUser }) {
    if (user.role !== "owner") {
        return <span className="text-xs text-[#94a3b8]">—</span>;
    }

    if (user.verificationStatus === "approved") {
        return (
            <span className="inline-flex items-center rounded-full bg-[#d9f4f3] px-2.5 py-0.5 text-xs font-bold text-[#00696b]">
                Approved
            </span>
        );
    }

    if (user.verificationStatus === "rejected") {
        return (
            <span className="inline-flex items-center rounded-full bg-[#fff0ee] px-2.5 py-0.5 text-xs font-bold text-[#b42318]">
                Rejected
            </span>
        );
    }

    return (
        <span className="inline-flex items-center rounded-full bg-[#fff0dc] px-2.5 py-0.5 text-xs font-bold text-[#95611d]">
            Pending
        </span>
    );
}

export default function UsersPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { user: currentUser, isInitialized } = useAppSelector(
        (state) => state.auth
    );

    const isAdmin = currentUser?.role === "admin";

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Modal state for editing
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [editForm, setEditForm] = useState<{
        name: string;
        email: string;
        phone: string;
        role: UserRole;
        status: "active" | "inactive" | "suspended";
        isBlock: boolean;
    }>({
        name: "",
        email: "",
        phone: "",
        role: "user",
        status: "active",
        isBlock: false,
    });

    // Delete confirmation state
    const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

    const [feedback, setFeedback] = useState<string>("");
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (!isInitialized) return;
        if (!currentUser) {
            router.replace("/login");
            return;
        }
        if (!isAdmin) {
            router.replace(dashboardPathForRole(currentUser.role));
        }
    }, [isInitialized, isAdmin, router, currentUser]);

    const usersQuery = useQuery({
        queryKey: ["admin-users"],
        queryFn: () => getAdminUsers(),
        enabled: isInitialized && isAdmin,
    });

    const updateMutation = useMutation({
        mutationFn: ({ userId, payload }: { userId: string; payload: AdminUpdateUserPayload }) =>
            adminUpdateUser(userId, payload),
        onSuccess: () => {
            setFeedback("User updated successfully.");
            setError("");
            setEditingUser(null);
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
        },
        onError: (err: unknown) => {
            setError(
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                    "Failed to update user."
            );
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (userId: string) => adminDeleteUser(userId),
        onSuccess: (data) => {
            setFeedback(data.message || "User deleted successfully.");
            setError("");
            setDeletingUser(null);
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
        },
        onError: (err: unknown) => {
            setError(
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                    "Failed to delete user."
            );
        },
    });

    const openEditModal = (u: AdminUser) => {
        setEditingUser(u);
        setEditForm({
            name: u.name,
            email: u.email,
            phone: u.phone || "",
            role: u.role,
            status: u.status,
            isBlock: !!u.isBlock,
        });
        setFeedback("");
        setError("");
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        updateMutation.mutate({
            userId: editingUser.id,
            payload: {
                name: editForm.name.trim(),
                email: editForm.email.trim(),
                phone: editForm.phone.trim() || undefined,
                role: editForm.role,
                status: editForm.isBlock ? "blocked" : editForm.status,
                isBlock: editForm.isBlock,
            },
        });
    };

    const handleToggleBlock = (u: AdminUser) => {
        const nextBlocked = !u.isBlock;
        updateMutation.mutate({
            userId: u.id,
            payload: {
                isBlock: nextBlocked,
                status: nextBlocked ? "blocked" : "active",
            },
        });
    };

    const filteredUsers = useMemo(() => {
        if (!usersQuery.data) return [];
        return usersQuery.data.filter((u) => {
            if (roleFilter !== "all" && u.role !== roleFilter) return false;
            if (statusFilter !== "all") {
                if (statusFilter === "blocked" && !u.isBlock) return false;
                if (statusFilter !== "blocked" && (u.isBlock || u.status !== statusFilter)) return false;
            }
            if (search.trim()) {
                const term = search.toLowerCase();
                const matchesName = u.name.toLowerCase().includes(term);
                const matchesEmail = u.email.toLowerCase().includes(term);
                const matchesPhone = u.phone?.toLowerCase().includes(term);
                if (!matchesName && !matchesEmail && !matchesPhone) return false;
            }
            return true;
        });
    }, [usersQuery.data, roleFilter, statusFilter, search]);

    const stats = useMemo(() => {
        const list = usersQuery.data || [];
        return {
            total: list.length,
            regular: list.filter((u) => u.role === "user").length,
            tenants: list.filter((u) => u.role === "tenant").length,
            owners: list.filter((u) => u.role === "owner").length,
            admins: list.filter((u) => u.role === "admin").length,
            blocked: list.filter((u) => u.isBlock).length,
        };
    }, [usersQuery.data]);

    if (!isInitialized || !currentUser || !isAdmin) {
        return null;
    }

    return (
        <DashboardShell role="admin">
            <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-semibold text-[#00696b]">Admin workspace</p>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#191c1d]">User Management</h1>
                        <p className="mt-1 text-sm text-[#44474d]">
                            Full CRUD control: inspect, edit details, toggle roles & permissions, block, or delete platform accounts.
                        </p>
                    </div>
                </div>

                {/* Feedback notifications */}
                {feedback && (
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-[#9bd9d6] bg-[#d9f4f3] px-4 py-3 text-sm font-semibold text-[#00696b]">
                        <span>{feedback}</span>
                        <button type="button" onClick={() => setFeedback("")} className="text-xs uppercase hover:underline">
                            Dismiss
                        </button>
                    </div>
                )}
                {error && (
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-[#f0b5ae] bg-[#fff0ee] px-4 py-3 text-sm font-semibold text-[#b42318]">
                        <span>{error}</span>
                        <button type="button" onClick={() => setError("")} className="text-xs uppercase hover:underline">
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Stats Counters */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-4">
                        <p className="text-xs font-semibold uppercase text-[#75777e]">Total Accounts</p>
                        <p className="mt-2 text-2xl font-bold text-[#191c1d]">{stats.total}</p>
                    </div>
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-4">
                        <p className="text-xs font-semibold uppercase text-[#0369a1]">Tenants</p>
                        <p className="mt-2 text-2xl font-bold text-[#0369a1]">{stats.tenants}</p>
                    </div>
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-4">
                        <p className="text-xs font-semibold uppercase text-[#5b21b6]">Owners</p>
                        <p className="mt-2 text-2xl font-bold text-[#5b21b6]">{stats.owners}</p>
                    </div>
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-4">
                        <p className="text-xs font-semibold uppercase text-[#475569]">Regular Users</p>
                        <p className="mt-2 text-2xl font-bold text-[#475569]">{stats.regular}</p>
                    </div>
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-4">
                        <p className="text-xs font-semibold uppercase text-[#00696b]">Admins</p>
                        <p className="mt-2 text-2xl font-bold text-[#00696b]">{stats.admins}</p>
                    </div>
                    <div className="rounded-2xl border border-[#e1e3e4] bg-white p-4">
                        <p className="text-xs font-semibold uppercase text-[#b91c1c]">Blocked</p>
                        <p className="mt-2 text-2xl font-bold text-[#b91c1c]">{stats.blocked}</p>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#e1e3e4] bg-white p-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-11 w-full rounded-xl border border-[#c5c6cd] px-3 text-sm text-[#191c1d] outline-none transition focus:border-[#00696b] focus:ring-2 focus:ring-[#d9f4f3]"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            aria-label="Filter by role"
                            className="h-11 rounded-xl border border-[#c5c6cd] bg-white px-3 text-sm font-semibold text-[#44474d] outline-none focus:border-[#00696b]"
                        >
                            <option value="all">All Roles</option>
                            <option value="user">Regular User</option>
                            <option value="tenant">Tenant</option>
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            aria-label="Filter by status"
                            className="h-11 rounded-xl border border-[#c5c6cd] bg-white px-3 text-sm font-semibold text-[#44474d] outline-none focus:border-[#00696b]"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                            <option value="blocked">Blocked</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <section className="mt-6 overflow-hidden rounded-2xl border border-[#e1e3e4] bg-white shadow-sm">
                    {usersQuery.isLoading ? (
                        <div className="px-5 py-12 text-center text-sm text-[#75777e]">Loading user accounts...</div>
                    ) : usersQuery.isError ? (
                        <div className="px-5 py-8 text-center text-sm text-[#b42318]">
                            Unable to load users. Please check server connection.
                            <button
                                type="button"
                                onClick={() => usersQuery.refetch()}
                                className="ml-2 font-bold underline"
                            >
                                Retry
                            </button>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="px-5 py-12 text-center text-sm text-[#75777e]">
                            No user accounts match your filters.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[960px] border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-[#eef0f1] bg-[#fafafa] text-[11px] font-bold uppercase tracking-[0.1em] text-[#75777e]">
                                        <th className="px-5 py-4">User</th>
                                        <th className="px-4 py-4">Phone</th>
                                        <th className="px-4 py-4">Role</th>
                                        <th className="px-4 py-4">Status</th>
                                        <th className="px-4 py-4">Verification</th>
                                        <th className="px-4 py-4">Joined</th>
                                        <th className="px-5 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((u) => {
                                        const initials = u.name
                                            .split(" ")
                                            .map((p) => p[0])
                                            .join("")
                                            .slice(0, 2)
                                            .toUpperCase();
                                        const isSelf = u.id === currentUser.id;

                                        return (
                                            <tr
                                                key={u.id}
                                                className="border-b border-[#eef0f1] transition hover:bg-[#fafafa] last:border-0"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d9f4f3] text-xs font-bold text-[#00696b]">
                                                            {initials || "U"}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="truncate text-sm font-bold text-[#191c1d]">
                                                                    {u.name}
                                                                </p>
                                                                {isSelf && (
                                                                    <span className="rounded bg-[#f1f5f9] px-1.5 py-0.5 text-[10px] font-semibold text-[#475569]">
                                                                        You
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="truncate text-xs text-[#75777e]">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-[#44474d]">
                                                    {u.phone || <span className="text-[#94a3b8]">—</span>}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <RoleBadge role={u.role} />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <StatusBadge user={u} />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <VerificationStatus user={u} />
                                                </td>
                                                <td className="px-4 py-4 text-xs text-[#75777e]">
                                                    {new Date(u.createdAt).toLocaleDateString("en-IN", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(u)}
                                                            className="rounded-lg border border-[#c5c6cd] px-2.5 py-1 text-xs font-bold text-[#191c1d] transition hover:border-[#00696b] hover:text-[#00696b]"
                                                        >
                                                            Edit
                                                        </button>
                                                        {!isSelf && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    disabled={updateMutation.isPending}
                                                                    onClick={() => handleToggleBlock(u)}
                                                                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition disabled:opacity-50 ${
                                                                        u.isBlock
                                                                            ? "bg-[#dcfce7] text-[#15803d] hover:bg-[#bbf7d0]"
                                                                            : "bg-[#fee2e2] text-[#b91c1c] hover:bg-[#fecaca]"
                                                                    }`}
                                                                >
                                                                    {u.isBlock ? "Unblock" : "Block"}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    disabled={deleteMutation.isPending}
                                                                    onClick={() => setDeletingUser(u)}
                                                                    className="rounded-lg bg-[#fff0ee] px-2.5 py-1 text-xs font-bold text-[#b42318] transition hover:bg-[#fdd8d4] disabled:opacity-50"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Edit User Modal */}
                {editingUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                            <h2 className="text-xl font-bold text-[#191c1d]">Edit User Account</h2>
                            <p className="mt-1 text-xs text-[#75777e]">
                                ID: <span className="font-mono">{editingUser.id}</span>
                            </p>

                            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-[#44474d]">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="mt-1 h-10 w-full rounded-xl border border-[#c5c6cd] px-3 text-sm text-[#191c1d] outline-none focus:border-[#00696b]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-[#44474d]">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="mt-1 h-10 w-full rounded-xl border border-[#c5c6cd] px-3 text-sm text-[#191c1d] outline-none focus:border-[#00696b]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-[#44474d]">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        placeholder="+91 9876543210"
                                        className="mt-1 h-10 w-full rounded-xl border border-[#c5c6cd] px-3 text-sm text-[#191c1d] outline-none focus:border-[#00696b]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-[#44474d]">
                                            System Role
                                        </label>
                                        <select
                                            value={editForm.role}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, role: e.target.value as UserRole })
                                            }
                                            className="mt-1 h-10 w-full rounded-xl border border-[#c5c6cd] bg-white px-3 text-sm font-semibold text-[#191c1d] outline-none focus:border-[#00696b]"
                                        >
                                            <option value="user">Regular User</option>
                                            <option value="tenant">Tenant</option>
                                            <option value="owner">Property Owner</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-[#44474d]">
                                            Account Status
                                        </label>
                                        <select
                                            value={editForm.status}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    status: e.target.value as "active" | "inactive" | "suspended",
                                                })
                                            }
                                            className="mt-1 h-10 w-full rounded-xl border border-[#c5c6cd] bg-white px-3 text-sm font-semibold text-[#191c1d] outline-none focus:border-[#00696b]"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-[#fecaca] bg-[#fff0ee] p-3">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={editForm.isBlock}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, isBlock: e.target.checked })
                                            }
                                            className="h-4 w-4 rounded border-[#f87171] text-[#b42318] focus:ring-[#f87171]"
                                        />
                                        <span className="text-xs font-bold text-[#b42318]">
                                            Block this account from logging into SpotNest
                                        </span>
                                    </label>
                                </div>

                                <div className="flex justify-end gap-3 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditingUser(null)}
                                        className="rounded-xl border border-[#c5c6cd] px-4 py-2 text-sm font-bold text-[#44474d] hover:bg-[#f1f5f9]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateMutation.isPending}
                                        className="rounded-xl bg-[#00696b] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#005153] disabled:opacity-50"
                                    >
                                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deletingUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                            <h2 className="text-xl font-bold text-[#b42318]">Confirm User Deletion</h2>
                            <p className="mt-2 text-sm text-[#44474d]">
                                Are you sure you want to permanently delete the account for{" "}
                                <strong className="text-[#191c1d]">{deletingUser.name}</strong> ({deletingUser.email})?
                            </p>
                            <p className="mt-2 text-xs text-[#75777e]">
                                This action is irreversible. All linked session tokens will be revoked immediately.
                            </p>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDeletingUser(null)}
                                    className="rounded-xl border border-[#c5c6cd] px-4 py-2 text-sm font-bold text-[#44474d] hover:bg-[#f1f5f9]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={deleteMutation.isPending}
                                    onClick={() => deleteMutation.mutate(deletingUser.id)}
                                    className="rounded-xl bg-[#b42318] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#911d13] disabled:opacity-50"
                                >
                                    {deleteMutation.isPending ? "Deleting..." : "Permanently Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </DashboardShell>
    );
}
