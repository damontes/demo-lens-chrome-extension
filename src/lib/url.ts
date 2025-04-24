export const normalizeUrl = (requestUrl: string) => {
  try {
    return new URL(requestUrl, location.origin).toString();
  } catch (e) {
    console.warn('Could not normalize URL:', requestUrl);
    return '';
  }
};
