NivoPOS - Frontend 🚀
Este repositorio contiene el código fuente del frontend para NivoPOS, una plataforma integral de punto de venta (POS) y e-commerce desarrollada en 3 semanas de trabajo intensivo. La aplicación está construida con un stack moderno que incluye Astro, Next.js y TypeScript, diseñada para ofrecer una experiencia de usuario fluida, segura y en tiempo real.

NivoPOS permite a las empresas gestionar sus productos y ventas, mientras que sus clientes disfrutan de una tienda online completa con chat, carrito de compras persistente y pagos seguros.

✨ Características Principales
Arquitectura Robusta: Construido con Astro para el contenido estático y Next.js para las partes dinámicas e interactivas de la aplicación, garantizando un rendimiento óptimo.
Control de Acceso Basado en Roles (RBAC): Sistema de permisos diferenciado para tres tipos de usuarios:
Administrador/Empresa: Control total sobre la gestión de productos, empleados y suscripciones.
Vendedor: Acceso al punto de venta, gestión de órdenes y comunicación con clientes.
Cliente Final: Experiencia de compra en la tienda online, perfil y historial de compras.
Autenticación Segura: Inicio de sesión tradicional y mediante proveedores externos como Google (OAuth 2.0), gestionado con JWT a través de cookies.
Gestión de Estado Global: Uso de Zustand para un manejo de estado simple, escalable y sin boilerplate, controlando el carrito de compras, la sesión del usuario y el estado del chat.
Persistencia de Datos: El carrito de compras y la sesión del usuario persisten entre recargas y sesiones, mejorando significativamente la experiencia de usuario.
Comunicación en Tiempo Real: Módulo de chat entre vendedores y clientes implementado con WebSockets para una interacción instantánea.

Integración de Pagos con Stripe:
Modelo de Suscripción: Las empresas clientes pueden suscribirse a los planes de NexoPOS a través de Stripe Subscriptions.
Pasarela de Pago: Los clientes finales pueden comprar productos utilizando tarjetas de crédito/débito de forma segura a través de Stripe Checkout.

🛠️ Tecnologías Utilizadas
Frameworks: Astro, Next.js
Lenguaje: TypeScript
Gestión de Estado: Zustand
Estilos: Tailwind CSS
Autenticación: JSON Web Tokens (JWT), Google OAuth
Comunicación Real-time: WebSockets (Socket.io)
Pagos: Stripe API (Subscriptions & Checkout)
Notificaciones: React Hot Toast y Notiflix