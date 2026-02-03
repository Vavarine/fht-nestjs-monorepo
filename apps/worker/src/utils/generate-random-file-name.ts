export const generateRandomFileName = (originalFileName: string): string => {
  const uuid = crypto.randomUUID();
  const fileExtension = originalFileName.split('.').pop();

  return `${uuid}.${fileExtension}`;
}