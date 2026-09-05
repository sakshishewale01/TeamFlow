import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines conditional class names with Tailwind CSS class collision resolution.
 * @param {...any} inputs - Class names, conditions, arrays or objects
 * @returns {string} - Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
