import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Video, VideoOff, AlertCircle } from 'lucide-react';

export function CameraProctor() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string>('');
    const [isEnabled, setIsEnabled] = useState(false);

    // Use a ref to keep track of the stream so cleanup works without dependency issues
    const streamRef = useRef<MediaStream | null>(null);

    const startCamera = async () => {
        try {
            setError('');
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            streamRef.current = mediaStream;
            setIsEnabled(true);
        } catch (err: any) {
            console.error("Error accessing media devices.", err);
            setError('Camera/Microphone access denied or unavailable.');
            setIsEnabled(false);
        }
    };

    // Auto-attach stream to video tag whenever component re-renders into the "enabled" state
    useEffect(() => {
        if (isEnabled && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [isEnabled]);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsEnabled(false);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []); // Empty dependency array so it only runs on unmount

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
            {error && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-red-500/90 text-white px-4 py-2 rounded-xl text-sm flex items-center space-x-2 shadow-lg backdrop-blur-md"
                >
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </motion.div>
            )}

            {isEnabled ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative bg-dark-800 rounded-2xl overflow-hidden border border-white/10 shadow-2xl glass-panel group"
                >
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted // Muted to prevent audio feedback loop
                        className="w-48 h-36 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            onClick={stopCamera}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                            title="Stop Camera"
                        >
                            <VideoOff className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="absolute bottom-2 right-2 flex space-x-1.5 opacity-70">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    </div>
                </motion.div>
            ) : (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startCamera}
                    className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white shadow-xl shadow-primary-500/20 px-5 py-3 rounded-xl font-medium transition-colors border border-primary-400/30"
                >
                    <Video className="w-5 h-5" />
                    <span>Enable Proctoring</span>
                </motion.button>
            )}
        </div>
    );
}
