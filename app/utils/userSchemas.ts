import * as z from 'zod'

const employeeNameSchema = z.string()
  .trim()
  .min(1, '請輸入員工姓名')

const emailSchema = z.string()
  .trim()
  .min(1, '請輸入 Email')
  .email('請輸入有效的 Email')

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
  Email: emailSchema,
  PhoneNumber: phoneNumberSchema
})

export const adminUserUpdateSchema = personalUserUpdateSchema.extend({
  IsActive: z.boolean(),
  RoleIds: z.array(z.string().trim().min(1, '角色 ID 不可為空'))
    .refine(
      roles => new Set(roles.map(role => role.trim())).size === roles.length,
      '角色不可重複'
    )
})

export type PersonalUserUpdateForm = z.output<typeof personalUserUpdateSchema>
export type AdminUserUpdateForm = z.output<typeof adminUserUpdateSchema>
