import { toast } from "react-toastify";

export function createToast({
  type = "info",
  msg,
  position = "top-center",
  autoClose = 3000,
  hideProgressBar = false,
  onOpen = null,
  onClose = null
}) {
  return toast[type](msg, {
    position,
    autoClose,
    hideProgressBar,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    onOpen,
    onClose
  });
}

export function toastUpdate({
  id,
  render,
  position = "top-right",
  type = "success",
  transition,
  autoClose = 3000,
  hideProgressBar = false,
  onOpen = null,
  onClose = null
}) {
  return toast.update(id, {
    render,
    position,
    type,
    transition,
    autoClose,
    hideProgressBar,
    onOpen,
    onClose
  });
}

export default {
  createToast,
  toastUpdate
};
