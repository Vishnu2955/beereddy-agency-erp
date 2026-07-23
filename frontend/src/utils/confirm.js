import Swal from "sweetalert2";

export const confirmDelete = async (
  title = "Delete Item",
  text = "This action cannot be undone."
) => {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#2563eb",
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
  });

  return result.isConfirmed;
};