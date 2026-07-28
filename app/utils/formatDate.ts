const localDateTimeFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
})

export function formatDate(
  value: string | Date | null | undefined
): string {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  const date = value instanceof Date
    ? new Date(value.getTime())
    : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const parts = Object.fromEntries(
    localDateTimeFormatter
      .formatToParts(date)
      .map(part => [part.type, part.value])
  )

  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`
}
