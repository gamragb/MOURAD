import { AppData } from "./storage";

const BACKUP_FILE_NAME = "boutabssil_backup.json";
const MULTIPART_BOUNDARY = "-------314159265358979323846";

// Find if backup exists
export async function findBackupFileId(accessToken: string): Promise<string | null> {
  const query = encodeURIComponent(`name='${BACKUP_FILE_NAME}' and trashed=false`);
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&spaces=drive`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!response.ok) throw new Error("Failed to query drive files");
    const data = await response.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id; // Return the first matching file
    }
    return null;
  } catch (error) {
    console.error("Drive Sync Error:", error);
    throw error;
  }
}

// Upload/Update backup in Drive
export async function saveBackupToCloud(accessToken: string, data: AppData): Promise<void> {
  const fileId = await findBackupFileId(accessToken);
  
  const url = fileId 
    ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;
  const method = fileId ? 'PATCH' : 'POST';

  const metadata = {
    name: BACKUP_FILE_NAME,
    mimeType: "application/json"
  };

  const delimiter = "\r\n--" + MULTIPART_BOUNDARY + "\r\n";
  const close_delim = "\r\n--" + MULTIPART_BOUNDARY + "--";

  // Sanitize data before upload
  const sanitizedData = { ...data };
  if (sanitizedData.user) {
    sanitizedData.user = { authenticated: sanitizedData.user.authenticated }; // Remove password
  }

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(sanitizedData) +
    close_delim;

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${MULTIPART_BOUNDARY}`
    },
    body: multipartRequestBody
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to upload to Google Drive: ${errText}`);
  }
}

// Download backup from Drive
export async function loadBackupFromCloud(accessToken: string): Promise<AppData | null> {
  const fileId = await findBackupFileId(accessToken);
  if (!fileId) return null;

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error('Failed to download backup from Google Drive');
  }

  const data = await response.json();
  return data as AppData;
}
