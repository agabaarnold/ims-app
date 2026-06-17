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
        dateStyle: "long",
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
    }).format(numericValue);
}

export function buildSku(categoryCode: string, nextSequence?: number) {
    const date = new Date();
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const seq = String(
        nextSequence ?? Math.floor(Math.random() * 9000) + 1000
    ).padStart(4, "0");

    return `PRD-${categoryCode}-${year}${month}-${seq}`;
}
