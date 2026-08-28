const { createProxyMiddleware } = require("http-proxy-middleware");

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";
const N8N_URL = "https://n8n.icc-e.org";

// Routes handled by the Python backend (registered first = higher priority)
const PYTHON_ROUTES = [
    "/webhook/notascan-login",
    "/webhook/create-user",
    "/webhook/get-users",
    "/webhook/delete-user",
    "/webhook/reset-password",
    "/webhook/read-frequency",
    "/webhook/senders",
    "/webhook/edit-email",
    "/webhook/templates",
    "/webhook/envios_pendientes",
    "/webhook/confirm-and-send-test",
    "/webhook/send-pending-media-emails",
    "/webhook/organization-list",
    "/webhook/organization",
    "/webhook/organizaciones",
    "/webhook/HystoryLogs",
    // MarkoBot pipeline
    "/capabilities",
    "/campaign-definitions",
];

module.exports = function (app) {
    // Existing marko-api proxy (local backend on port 8000)
    app.use(
        "/marko-api",
        createProxyMiddleware({
            target: PYTHON_BACKEND_URL,
            changeOrigin: true,
            pathRewrite: { "^/marko-api": "/api" },
        })
    );

    // MailDash CRM Python backend routes
    PYTHON_ROUTES.forEach((route) => {
        app.use(
            route,
            createProxyMiddleware({
                target: PYTHON_BACKEND_URL,
                changeOrigin: true,
            })
        );
    });

    // All remaining /webhook/* routes fall through to n8n
    app.use(
        "/webhook",
        createProxyMiddleware({
            target: N8N_URL,
            changeOrigin: true,
        })
    );
};
