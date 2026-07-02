export const formatGST = (gst: string): string => {
  const cleaned = gst.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (cleaned.length !== 15) return gst.toUpperCase();

  return `${cleaned.slice(0, 2)}${cleaned.slice(2, 7)}${cleaned.slice(7, 11)}${cleaned.slice(11, 12)}${cleaned.slice(12, 13)}${cleaned.slice(13, 14)}${cleaned.slice(14)}`;
};

export const validateGST = (gst: string): boolean => {
  const pattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return pattern.test(gst.replace(/[^a-zA-Z0-9]/g, "").toUpperCase());
};
