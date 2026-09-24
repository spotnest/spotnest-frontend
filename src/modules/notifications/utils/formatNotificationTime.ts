export function formatNotificationTime(createdAt: string): string {
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return "";

    const elapsedSeconds = Math.floor((Date.now() - date.getTime()) / 1_000);
    const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    if (elapsedSeconds < 60) return relative.format(-elapsedSeconds, "second");
    if (elapsedSeconds < 3_600) return relative.format(-Math.floor(elapsedSeconds / 60), "minute");
    if (elapsedSeconds < 86_400) return relative.format(-Math.floor(elapsedSeconds / 3_600), "hour");
    if (elapsedSeconds < 604_800) return relative.format(-Math.floor(elapsedSeconds / 86_400), "day");

    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}
