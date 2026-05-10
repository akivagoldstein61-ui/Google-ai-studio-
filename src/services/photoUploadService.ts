/**
 * Photo upload service backed by Firebase Storage.
 *
 * Path scheme:  users/{uid}/photos/{timestamp}_{random}.{ext}
 * Storage rules must allow the owner to write and authenticated users to read.
 *
 * The client validates:
 *  - mime type (jpeg/png/webp only)
 *  - file size ≤ 8 MB
 *  - max 6 photos per user (enforced at upload boundary, not at storage)
 *
 * Uploads return both the public download URL and the storage path so the
 * profile can store a stable reference for later moderation/deletion.
 */

import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
} from "firebase/storage";
import { auth } from "@/firebase";
import { initializeApp, getApps } from "firebase/app";
import rawConfig from "../../firebase-applet-config.json";
import { isPrototypeDemoMode } from "@/lib/prototypeMode";

const ACCEPTED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

const { firestoreDatabaseId, ...config } = rawConfig as any;
if (!getApps().length) initializeApp(config);

const storage = getStorage();

export interface UploadResult {
  url: string;
  path: string;
  size: number;
  contentType: string;
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percent: number;
}

function extFor(file: File): string {
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "bin";
}

function validate(file: File) {
  if (!ACCEPTED_MIME.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}. Use JPEG, PNG, or WebP.`);
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 8 MB.`);
  }
}

export const photoUploadService = {
  /**
   * Upload a single photo. Returns the public URL and storage path.
   * Use `onProgress` to update a progress UI.
   */
  async uploadPhoto(
    file: File,
    onProgress?: (p: UploadProgress) => void,
  ): Promise<UploadResult> {
    validate(file);

    // Demo mode: short-circuit to a data URL so reviewers can still see the upload
    if (isPrototypeDemoMode()) {
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      if (onProgress) onProgress({ bytesTransferred: file.size, totalBytes: file.size, percent: 100 });
      return { url, path: "demo://" + file.name, size: file.size, contentType: file.type };
    }

    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Must be signed in to upload photos");

    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${extFor(file)}`;
    const path = `users/${uid}/photos/${filename}`;
    const ref = storageRef(storage, path);

    const task: UploadTask = uploadBytesResumable(ref, file, {
      contentType: file.type,
      customMetadata: { uploadedBy: uid },
    });

    if (onProgress) {
      task.on("state_changed", (snap) => {
        onProgress({
          bytesTransferred: snap.bytesTransferred,
          totalBytes: snap.totalBytes,
          percent: snap.totalBytes ? (snap.bytesTransferred / snap.totalBytes) * 100 : 0,
        });
      });
    }

    await task;
    const url = await getDownloadURL(ref);
    return { url, path, size: file.size, contentType: file.type };
  },

  /**
   * Delete a previously uploaded photo by storage path.
   */
  async deletePhoto(path: string): Promise<void> {
    if (isPrototypeDemoMode() || path.startsWith("demo://")) return;
    await deleteObject(storageRef(storage, path));
  },

  /**
   * Validate that a given URL belongs to this user's namespace
   * (used by moderation tooling before showing a delete UI).
   */
  isOwnedBy(path: string, uid: string): boolean {
    return path.startsWith(`users/${uid}/`);
  },
};
