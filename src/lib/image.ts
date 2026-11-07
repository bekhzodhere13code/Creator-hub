/** Rasmni brauzerda kichraytirib JPEG data-URL qiladi (serverga yengil yuboriladi). */
export async function fileToDataUrl(file: File, max = 900): Promise<string> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * k);
  canvas.height = Math.round(bmp.height * k);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

/** FormData'dagi fayl bo‘lsa data-URL, bo‘lmasa null. */
export async function readImage(v: FormDataEntryValue | null, max = 900): Promise<string | null> {
  if (!(v instanceof File) || v.size === 0) return null;
  if (!/^image\/(jpeg|png|webp)$/.test(v.type)) throw new Error("Faqat JPG, PNG yoki WEBP rasm");
  return fileToDataUrl(v, max);
}
