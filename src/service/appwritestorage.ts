import { ID } from "appwrite";
import { storage } from "../../lib/appwrite";

const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;

export interface UploadResult {
  fileId: string;
  url: string;
}

export const uploadFile = async (
  file: File,
  onProgress?: (progress: number) => void,
): Promise<UploadResult> => {
  const fileId = ID.unique();

  const result = await storage.createFile({
    bucketId: BUCKET_ID,
    fileId,
    file,
    onProgress: onProgress ? (p) => onProgress(p.progress) : undefined,
  });

  const url = storage.getFileView({
    bucketId: BUCKET_ID,
    fileId: result.$id,
  });

  return {
    fileId: result.$id,
    url,
  };
  
};
