// src/utils/validators.ts
import { ALLOWED_FILE_EXTENSIONS, ALLOWED_FILE_TYPES, MAX_FILE_SIZE_MB } from './constants';

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8)
    return { valid: false, message: 'Password must be at least 8 characters' };
  if (!/[A-Z]/.test(password))
    return { valid: false, message: 'Must contain at least one uppercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Must contain at least one number' };
  return { valid: true };
};

export const validateResumeFile = (file: File): { valid: boolean; message?: string } => {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_FILE_EXTENSIONS.includes(ext as '.pdf' | '.docx')) {
    return { valid: false, message: 'Only PDF and DOCX files are allowed' };
  }
  if (!ALLOWED_FILE_TYPES.includes(file.type) && file.type !== '') {
    return { valid: false, message: 'Invalid file type' };
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return { valid: false, message: `File must be under ${MAX_FILE_SIZE_MB}MB` };
  }
  const safeName = /^[a-zA-Z0-9_\-. ]+$/.test(file.name);
  if (!safeName) {
    return { valid: false, message: 'Filename contains invalid characters' };
  }
  return { valid: true };
};

export const isRequired = (value: string): boolean => value.trim().length > 0;

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
