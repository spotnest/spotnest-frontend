/**
 * Shared Razorpay checkout bootstrap.
 *
 * The checkout script is loaded lazily and injected at most once per page,
 * whether several components on the page need it. Both tenant rent payments
 * and owner subscriptions go through here so there is a single loader and a
 * single global typing of window.Razorpay.
 */

export interface RazorpayCheckoutResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayCheckoutResponse) => void;
    theme: { color: string };
    modal: { ondismiss: () => void };
}

declare global {
    interface Window {
        Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
    }
}

const SCRIPT_ID = "data-razorpay";
const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * Load checkout.js, or resolve immediately if it is already present.
 *
 * Resolves false on a network failure so the caller can show a message
 * instead of throwing from inside a promise chain.
 */
export const loadRazorpayScript = async (): Promise<boolean> => {
    if (typeof window === "undefined") {
        return false;
    }

    if (window.Razorpay) {
        return true;
    }

    // Another component got there first — wait for its load event rather than
    // injecting a second copy.
    const existing = document.querySelector<HTMLScriptElement>(
        `script[${SCRIPT_ID}='true']`
    );

    if (existing) {
        return new Promise<boolean>((resolve) => {
            existing.addEventListener("load", () => resolve(true), {
                once: true,
            });
            existing.addEventListener("error", () => resolve(false), {
                once: true,
            });
        });
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.dataset.razorpay = "true";

    return new Promise<boolean>((resolve) => {
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

/**
 * Load the script if needed and open the Razorpay modal.
 *
 * Throws when checkout is unavailable so the caller can surface it; the modal
 * itself resolves through the `handler` / `modal.ondismiss` callbacks.
 */
export const openRazorpayCheckout = async (
    options: RazorpayCheckoutOptions
): Promise<void> => {
    if (
        options.order_id.startsWith("order_mock_") ||
        options.key === "rzp_test_spotnest" ||
        options.key.includes("placeholder")
    ) {
        console.warn(
            "[RAZORPAY_DEV_CHECKOUT] Mock order or test placeholder key detected. Simulating successful checkout without calling Razorpay servers."
        );
        setTimeout(() => {
            options.handler({
                razorpay_order_id: options.order_id,
                razorpay_payment_id: `pay_mock_${Date.now()}`,
                razorpay_signature: `sig_mock_${Date.now()}`,
            });
        }, 500);
        return;
    }

    const loaded = await loadRazorpayScript();

    if (!loaded || !window.Razorpay) {
        throw new Error("Razorpay checkout is unavailable right now.");
    }

    new window.Razorpay(options).open();
};
