"use client";

import React, { useEffect, useRef } from "react";
import toast from "react-hot-toast";

interface CloudinaryUploadButtonProps {
  onUploadSuccess: (url: string) => void;
  buttonText?: string;
}

const CloudinaryButton: React.FC<CloudinaryUploadButtonProps> = ({
  onUploadSuccess,
  buttonText = "Subir imagen",
}) => {
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    const createWidget = () => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // ¡Añade esta comprobación!
  if (!cloudName || !uploadPreset) {
    console.error("Error: Las variables de entorno de Cloudinary no están definidas.");
    toast.error("Error de configuración del widget de carga.");
    return; // No intentes crear el widget si faltan las claves
  }
        widgetRef.current = (window as any).cloudinary.createUploadWidget( 
        {
          cloudName: cloudName,
          uploadPreset: uploadPreset,
          sources: ["local", "url", "camera"],
          multiple: false,
          cropping: true,
          maxFileSize: 2000000,
          resourceType: "image",
        },
        (error: any, result: any) => {
          if (!error && result.event === "success") {
            onUploadSuccess(result.info.secure_url);
            toast.success("Imagen cargada correctamente");
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

export default CloudinaryButton;
