import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleError = (error:unknown) : {errorMessage: string} => {
    if (error instanceof Error) {
        return {errorMessage: error.message}
    }
    return {errorMessage: "An unknown error occurred."}
}
