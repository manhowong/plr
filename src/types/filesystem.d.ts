declare global {
  interface Window {
    showDirectoryPicker(options?: {
      mode?: 'read' | 'readwrite';
      startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
    }): Promise<FileSystemDirectoryHandle>;
  }

  interface FileSystemHandle {
    queryPermission?(descriptor?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
    requestPermission?(descriptor?: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
    remove?(options?: { recursive?: boolean }): Promise<void>;
  }
}

export {};
