import emailjs from '@emailjs/browser';

/**
 * Generates a cryptographically random 6-digit OTP string.
 */
export const generateConfirmationCode = () => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return String(100000 + (array[0] % 900000));
};

/**
 * Sends a confirmation code email to the given address via EmailJS.
 * Expects the EmailJS template to contain:
 *   {{to_email}}, {{user_name}}, {{confirmation_code}}
 */
export const sendConfirmationEmail = async (toEmail, userName, code) => {
    return emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
            to_email: toEmail,
            user_name: userName,
            confirmation_code: code,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );
};
