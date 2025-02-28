interface WorldpayCheckoutInstance {
  generateSessionState: (callback: (error: any, session: string) => void) => void;
  clearForm: (callback: () => void) => void;
  remove: () => void;
}

interface WorldpayCheckoutInitOptions {
  id: string;
  form: string;
  fields: {
    pan: {
      selector: string;
    };
    expiry: {
      selector: string;
    };
    cvv: {
      selector: string;
    };
  };
  styles: {
    [key: string]: {
      [key: string]: string;
    };
  };
  enablePanFormatting: boolean;
}

interface WorldpayCheckout {
  init: (
    options: WorldpayCheckoutInitOptions,
    callback: (error: any, checkout: WorldpayCheckoutInstance) => void
  ) => void;
}

interface Worldpay {
  checkout: WorldpayCheckout;
}

interface Window {
  Worldpay: Worldpay;
} 