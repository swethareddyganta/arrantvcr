export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Basic phone number validation - can be enhanced based on requirements
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phoneNumber.replace(/\s/g, ''))
}

export function validateRequired(value: string | undefined): boolean {
  return value !== undefined && value.trim().length > 0
} 