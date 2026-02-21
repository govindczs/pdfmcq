import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    isProcessing: boolean;
}

export function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        maxFiles: 1,
        disabled: isProcessing
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl mx-auto"
        >
            <div
                {...getRootProps()}
                className={`glass-panel relative overflow-hidden group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 ${isDragActive ? 'border-primary-500 bg-primary-500/10' : 'border-white/20 hover:border-primary-400/50 hover:bg-white/5'
                    } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <input {...getInputProps()} />
                <div className="px-8 py-20 flex flex-col items-center justify-center text-center">
                    {isProcessing ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                            <Loader2 className="w-16 h-16 text-primary-400 mb-6" />
                        </motion.div>
                    ) : (
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                            <UploadCloud className={`w-16 h-16 relative transition-colors duration-300 ${isDragActive ? 'text-primary-400' : 'text-slate-300 group-hover:text-primary-300'}`} />
                        </div>
                    )}

                    <h3 className="text-2xl font-semibold mb-3 tracking-tight">
                        {isProcessing ? 'Generating Your Quiz...' : isDragActive ? 'Drop your PDF here' : 'Select a PDF to begin'}
                    </h3>
                    <p className="text-slate-400 text-lg max-w-md">
                        {isProcessing
                            ? 'Our AI is reading your document and crafting insightful questions.'
                            : 'Drag and drop your course material, research paper, or any PDF document.'}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
