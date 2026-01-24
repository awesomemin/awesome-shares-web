'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileIcon, Upload, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// 추후 설정 가능한 제한 옵션
// const FILE_UPLOAD_CONFIG = {
//   maxFiles: undefined,
//   maxSize: undefined,
//   accept: undefined,
// };

function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toUpperCase() || '' : '';
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

interface FileListItemProps {
  file: File;
  onRemove: () => void;
}

function FileListItem({ file, onRemove }: FileListItemProps) {
  const extension = getFileExtension(file.name);
  const size = formatFileSize(file.size);

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <div className="flex size-10 items-center justify-center rounded-md bg-muted">
        <FileIcon className="size-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {extension && <span className="uppercase">{extension}</span>}
          {extension && ' • '}
          {size}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onRemove}
        className="shrink-0 text-muted-foreground hover:text-destructive"
      >
        <X className="size-4" />
        <span className="sr-only">파일 삭제</span>
      </Button>
    </div>
  );
}

export default function Sending() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDraggingOverWindow, setIsDraggingOverWindow] = useState(false);
  const dragCounterRef = useRef(0);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => {
      const newFiles = acceptedFiles.filter(
        (newFile) =>
          !prev.some(
            (existing) =>
              existing.name === newFile.name && existing.size === newFile.size
          )
      );
      return [...prev, ...newFiles];
    });
    setIsDraggingOverWindow(false);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = async () => {
    const fetchURL = 'http://localhost:8080/api/upload';
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    const response = await fetch(fetchURL, {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    console.log(result);
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: handleDrop,
    multiple: true,
    noClick: true, // 클릭은 수동으로 처리
  });

  // 전역 드래그 이벤트 감지
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current++;
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDraggingOverWindow(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current--;
      if (dragCounterRef.current === 0) {
        setIsDraggingOverWindow(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDraggingOverWindow(false);
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  return (
    <>
      {/* 숨겨진 파일 input - open() 함수가 참조함 */}
      <input {...getInputProps()} hidden />

      {/* 전역 드래그 오버레이 */}
      {isDraggingOverWindow && (
        <div
          {...getRootProps()}
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-primary p-8">
            <Upload className="size-16 text-primary" />
            <p className="text-xl font-medium text-primary">
              파일을 여기에 놓으세요
            </p>
          </div>
        </div>
      )}

      <Card className="w-full max-w-96">
        <CardHeader>
          <CardTitle>파일 보내기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 드롭존 영역 */}
          <div
            onClick={open}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors border-muted-foreground/25 hover:border-muted-foreground/50'
            )}
          >
            <Upload className="size-10 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">
                파일을 드래그하거나 클릭하여 선택
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                또는 화면 아무 곳에나 파일을 드래그하세요
              </p>
            </div>
          </div>

          {/* 파일 목록 */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <FileListItem
                  key={`${file.name}-${file.size}-${index}`}
                  file={file}
                  onRemove={() => handleRemoveFile(index)}
                />
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={files.length === 0}
            onClick={handleUpload}
          >
            보내기
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
