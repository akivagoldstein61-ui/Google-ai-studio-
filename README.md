<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/bd65b2e7-1010-405f-8e3a-13786c313892

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Firebase Auth – Production / Vercel Setup

For Google Sign-In to work on deployed environments (Vercel, custom domains, etc.) you must authorize those domains in the Firebase Console:

1. Open [Firebase Console](https://console.firebase.google.com/) → select your project.
2. Go to **Authentication → Settings → Authorized domains**.
3. Add your Vercel deployment domains, for example:
   - `<your-project>.vercel.app`
   - Any custom domain you are using
4. Make sure **Google** is enabled under **Authentication → Sign-in method**.

Without this step, `signInWithPopup` will fail with `auth/unauthorized-domain` and the sign-in popup will close immediately.
