# Product Requirements Document – NotasCan

## Visión general
NotasCan es una plataforma para la gestión avanzada de campañas de email, organizaciones y usuarios, orientada a la automatización y personalización de comunicaciones masivas. Permite a los usuarios crear, editar y gestionar campañas, plantillas, organizaciones y usuarios a través de una UI React que se comunica con un backend (externo, vía webhooks en n8n).

## Stack técnico
- **Frontend**: React 19, TailwindCSS, Recharts, lucide‑react, @iconify/react.
- **Gestión de estado**: hooks personalizados (`useAppState`, `useQueueManager`, etc.).
- **Comunicación**: Axios client (`src/api/apiClient.js`), proxy a `https://n8n.icc-e.org`.
- **Backend (referenciado)**: Orquestado vía webhooks n8n (FastAPI, Clean Architecture, CQRS, PydanticAI, OpenRouter, Supabase).
- **Testing**: `react-scripts test` (Jest/React Testing Library).
- **Lint/Type**: ESLint (React preset), `mypy --strict` (para código Python del backend).
- **Deploy**: CRA build (`npm run build`).

## Arquitectura actual
```
src/
 ├─ api/                # clientes Axios y endpoints
 ├─ hooks/              # lógica de UI, colas, gestión de organización, usuarios, campañas
 ├─ utils/              # helpers (date, campaign store, etc.)
 ├─ components/         # UI modular (auth, campaigns, organization, users, etc.)
 ├─ App.jsx, index.js   # entry point React
 └─ assets (icons, logos)
```
- Cada hook encapsula una funcionalidad de dominio (ej. `useQueueManager`, `useOrganizationData`, `useUserManagement`).
- `apiClient.js` define los webhooks consumidos por el frontend.
- La capa de UI consume los hooks y muestra datos en componentes.

## Endpoints principales (webhooks)
| Acción | Método | Ruta |
|--------|--------|------|
| Listado de organizaciones | POST | `/webhook/organization-list` |
| Actualizar organización | PUT | `/webhook/organizaciones` |
| Obtener menciones | GET | `/webhook/menciones` |
| Obtener matching | GET | `/webhook/matching` |
| Plantillas de email | POST (GET/SAVE/DELETE) | `/webhook/templates` |
| Generar preview de email | POST | `/webhook/generate-preview` |
| Enviar campaña | POST | `/webhook/confirm-and-send-test` |
| Historial de campañas | GET | `/webhook/campaigns-history` |
| Gestión de usuarios | POST/GET (login, crear, listar, reset, borrar) | `/webhook/notascan-login`, `/webhook/create-user`, … |
| Senders & CTAs | POST/GET | `/webhook/senders`, `/webhook/ctas` |
| Prompts (email marketing) | GET/POST/PATCH/DELETE | `/webhook/api/prompts` |
| Media follow‑up | GET/POST/PATCH | `/webhook/envios_pendientes`, `/webhook/edit-email` |
| Historial global de emails | GET | `/webhook/get-global-email-history` |

## Funcionalidades clave
- **Autenticación y gestión de usuarios** (`apiClient.login`, `createUser`, reset, borrado, roles).
- **Gestión de organizaciones**: listado, actualización, creación y administración.
- **Gestión de campañas y plantillas de email**: creación, edición, preview, envío y seguimiento.
- **Colas dinámicas** para envío masivo de correos (`createDynamicQueue`, `getNextInQueue`).
- **Registro y seguimiento de logs de envíos**.
- **Catálogo de “senders” y “CTAs”** para personalizar campañas.
- **Prompt library** para IA en generación de contenido de emails.
