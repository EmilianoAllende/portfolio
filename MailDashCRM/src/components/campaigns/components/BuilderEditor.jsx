import React from "react";
import CampaignTypeFields from "./CampaignTypeFields";
import DynamicContentEditor from "./DynamicContentEditor";
import ExamplesEditor from "./ExamplesEditor";
import ActionButtonEditor from "./ActionButtonEditor";

const BuilderEditor = ({
    editingTpl,
    handleFieldChange,
    activeOrgType,
    setActiveOrgType,
    handleDynamicContentChange,
}) => {
    if (!editingTpl) return null;

    return (
        <div className="p-5 space-y-5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700">
            <CampaignTypeFields
                editingTpl={editingTpl}
                handleFieldChange={handleFieldChange}
            />

            <DynamicContentEditor
                editingTpl={editingTpl}
                activeOrgType={activeOrgType}
                setActiveOrgType={setActiveOrgType}
                handleDynamicContentChange={handleDynamicContentChange}
            />

            <ExamplesEditor
                editingTpl={editingTpl}
                handleFieldChange={handleFieldChange}
            />

            <ActionButtonEditor
                editingTpl={editingTpl}
                handleFieldChange={handleFieldChange}
            />
        </div>
    );
};

export default BuilderEditor;
