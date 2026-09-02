import { toast } from 'sonner';
import { ApiError } from '@/src/lib/api/client';
import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';

/**
 * Maps HTTP status codes, ApiError objects, and standard JavaScript errors
 * to clear, user-friendly messages.
 */
export function getErrorMessage(error: unknown, fallbackMessage = 'An unexpected error occurred'): string {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return 'Network connection error. Please check your internet connection and try again.';
    }

    // Always show a clean message for session/auth expiry — never leak raw server descriptions
    if (
      error.code === 'session_expired' ||
      error.code === 'no_refresh_token' ||
      error.type === 'Unauthorized' ||
      error.status === 401
    ) {
      return 'Your session has expired. Please log in again to continue.';
    }

    if (error.description) {
      return error.description;
    }

    switch (error.status) {
      case 400:
        return 'Invalid request details provided. Please check your input.';
      case 402:
        return 'Subscription required. Please upgrade your business plan to access this feature.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'The requested resource could not be found.';
      case 409:
        return 'An account or record with these details already exists.';
      case 422:
        return 'Validation failed. Please verify your submitted information.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Server error. Our team has been notified. Please try again shortly.';
      default:
        return fallbackMessage;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return fallbackMessage;
}

interface HandleApiErrorOptions<TFieldValues extends FieldValues = FieldValues> {
  setError?: UseFormSetError<TFieldValues>;
  fallback?: string;
}

/**
 * Handles API errors by displaying a sonner toast notification
 * and optionally setting field errors on react-hook-form.
 */
export function handleApiError<TFieldValues extends FieldValues = FieldValues>(
  error: unknown,
  options?: HandleApiErrorOptions<TFieldValues>,
): string {
  const message = getErrorMessage(error, options?.fallback);

  // Show error toast notification
  toast.error(message);

  // Map server validation errors to react-hook-form if setError is provided
  if (options?.setError && error instanceof ApiError && error.validationErrors) {
    const valErrors = error.validationErrors;
    for (const [key, messages] of Object.entries(valErrors)) {
      if (Array.isArray(messages) && messages.length > 0) {
        // Convert PascalCase (e.g. Email, FirstName) to camelCase (e.g. email, firstName)
        const fieldName = (key.charAt(0).toLowerCase() + key.slice(1)) as Path<TFieldValues>;
        options.setError(fieldName, {
          type: 'server',
          message: messages[0],
        });
      }
    }
  }

  return message;
}

/**
 * Displays a success toast message.
 */
export function handleApiSuccess(message: string): void {
  toast.success(message);
}
