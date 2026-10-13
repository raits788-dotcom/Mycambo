import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB: number;      // Taille cible (ex: 0.5 = 500 KB)
  maxWidthOrHeight: number; // Dimension max (ex: 1600 px)
  useWebWorker: boolean;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 0.5,           // 500 KB
  maxWidthOrHeight: 1920,   // HD (1920px)
  useWebWorker: true,       // Compression en arrière-plan
};

export async function compressImage(
  file: File,
  options: Partial<CompressionOptions> = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Si l'image est déjà < 500 KB, on la garde telle quelle
  if (file.size <= opts.maxSizeMB * 1024 * 1024) {
    return file;
  }

  // Si c'est un PDF, on ne compresse pas
  if (file.type === 'application/pdf') {
    return file;
  }

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: opts.maxSizeMB,
      maxWidthOrHeight: opts.maxWidthOrHeight,
      useWebWorker: opts.useWebWorker,
      initialQuality: 0.85,
    });

    // Renomme avec le bon type
    return new File([compressed], file.name, {
      type: compressed.type || file.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Erreur compression:', error);
    // En cas d'erreur, on retourne le fichier original
    return file;
  }
}