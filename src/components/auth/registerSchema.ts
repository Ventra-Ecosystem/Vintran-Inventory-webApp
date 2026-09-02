import { z } from 'zod';

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(24, 'First name must be 24 characters or fewer')
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'First name must contain letters only'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(24, 'Last name must be 24 characters or fewer')
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Last name must contain letters only'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    phoneNumber: z
      .string()
      .optional()
      .refine((val) => !val || /^[0-9]{11,}$/.test(val), {
        message: 'Phone number must be at least 11 digits',
      }),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    referralCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
