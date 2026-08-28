/**
 * BrevoEventBadge.jsx
 * 
 * Componente para mostrar el último evento de Brevo de una organización
 */

import React from "react";
import { 
	getEventLabel, 
	formatEventDate,
	mapStatusToEventType,
} from "../../utils/campaignEnrichment";


const BrevoEventBadge = ({ 
	event, 
	compact = false,
	showDetails = true 
}) => {
	if (!event) {
		return null;
	}

	let typeKey = event.eventType || mapStatusToEventType(event.status) || "request";
	typeKey = String(typeKey).toLowerCase();
	const eventLabel = getEventLabel(typeKey);
	const formattedDate = formatEventDate(event.lastEvent);
	const detailCounters = [
		{ key: "openedCount", label: "Opened", icon: "👁️" },
		{ key: "uniqueOpenedCount", label: "Unique Opened", icon: "✨" },
		{ key: "proxyOpenCount", label: "Proxy Open", icon: "🛡️" },
		{ key: "uniqueProxyOpenCount", label: "Unique Proxy Open", icon: "🛰️" },
		{ key: "clickCount", label: "Click", icon: "🔗" },
		{ key: "uniqueClickCount", label: "Unique Click", icon: "⭐" },
		{ key: "softBounceCount", label: "Soft Bounce", icon: "⚠️" },
		{ key: "hardBounceCount", label: "Hard Bounce", icon: "❌" },
		{ key: "deferredCount", label: "Deferred", icon: "⏸️" },
	].filter((item) => Number(event[item.key] || 0) > 0);

	if (compact) {
		return (
			<div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${eventLabel.color}`}>
				<span>{eventLabel.icon}</span>
				<span>{eventLabel.label}</span>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{/* Evento principal */}
			<div className={`px-3 py-2 rounded-lg ${eventLabel.color}`}>
				<div className="flex items-center gap-2 font-medium text-sm">
					<span>{eventLabel.icon}</span>
					<span>{eventLabel.label}</span>
				</div>
				
				{showDetails && (
					<div className="mt-1 text-xs opacity-75 space-y-0.5">
						{formattedDate && (
							<div>Última interacción: {formattedDate}</div>
						)}
						
						{detailCounters.length > 0 && (
							<div className="flex flex-wrap gap-3">
								{detailCounters.map((item) => (
									<span key={item.key}>
										{item.icon} {item.label} {event[item.key]} {event[item.key] === 1 ? "vez" : "veces"}
									</span>
								))}
							</div>
						)}

						{event.messageId && (
							<div className="font-mono text-xs opacity-50">
								ID: {event.messageId.substring(0, 16)}...
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default BrevoEventBadge;
