/**
 * Input validation and sanitization utilities.
 * Prevents XSS, injection attacks, and ensures data integrity.
 */

// ——— Sanitization ———————————————————————————————————

/**
 * Strip HTML tags from a string to prevent XSS.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize a string for safe display.
 * Truncates to max length and strips HTML.
 */
export function sanitizeText(input: string, maxLength = 500): string {
  const stripped = stripHtml(input);
  return stripped.length > maxLength ? stripped.slice(0, maxLength) + "..." : stripped;
}

// ——— Validators ———————————————————————————————————

/**
 * Validate Indian phone number (10 digits, optionally with +91 or 91 prefix).
 */
export function isValidIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "").replace(/^(\+?91)/, "");
  return /^\d{10}$/.test(cleaned);
}

/**
 * Normalize phone number to consistent format (just digits, country code if needed).
 */
export function normalizePhone(phone: string): string {
  const digitsOnly = phone.replace(/[^\d+]/g, "");
  // Remove +91 or 91 prefix if present and add standard format
  const cleaned = digitsOnly.replace(/^(\+?91)/, "");
  if (cleaned.length === 10) return cleaned;
  return digitsOnly;
}

/**
 * Validate email format.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate date string is in YYYY-MM-DD format and is a real date.
 */
export function isValidDate(dateStr: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate time slot format (e.g. "08:00 AM", "02:30 PM").
 */
export function isValidTimeSlot(time: string): boolean {
  const timeRegex = /^(0[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
  return timeRegex.test(time);
}

/**
 * Validate password meets minimum requirements.
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  // At least 1 number and 1 special character
  return /(?=.*\d)(?=.*[@$!%*#?&])/.test(password);
}

/**
 * Validate URL format (basic check).
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate a review comment.
 */
export function validateReview(comment: string, maxLength = 2000): { valid: boolean; error?: string } {
  if (!comment || comment.trim().length === 0) {
    return { valid: false, error: "Review comment cannot be empty." };
  }
  if (comment.length > maxLength) {
    return { valid: false, error: `Review is too long. Maximum ${maxLength} characters.` };
  }
  return { valid: true };
}

/**
 * Validate booking form data.
 */
export function validateBookingForm(data: {
  date?: string;
  timeSlot?: string;
  userName?: string;
  userPhone?: string;
  address?: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.date || !isValidDate(data.date)) {
    errors.date = "Please select a valid date.";
  }
  if (!data.timeSlot || !isValidTimeSlot(data.timeSlot)) {
    errors.timeSlot = "Please select a valid time slot.";
  }
  if (!data.userName || data.userName.trim().length < 2) {
    errors.userName = "Please enter your full name.";
  }
  if (!data.userPhone || !isValidIndianPhone(data.userPhone)) {
    errors.userPhone = "Please enter a valid 10-digit phone number.";
  }
  if (!data.address || data.address.trim().length < 5) {
    errors.address = "Please enter your complete address.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate registration form data.
 */
export function validateRegistrationForm(data: {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
  category?: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = "Please enter your full name.";
  }
  if (!data.phone || !isValidIndianPhone(data.phone)) {
    errors.phone = "Please enter a valid 10-digit phone number.";
  }
  if (!data.email || !isValidEmail(data.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!data.password || !isValidPassword(data.password)) {
    errors.password = "Password must be at least 8 characters with 1 number and 1 special character.";
  }
  if (!data.category) {
    errors.category = "Please select a service category.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
