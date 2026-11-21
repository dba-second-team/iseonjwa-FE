export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const PHONE_PATTERN = /^01[016789]\d{7,8}$/

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 20

export function countPasswordCharTypes(password: string): number {
  return [/[A-Z]/, /[a-z]/, /\d/, /[^A-Za-z\d]/].filter(pattern => pattern.test(password)).length
}

export function getPasswordChecks(password: string) {
  return {
    length: password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH,
    charTypes: countPasswordCharTypes(password) >= 3,
  }
}