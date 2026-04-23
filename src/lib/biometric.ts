export const biometric = {
  isSupported: async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) return false;
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  },

  register: async (userId: string, userName: string): Promise<boolean> => {
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const userIdBuffer = new TextEncoder().encode(userId);

      const options: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: { name: "Connectia", id: window.location.hostname },
        user: {
          id: userIdBuffer,
          name: userName,
          displayName: userName,
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
      };

      const credential = await navigator.credentials.create({ publicKey: options }) as PublicKeyCredential;
      
      if (credential) {
        localStorage.setItem(`connectia_biometric_id_${userId}`, btoa(String.fromCharCode(...new Uint8Array(credential.rawId))));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Biometric registration failed:', err);
      return false;
    }
  },

  authenticate: async (userId: string): Promise<boolean> => {
    try {
      const storedId = localStorage.getItem(`connectia_biometric_id_${userId}`);
      if (!storedId) return false;

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credentialId = new Uint8Array(atob(storedId).split("").map(c => c.charCodeAt(0)));

      const options: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [{
          id: credentialId,
          type: 'public-key',
          transports: ['internal'],
        }],
        userVerification: "required",
        timeout: 60000,
      };

      const assertion = await navigator.credentials.get({ publicKey: options });
      return !!assertion;
    } catch (err) {
      console.error('Biometric authentication failed:', err);
      return false;
    }
  },

  isEnrolled: (userId: string): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(`connectia_biometric_id_${userId}`);
  },

  disable: (userId: string): void => {
    localStorage.removeItem(`connectia_biometric_id_${userId}`);
  }
};
