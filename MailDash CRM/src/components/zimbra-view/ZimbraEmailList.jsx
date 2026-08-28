import React from "react";
import { Inbox } from "lucide-react";
import ZimbraEmailItem from "./ZimbraEmailItem";

const ZimbraEmailList = ({ emails, onSelectEmail, selectedEmailId, onToggleRead }) => {
    if (emails.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-600">
                <Inbox className="h-8 w-8 mb-3 opacity-40" />
                <p className="text-sm font-medium">No hay correos en esta categoría</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
            {emails.map((email) => (
                <ZimbraEmailItem
                    key={email.id}
                    email={email}
                    isSelected={email.id === selectedEmailId}
                    onClick={() => onSelectEmail(email)}
                    onToggleRead={onToggleRead}
                />
            ))}
        </div>
    );
};

export default ZimbraEmailList;
