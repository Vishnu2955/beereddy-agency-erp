import toast from "react-hot-toast";

export const successToast = (message) => {
  toast.success(message, {
    duration: 3000,
  });
};

export const errorToast = (message) => {
  toast.error(message, {
    duration: 4000,
  });
};

export const loadingToast = (message) => {
  return toast.loading(message);
};

export const dismissToast = (id) => {
  toast.dismiss(id);
};