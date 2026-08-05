import * as z from 'zod'

const employeeNameSchema = z.string()
  .trim()
  .min(1, '請輸入姓名')

const phoneNumberSchema = z.string()
  .trim()
  .max(30, '電話號碼不可超過 30 個字元')
  .refine(
    value => value === '' || /^[0-9+().#\-\s]+$/.test(value),
    '電話號碼只能包含數字、空白及 + - ( ) #'
  )
  .refine(
    value => value === '' || value.replace(/\D/g, '').length >= 6,
    '電話號碼至少需要 6 位數字'
  )

export const personalUserUpdateSchema = z.object({
  EmployeeName: employeeNameSchema,
  PhoneNumber: phoneNumberSchema
})

const emailSchema = z.string()
  .trim()
  .min(1, '請輸入 Email')
  .email('請輸入有效的電子信箱')

const passwordSchema = z.string()
  .min(8, '密碼至少需要 8 個字元')
  .max(20, '密碼不可超過 20 個字元')
  .regex(/[a-z]/, '密碼需包含小寫字母')
  .regex(/[A-Z]/, '密碼需包含大寫字母')
  .regex(/\d/, '密碼需包含數字')

const userNameSchema = z.string()
  .trim()
  .min(4, '帳號名稱至少需要 4 個字元')
  .max(50, '帳號名稱不可超過 50 個字元')

export const adminUserEditSchema = z.object({
  EmployeeName: employeeNameSchema,
  Email: emailSchema,
  PhoneNumber: phoneNumberSchema,
  IsActive: z.boolean(),
  Roles: z.array(z.string())
})

export const adminUserCreateSchema = adminUserEditSchema
  .extend({
    UserName: userNameSchema,
    Password: passwordSchema,
    PasswordConfirm: z.string().min(1, '請再次輸入密碼')
  })
  .refine(
    data => data.Password === data.PasswordConfirm,
    {
      path: ['PasswordConfirm'],
      message: '兩次輸入的密碼不一致'
    }
  )

export type PersonalUserUpdateForm = z.output<typeof personalUserUpdateSchema>
export type AdminUserForm = z.output<typeof adminUserCreateSchema>
