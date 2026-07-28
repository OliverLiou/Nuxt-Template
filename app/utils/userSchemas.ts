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

export type PersonalUserUpdateForm = z.output<typeof personalUserUpdateSchema>
