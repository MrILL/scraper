export function urlRemoveReserverdChars(filePath: string): string {
  return filePath.replace(/[/\\?%*:|"<>]/g, '')
}
