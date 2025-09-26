import toast from 'react-hot-toast';


interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export const walletToasts = {
  // Success notifications
  withdrawalSubmitted: (amount: number, currency: string = 'USD', options?: ToastOptions) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
    
    return toast.success(
      `✅ Withdrawal request submitted for ${formattedAmount}`,
      {
        duration: 5000,
        ...options
      }
    );
  },

  withdrawalApproved: (amount: number, currency: string = 'USD', options?: ToastOptions) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
    
    return toast.success(
      `💰 Withdrawal of ${formattedAmount} has been approved and processed`,
      {
        duration: 6000,
        ...options
      }
    );
  },

  walletRefreshed: (options?: ToastOptions) => {
    return toast.success('✅ Wallet data refreshed', {
      duration: 2000,
      ...options
    });
  },

  // Error notifications
  withdrawalFailed: (message?: string, options?: ToastOptions) => {
    return toast.error(
      `❌ ${message || 'Failed to submit withdrawal request. Please try again.'}`,
      {
        duration: 5000,
        ...options
      }
    );
  },

  insufficientBalance: (required: number, available: number, currency: string = 'USD', options?: ToastOptions) => {
    const formattedRequired = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(required);
    const formattedAvailable = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(available);
    
    return toast.error(
      `❌ Insufficient balance. Required: ${formattedRequired}, Available: ${formattedAvailable}`,
      {
        duration: 6000,
        ...options
      }
    );
  },

  walletLoadError: (options?: ToastOptions) => {
    return toast.error('❌ Failed to load wallet data. Please refresh the page.', {
      duration: 5000,
      ...options
    });
  },

  // Warning notifications
  minimumWithdrawal: (minimum: number, currency: string = 'USD', options?: ToastOptions) => {
    const formattedMinimum = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(minimum);
    
    return toast.error(
      `⚠️ Minimum withdrawal amount is ${formattedMinimum}`,
      {
        duration: 4000,
        ...options
      }
    );
  },

  // Info notifications
  withdrawalPending: (processingTime?: string, options?: ToastOptions) => {
    const message = processingTime 
      ? `ℹ️ Your withdrawal is being processed. Expected processing time: ${processingTime}`
      : 'ℹ️ Your withdrawal is being processed and will be reviewed shortly';
      
    return toast(message, {
      duration: 5000,
      ...options
    });
  }
};
