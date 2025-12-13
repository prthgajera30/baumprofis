import { useSnackbar } from 'notistack'
import type { OptionsObject, SnackbarKey } from 'notistack'

// Custom hook for toast notifications
export const useToast = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const toast = {
    success: (message: string, options?: OptionsObject) =>
      enqueueSnackbar(message, {
        variant: 'success',
        autoHideDuration: 4000,
        ...options,
      }),

    error: (message: string, options?: OptionsObject) =>
      enqueueSnackbar(message, {
        variant: 'error',
        autoHideDuration: 6000,
        ...options,
      }),

    warning: (message: string, options?: OptionsObject) =>
      enqueueSnackbar(message, {
        variant: 'warning',
        autoHideDuration: 5000,
        ...options,
      }),

    info: (message: string, options?: OptionsObject) =>
      enqueueSnackbar(message, {
        variant: 'info',
        autoHideDuration: 4000,
        ...options,
      }),

    // Custom invoice-specific toasts
    invoiceSaved: (invoiceNumber: string, options?: OptionsObject) =>
      enqueueSnackbar(`Rechnung ${invoiceNumber} wurde gespeichert`, {
        variant: 'success',
        autoHideDuration: 5000,
        ...options,
      }),

    invoiceFinalized: (invoiceNumber: string, options?: OptionsObject) =>
      enqueueSnackbar(`Rechnung ${invoiceNumber} wurde finalisiert`, {
        variant: 'success',
        autoHideDuration: 4000,
        ...options,
      }),

    pdfGenerated: (invoiceNumber: string, options?: OptionsObject) =>
      enqueueSnackbar(`PDF für Rechnung ${invoiceNumber} wurde erstellt`, {
        variant: 'success',
        autoHideDuration: 4000,
        ...options,
      }),

    customerSaved: (customerName: string, options?: OptionsObject) =>
      enqueueSnackbar(`Kunde ${customerName} wurde gespeichert`, {
        variant: 'success',
        autoHideDuration: 4000,
        ...options,
      }),

    loginSuccess: (email: string, options?: OptionsObject) =>
      enqueueSnackbar(`Willkommen, ${email}!`, {
        variant: 'success',
        autoHideDuration: 3000,
        ...options,
      }),

    loginError: (options?: OptionsObject) =>
      enqueueSnackbar('Login fehlgeschlagen. Bitte überprüfen Sie Ihre Daten.', {
        variant: 'error',
        autoHideDuration: 5000,
        ...options,
      }),

    validationError: (message: string, options?: OptionsObject) =>
      enqueueSnackbar(message, {
        variant: 'warning',
        autoHideDuration: 8000, // Longer for validation messages
        ...options,
      }),

    // Close functions
    close: (key?: SnackbarKey) => closeSnackbar(key),

    closeAll: () => closeSnackbar(),
  }

  return toast
}
