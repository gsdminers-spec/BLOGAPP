import React, { useState, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { supabase } from '@/lib/supabase';

interface ImageUploaderProps {
    onImageUploaded: (url: string) => void;
    bucketName?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
    onImageUploaded,
    bucketName = 'blog-images'
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [stats, setStats] = useState<{
        originalSize: string;
        compressedSize: string;
        reduction: string;
    } | null>(null);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const processFile = async (file: File) => {
        setError(null);
        setUploading(true);
        setStats(null);

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (JPG, PNG, WebP)');
            setUploading(false);
            return;
        }

        try {
            const originalSize = file.size;

            // 1. Compression Options (TARGET: UNDER 100KB)
            const options = {
                maxSizeMB: 0.1,          // 100KB Goal
                maxWidthOrHeight: 1200,  // Good for blog width
                useWebWorker: true,
                fileType: 'image/webp',  // Aggressive compression format
                initialQuality: 0.7,     // Start at 70% quality
                alwaysKeepResolution: true // Try to keep resolution if possible, but drop quality
            };

            // 2. Compress
            let compressedFile = await imageCompression(file, options);

            // If still over 100KB, try harder
            if (compressedFile.size > 100 * 1024) {
                compressedFile = await imageCompression(file, {
                    ...options,
                    maxSizeMB: 0.08, // Try for 80KB
                    maxWidthOrHeight: 1000, // Reduce dimensions
                    initialQuality: 0.6
                });
            }

            const newSize = compressedFile.size;
            const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(0);

            setStats({
                originalSize: formatSize(originalSize),
                compressedSize: formatSize(newSize),
                reduction: `${reduction}%`
            });

            // 3. Upload to Supabase
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
            const filePath = `${fileName}`;

            const { data, error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, compressedFile, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: 'image/webp'
                });

            if (uploadError) throw uploadError;

            // 4. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);

            setPreview(publicUrl);
            onImageUploaded(publicUrl);

        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    return (
        <div className="w-full">
            <div
                className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all duration-300
          ${isDragging
                        ? 'border-[#30363D] bg-[#1a1f26]'
                        : 'border-[#30363D] hover:border-[#F7931A]/50 bg-[#0d1117]'}
        `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={uploading}
                />

                <div className="flex flex-col items-center justify-center text-center">
                    {uploading ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="w-10 h-10 text-[#F7931A] animate-spin mb-3" />
                            <p className="text-gray-400 font-medium">Compressing & Uploading...</p>
                            <p className="text-xs text-gray-500 mt-1">Optimizing for mobile...</p>
                        </div>
                    ) : preview ? (
                        <div className="w-full flex flex-col items-center z-20">
                            <div className="relative w-full max-w-sm rounded-lg overflow-hidden border border-[#30363D] mb-4 group">
                                <img src={preview} alt="Uploaded" className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <p className="text-white font-medium text-sm">Click to replace</p>
                                </div>
                            </div>

                            {stats && (
                                <div className="flex items-center gap-4 text-xs bg-[#161B22] px-4 py-2 rounded-full border border-[#30363D]">
                                    <span className="text-gray-500 line-through">{stats.originalSize}</span>
                                    <span className="text-gray-400">→</span>
                                    <span className="text-[#2ECC71] font-bold">{stats.compressedSize}</span>
                                    <span className="text-[#F7931A] font-medium">(-{stats.reduction})</span>
                                </div>
                            )}

                            <div className="flex items-center gap-2 mt-3 text-green-500 text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Upload Complete!</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">URL copied to article</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-full bg-[#161B22] flex items-center justify-center mb-3">
                                <Upload className="w-6 h-6 text-gray-400" />
                            </div>
                            <h3 className="text-gray-200 font-medium mb-1">Upload Image</h3>
                            <p className="text-gray-500 text-xs max-w-xs">
                                Drag & drop or click.
                                <span className="block mt-1 text-[#F7931A]">Auto-compressed to &lt;100KB</span>
                            </p>
                        </>
                    )}

                    {error && (
                        <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-400/10 px-3 py-1.5 rounded-lg border border-red-400/20">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageUploader;
