// GeneratePreviewHtml.jsx

// 1. Agregamos 'senderName' como tercer argumento con un valor por defecto
export const generatePreviewHtml = (editableContent, selectedOrg, senderName = "MMI Analytics") => {
  
  const bodyHtml = `<p>${editableContent.body.replace(/\n/g, '<br>')}</p>`;

  // Generar HTML del botón con estilos inline (compatible con clientes de email)
  const buttonHtml = editableContent.button && editableContent.button.text && editableContent.button.url
    ? `
      <div style="text-align: center; margin: 28px 0; padding: 12px 0;">
        <a href="${editableContent.button.url}" style="background-color: #1f2937; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block; font-family: 'Roboto', Arial, sans-serif;">${editableContent.button.text}</a>
      </div>
    `
    : '';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${editableContent.subject}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { margin:0; background:#fff; font-family:'Roboto', Arial, sans-serif; color:#202124; min-height: 100vh; }
        .gmail-container { max-width:640px; margin:0 auto; background: #fff; }
        .content { 
            padding: 24px; 
            font-size: 15px; 
            line-height: 1.6; 
            color: #3c4043; 
        }
        .content p { margin:0 0 14px; word-wrap: break-word; }

        /* Estilos del botón */
        .button-container {
            margin: 28px 0;
            text-align: center;
            padding: 12px 0;
        }
        .cta-button {
            display: inline-block;
            background-color: #1f2937;
            color: #ffffff;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 15px;
            transition: background-color 0.3s ease;
            border: none;
            cursor: pointer;
            text-align: center;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
        }
        .cta-button:hover {
            background-color: #111827;
        }
        .cta-button:active {
            transform: scale(0.98);
        }

        /* Footer Unificado */
        .footer { 
            font-size: 12px; 
            color: #666666; 
            text-align: center; 
            padding: 20px; 
            border-top: 1px solid #eeeeee; 
            background: #f8f9fa; 
            margin-top: 30px;
        }
        .footer-org {
            font-weight: bold;
            color: #5f6368;
            font-size: 13px;
            margin-bottom: 10px;
            display: block;
        }
        .footer-tech {
            font-size: 11px;
            color: #aaaaaa;
        }
        .footer-tech a { color: #aaaaaa; text-decoration: underline; }

        @media (max-width: 480px) {
            .content { padding: 16px; }
            .cta-button { padding: 12px 24px; font-size: 14px; }
        }
      </style>
    </head>
    <body>
      <div class="gmail-container">
        
        <div class="content">
          ${bodyHtml}
          ${buttonHtml}
        </div>
        
        <div class="footer">
            <span class="footer-org">
                ${senderName}
            </span>
            
            <div class="footer-tech">
               <a href="#">Darse de baja</a>
            </div>
        </div>
        
      </div>
    </body>
    </html>
  `;
};

export default generatePreviewHtml;