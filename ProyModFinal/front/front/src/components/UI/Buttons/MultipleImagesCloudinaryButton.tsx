"use client";
import React, { useEffect, useRef } from "react";
import toast from "react-hot-toast";

interface CloudinaryUploadButtonProps {
  onUploadSuccess: (urls: string[]) => void;
  buttonText?: string;
}

const MultipleImagesCloudinaryButton: React.FC<CloudinaryUploadButtonProps> = ({
  onUploadSuccess,
  buttonText = "Subir imagen",
}) => {
  const widgetRef = useRef<any>(null);
  const uploadedUrlsRef = useRef<string[]>([]); 

  useEffect(() => {
    const createWidget = () => {
      widgetRef.current = (window as any).cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
          sources: ["local", "url", "camera"],
          multiple: true,
          cropping: false,
          maxFileSize: 2000000,
          resourceType: "image",
        },
        (error: any, result: any) => {
          if (!error && result.event === "success") {
            uploadedUrlsRef.current.push(result.info.secure_url); 
            toast.success(`Imagen "${result.info.original_filename}" cargada correctamente`);
          } else if (result.event === "close") { 
            if (uploadedUrlsRef.current.length > 0) {
              onUploadSuccess(uploadedUrlsRef.current);
              uploadedUrlsRef.current = []; 
            }
          } else if (error) {
            console.error("Cloudinary upload error:", error);
            toast.error("Error al cargar la imagen.");
          }
        }
      );
    };

    if (!(window as any).cloudinary) {
      const script = document.createElement("script");
      script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
      script.async = true;
      script.onload = () => {
        createWidget();
      };
      document.body.appendChild(script);
    } else {
      createWidget();
    }

    return () => {
      if (widgetRef.current) {
        widgetRef.current = null;
      }
    };
  }, [onUploadSuccess]); 

  const handleUpload = () => {
    if (widgetRef.current) {
      uploadedUrlsRef.current = []; 
      widgetRef.current.open();
    } else {
      toast.error("El widget aún no está listo, intenta nuevamente.");
    }
  };

  return (
    <button
      type="button"
      className="bg-primary text-white px-4 py-2 rounded hover:bg-[#0d0d0d] cursor-pointer"
      onClick={handleUpload}
    >
      {buttonText}
    </button>
  );
};

export default MultipleImagesCloudinaryButton;
