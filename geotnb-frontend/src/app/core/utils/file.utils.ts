export class FileUtils {
    /**
     * Lit un fichier comme texte
     */
    static readAsText(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });
    }
  
    /**
     * Lit un fichier comme data URL
     */
    static readAsDataURL(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    }
  
    /**
     * Lit un fichier comme array buffer
     */
    static readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
      });
    }
  
    /**
     * Obtient l'extension d'un fichier
     */
    static getFileExtension(filename: string): string {
      return filename.split('.').pop()?.toLowerCase() || '';
    }
  
    /**
     * Vérifie si un fichier est une image
     */
    static isImage(file: File): boolean {
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
      const extension = FileUtils.getFileExtension(file.name);
      return imageTypes.includes(extension);
    }
  
    /**
     * Vérifie si un fichier est un document
     */
    static isDocument(file: File): boolean {
      const docTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
      const extension = FileUtils.getFileExtension(file.name);
      return docTypes.includes(extension);
    }
  
    /**
     * Génère un nom de fichier unique
     */
    static generateUniqueFilename(originalName: string): string {
      const timestamp = Date.now();
      const extension = FileUtils.getFileExtension(originalName);
      const nameWithoutExt = originalName.replace(`.${extension}`, '');
      const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
      
      return `${sanitizedName}_${timestamp}.${extension}`;
    }
  
    /**
     * Télécharge un fichier blob
     */
    static downloadBlob(blob: Blob, filename: string): void {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  
    /**
     * Convertit une taille en bytes vers une chaîne lisible
     */
    static formatBytes(bytes: number, decimals = 2): string {
      if (bytes === 0) return '0 Bytes';
  
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
      const i = Math.floor(Math.log(bytes) / Math.log(k));
  
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
  }