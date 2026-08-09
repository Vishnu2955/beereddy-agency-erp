/**
 * Compresses and resizes an uploaded image File object to a lightweight Base64 Data URL string.
 * @param {File} file - Uploaded image File object from <input type="file">
 * @param {number} maxDimension - Max width or height (default 800px)
 * @param {number} quality - Image quality between 0.1 and 1.0 (default 0.85)
 * @returns {Promise<string>} Base64 Data URL string
 */
export const compressImageFile = (file, maxDimension = 800, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File)) {
      return reject(new Error("Invalid file provided."));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-quality compressed JPEG/PNG data URL
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(new Error("Failed to load image for compression."));
      img.src = event.target.result;
    };
    reader.onerror = (err) => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
};
