import { useEffect, useState } from "react";

const IMAGE_URL = "http://localhost:5000/uploads/products/";

export default function ImageUpload({
  formData,
  setFormData,
}) {
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (formData.image && typeof formData.image === "string") {
      setPreview(`${IMAGE_URL}${formData.image}`);
    }
  }, []);

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setFormData({
      ...formData,
      image: file,
    });

    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">

      <h2 className="text-xl font-bold mb-5">
        Product Image
      </h2>

      <div className="flex items-center gap-6">

        <div>

          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-36 h-36 rounded-lg object-cover border"
            />
          ) : (
            <div className="w-36 h-36 rounded-lg border flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}

        </div>

        <div>

          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="block"
          />

          <p className="text-sm text-gray-500 mt-3">
            JPG, PNG or WEBP
          </p>

        </div>

      </div>

    </div>
  );
}