/**
 * Phone number format utilities
 * Handles conversion between different phone number formats
 */

/**
 * Converts a phone number to E.164 format
 * @param phoneNumber - Phone number in any format
 * @returns Phone number in E.164 format or null if invalid
 */
export function toE164(phoneNumber: string | null | undefined): string | null {
    if (!phoneNumber) return null;
    
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // If already in E.164 format, return as-is
    if (phoneNumber.startsWith('+')) {
        return phoneNumber;
    }
    
    // Handle US numbers (10 digits)
    if (digits.length === 10) {
        return `+1${digits}`;
    }
    
    // Handle international numbers (assuming country code is included)
    if (digits.length > 10) {
        return `+${digits}`;
    }
    
    return null; // Invalid format
}

/**
 * Formats a phone number for display
 * @param phoneNumber - Phone number in E.164 format
 * @returns Formatted phone number or original if invalid
 */
export function formatForDisplay(phoneNumber: string | null | undefined): string {
    if (!phoneNumber) return '';
    
    // If not in E.164 format, return as-is
    if (!phoneNumber.startsWith('+')) {
        return phoneNumber;
    }
    
    return phoneNumber; // PhoneInput component will handle formatting
}

/**
 * Validates if a phone number is in E.164 format
 * @param phoneNumber - Phone number to validate
 * @returns True if valid E.164 format
 */
export function isValidE164(phoneNumber: string | null | undefined): boolean {
    if (!phoneNumber) return false;
    
    // E.164 format: + followed by 7-15 digits
    const e164Regex = /^\+[1-9]\d{6,14}$/;
    return e164Regex.test(phoneNumber);
}
