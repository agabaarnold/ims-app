import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
    return name
        .trim()
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

export function formatDate(value: Date, locale = "en-UG") {
    return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(value);
}

export function formatCurrency(value: number | string, locale = "en-UG") {
    const numericValue = typeof value === "string" ? Number(value) : value;
    if (!Number.isFinite(numericValue)) {
        throw new Error("formatCurrency received a non-numeric value");
    }

    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "UGX",
        maximumFractionDigits: 0,
    }).format(numericValue);
}
