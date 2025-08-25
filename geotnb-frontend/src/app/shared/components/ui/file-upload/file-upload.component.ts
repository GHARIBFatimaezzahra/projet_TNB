import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { DragDropModule } from '@angular/cdk/drag-drop';

export interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  id: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatChipsModule,
    
    DragDropModule
  ],
  template: `
    <div class="file-upload-container" [class.disabled]="disabled">
      <!-- Drop zone -->
      <div class="drop-zone" 
           [class.dragover]="isDragOver"
           [class.has-files]="files.length > 0"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)"
           (click)="openFileDialog()">
        
        <div class="drop-content" *ngIf="files.length === 0">
          <mat-icon class="upload-icon">cloud_upload</mat-icon>
          <h3>{{ multiple ? 'Glissez vos fichiers ici' : 'Glissez votre fichier ici' }}</h3>
          <p>ou <button type="button" mat-button color="primary" class="browse-link">parcourir</button></p>
          <div class="file-restrictions" *ngIf="showRestrictions">
            <small>
              <span *ngIf="maxFileSize">Taille max: {{ formatFileSize(maxFileSize) }}</span>
              <span *ngIf="allowedTypes.length > 0">Types: {{ allowedTypes.join(', ') }}</span>
              <span *ngIf="multiple && maxFiles">Max {{ maxFiles }} fichiers</span>
            </small>
          </div>
        </div>

        <!-- Files list -->
        <div class="files-list" *ngIf="files.length > 0">
          <div *ngFor="let file of files; trackBy: trackByFileId" class="file-item">
            <div class="file-info">
              <mat-icon class="file-icon">{{ getFileIcon(file.file.type) }}</mat-icon>
              <div class="file-details">
                <span class="file-name">{{ file.file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.file.size) }}</span>
              </div>
            </div>

            <div class="file-status">
              <mat-progress-bar *ngIf="file.status === 'uploading'" 
                               [value]="file.progress" 
                               mode="determinate">
              </mat-progress-bar>
              
              <mat-icon *ngIf="file.status === 'success'" 
                       class="status-icon success">check_circle</mat-icon>
              
              <mat-icon *ngIf="file.status === 'error'" 
                       class="status-icon error"
                       [matTooltip]="file.error">error</mat-icon>
              
              <button mat-icon-button 
                      class="remove-btn"
                      (click)="removeFile(file.id)"
                      [disabled]="file.status === 'uploading'">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>

          <!-- Add more files -->
          <button *ngIf="multiple && files.length < maxFiles" 
                  mat-stroked-button 
                  class="add-more-btn"
                  (click)="openFileDialog()">
            <mat-icon>add</mat-icon>
            Ajouter d'autres fichiers
          </button>
        </div>
      </div>

      <!-- Hidden file input -->
      <input #fileInput 
             type="file" 
             [multiple]="multiple" 
             [accept]="acceptedMimeTypes"
             (change)="onFileSelected($event)"
             style="display: none;">

      <!-- Upload button -->
      <div class="upload-actions" *ngIf="files.length > 0 && showUploadButton">
        <button mat-raised-button 
                color="primary"
                [disabled]="!canUpload()"
                (click)="uploadFiles()">
          <mat-icon>cloud_upload</mat-icon>
          {{ uploadButtonText }}
        </button>
        
        <button mat-button 
                (click)="clearFiles()"
                [disabled]="isUploading()">
          Tout supprimer
        </button>
      </div>
    </div>
  `,
  styles: [`
    .file-upload-container {
      width: 100%;
      
      &.disabled {
        opacity: 0.6;
        pointer-events: none;
      }
    }

    .drop-zone {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 32px 16px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #fafafa;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        border-color: var(--mat-primary-500);
        background: rgba(63, 81, 181, 0.05);
      }

      &.dragover {
        border-color: var(--mat-primary-500);
        background: rgba(63, 81, 181, 0.1);
        transform: scale(1.02);
      }

      &.has-files {
        border-style: solid;
        border-color: #e0e0e0;
        padding: 16px;
        min-height: auto;
      }
    }

    .drop-content {
      .upload-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #999;
        margin-bottom: 16px;
      }

      h3 {
        margin: 0 0 8px 0;
        color: #333;
        font-weight: 500;
      }

      p {
        margin: 0 0 16px 0;
        color: #666;
      }

      .browse-link {
        padding: 0;
        min-width: auto;
        text-decoration: underline;
      }

      .file-restrictions {
        small {
          color: #999;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
      }
    }

    .files-list {
      width: 100%;
    }

    .file-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 8px;
      background: white;

      .file-info {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;

        .file-icon {
          color: #666;
        }

        .file-details {
          display: flex;
          flex-direction: column;
          
          .file-name {
            font-weight: 500;
            font-size: 14px;
            color: #333;
            word-break: break-all;
          }

          .file-size {
            font-size: 12px;
            color: #999;
          }
        }
      }

      .file-status {
        display: flex;
        align-items: center;
        gap: 8px;

        mat-progress-bar {
          width: 100px;
        }

        .status-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;

          &.success {
            color: #4caf50;
          }

          &.error {
            color: #f44336;
          }
        }

        .remove-btn {
          width: 32px;
          height: 32px;
          
          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }
      }
    }

    .add-more-btn {
      width: 100%;
      margin-top: 8px;
      height: 48px;
      border-style: dashed;
    }

    .upload-actions {
      margin-top: 16px;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    @media (max-width: 768px) {
      .drop-zone {
        padding: 24px 12px;
        min-height: 150px;
      }

      .file-item {
        padding: 8px 12px;
        
        .file-info {
          gap: 8px;
        }
        
        .file-status {
          flex-direction: column;
          gap: 4px;
          
          mat-progress-bar {
            width: 60px;
          }
        }
      }

      .upload-actions {
        flex-direction: column;
        
        button {
          width: 100%;
        }
      }
    }
  `]
})
export class FileUploadComponent {
  @Input() multiple = true;
  @Input() maxFiles = 10;
  @Input() maxFileSize = 50 * 1024 * 1024; // 50MB
  @Input() allowedTypes: string[] = [];
  @Input() disabled = false;
  @Input() showRestrictions = true;
  @Input() showUploadButton = true;
  @Input() uploadButtonText = 'Télécharger les fichiers';
  @Input() autoUpload = false;

  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() fileUpload = new EventEmitter<UploadFile>();
  @Output() uploadComplete = new EventEmitter<UploadFile[]>();
  @Output() error = new EventEmitter<string>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  files: UploadFile[] = [];
  isDragOver = false;
  private fileIdCounter = 0;

  get acceptedMimeTypes(): string {
    return this.allowedTypes.join(',');
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = Array.from(event.dataTransfer?.files || []);
    this.handleFiles(files);
  }

  openFileDialog(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files || []);
    this.handleFiles(files);
    target.value = ''; // Reset input
  }

  private handleFiles(fileList: File[]): void {
    const validFiles: File[] = [];
    
    for (const file of fileList) {
      if (!this.validateFile(file)) {
        continue;
      }
      
      if (!this.multiple && this.files.length >= 1) {
        this.error.emit('Un seul fichier autorisé');
        break;
      }
      
      if (this.files.length >= this.maxFiles) {
        this.error.emit(`Maximum ${this.maxFiles} fichiers autorisés`);
        break;
      }
      
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      const uploadFiles = validFiles.map(file => ({
        file,
        progress: 0,
        status: 'pending' as const,
        id: `file_${++this.fileIdCounter}`
      }));

      this.files.push(...uploadFiles);
      this.filesSelected.emit(validFiles);

      if (this.autoUpload) {
        this.uploadFiles();
      }
    }
  }

  private validateFile(file: File): boolean {
    if (this.maxFileSize && file.size > this.maxFileSize) {
      this.error.emit(`Fichier "${file.name}" trop volumineux (max: ${this.formatFileSize(this.maxFileSize)})`);
      return false;
    }

    if (this.allowedTypes.length > 0 && !this.allowedTypes.some(type => file.type.includes(type))) {
      this.error.emit(`Type de fichier "${file.name}" non autorisé`);
      return false;
    }

    return true;
  }

  removeFile(fileId: string): void {
    this.files = this.files.filter(f => f.id !== fileId);
  }

  clearFiles(): void {
    this.files = [];
  }

  uploadFiles(): void {
    const pendingFiles = this.files.filter(f => f.status === 'pending');
    
    pendingFiles.forEach(uploadFile => {
      uploadFile.status = 'uploading';
      this.simulateUpload(uploadFile);
    });
  }

  private simulateUpload(uploadFile: UploadFile): void {
    // Simulation d'upload - à remplacer par votre logique d'upload réelle
    const interval = setInterval(() => {
      uploadFile.progress += Math.random() * 20;
      
      if (uploadFile.progress >= 100) {
        uploadFile.progress = 100;
        uploadFile.status = 'success';
        clearInterval(interval);
        this.fileUpload.emit(uploadFile);
        
        if (this.files.every(f => f.status !== 'uploading')) {
          this.uploadComplete.emit(this.files);
        }
      }
    }, 200);
  }

  canUpload(): boolean {
    return this.files.some(f => f.status === 'pending') && !this.isUploading();
  }

  isUploading(): boolean {
    return this.files.some(f => f.status === 'uploading');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.includes('pdf')) return 'picture_as_pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'description';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'table_chart';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'archive';
    return 'insert_drive_file';
  }

  trackByFileId(index: number, item: UploadFile): string {
    return item.id;
  }
}