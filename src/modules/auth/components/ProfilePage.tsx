"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { updateProfile } from "../services/authServices";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { userUpdated } from "@/src/store/slices/authSlice";

const inputClass = "mt-2 h-11 w-full rounded-lg border border-[#c5c6cd] bg-white px-3 text-sm text-[#191c1d] outline-none transition focus:border-[#00696b] focus:ring-2 focus:ring-[#d9f4f3]";

export default function ProfilePage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
    const [draft, setDraft] = useState({ userId: "", name: "", phone: "" });
    const profile = draft.userId === user?.id
        ? draft
        : { userId: user?.id ?? "", name: user?.name ?? "", phone: user?.phone ?? "" };
    const [feedback, setFeedback] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isInitialized) return;
        if (!isAuthenticated || !user) {
            router.replace("/login");
            return;
        }
    }, [isAuthenticated, isInitialized, router, user]);

    const updateMutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: (updatedUser) => {
            if (user) dispatch(userUpdated({ ...user, ...updatedUser }));
            setFeedback("Profile updated successfully.");
            setError("");
        },
        onError: (requestError: unknown) => {
            setFeedback("");
            setError(
                isAxiosError(requestError) && typeof requestError.response?.data?.message === "string"
                    ? requestError.response.data.message
                    : "Unable to update your profile. Please try again."
            );
        },
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFeedback("");
        setError("");
        if (profile.name.trim().length < 2) {
            setError("Name must be at least 2 characters.");
            return;
        }
        updateMutation.mutate({ name: profile.name.trim(), phone: profile.phone.trim() });
    };

    if (!isInitialized || !isAuthenticated || !user) return null;

    return (
        <main className="bg-[#f8f9fa] px-4 py-10 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-3xl">
                <p className="text-sm font-semibold text-[#00696b]">Your account</p>
                <h1 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-[#191c1d]">Profile</h1>
                <p className="mt-2 text-sm text-[#75777e]">Manage the details associated with your SpotNest account.</p>

                <form onSubmit={submit} className="mt-7 space-y-5 rounded-xl border border-[#e1e3e4] bg-white p-5 sm:p-7">
                    {error && <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm text-[#ba1a1a]" role="alert">{error}</p>}
                    {feedback && <p className="rounded-lg bg-[#d9f4f3] px-4 py-3 text-sm text-[#00696b]" role="status">{feedback}</p>}

                    <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#75777e]">
                        Name
                        <input value={profile.name} onChange={(event) => setDraft({ ...profile, name: event.target.value })} autoComplete="name" className={inputClass} required minLength={2} />
                    </label>
                    <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#75777e]">
                        Email
                        <input value={user.email} className={`${inputClass} bg-[#f3f4f5]`} readOnly />
                    </label>
                    <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#75777e]">
                        Phone
                        <input value={profile.phone} onChange={(event) => setDraft({ ...profile, phone: event.target.value })} autoComplete="tel" className={inputClass} />
                    </label>

                    <div className="flex justify-end border-t border-[#eef0f1] pt-5">
                        <button type="submit" disabled={updateMutation.isPending} className="rounded-lg bg-[#00696b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004f51] disabled:cursor-not-allowed disabled:opacity-60">
                            {updateMutation.isPending ? "Saving..." : "Save profile"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
