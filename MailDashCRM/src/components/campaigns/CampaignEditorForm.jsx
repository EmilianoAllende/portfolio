import React from "react";
import { Archive } from "lucide-react";

import CampaignEditorHeader from "./editor/CampaignEditorHeader";
import CampaignSenderSelector from "./editor/CampaignSenderSelector";
import CampaignRawMode from "./editor/CampaignRawMode";
import CampaignBuilderMode from "./editor/CampaignBuilderMode";
import CampaignCtaEditor from "./editor/CampaignCtaEditor";

const CampaignEditorForm = ({
    editingTpl,
    hasUnsavedChanges,
    senders,
    isLoadingSenders,
    onFieldChange,
    onDynamicContentChange,
    onSaveTemplate,
    onDeleteTemplate,
    onUseTemplate,
    ctas,
    isLoadingCtas,
    onApplyCta,
    onClearCta,
    onOpenCtasManager,
    onToggleStatus,
}) => {
    const [activeOrgType, setActiveOrgType] = React.useState("AYUNTAMIENTO");

    if (!editingTpl) return null;

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-900">
            <CampaignEditorHeader
                editingTpl={editingTpl}
                hasUnsavedChanges={hasUnsavedChanges}
                onFieldChange={onFieldChange}
                onToggleStatus={onToggleStatus}
                onDeleteTemplate={onDeleteTemplate}
                onSaveTemplate={onSaveTemplate}
                onUseTemplate={onUseTemplate}
            />

            <div className={`flex-1 overflow-y-auto p-4 sm:p-8 ${editingTpl.active === false ? 'opacity-75 grayscale-[20%]' : ''}`}>
                <div className="max-w-4xl mx-auto space-y-8 pb-20">
                    
                    {editingTpl.active === false && (
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg dark:bg-amber-900/20 dark:border-amber-600">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <Archive className="h-5 w-5 text-amber-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                        Esta campaña está archivada
                                    </h3>
                                    <div className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                                        <p>
                                            No aparecerá en el Gestor de Organizaciones para hacer nuevos envíos. 
                                            Puedes editarla, pero para usarla deberás reactivarla desde el botón superior.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <CampaignSenderSelector
                        editingTpl={editingTpl}
                        senders={senders}
                        isLoadingSenders={isLoadingSenders}
                        onFieldChange={onFieldChange}
                    />

                    {editingTpl.mode === "raw" ? (
                        <CampaignRawMode 
                            editingTpl={editingTpl} 
                            onFieldChange={onFieldChange} 
                        />
                    ) : (
                        <CampaignBuilderMode
                            editingTpl={editingTpl}
                            activeOrgType={activeOrgType}
                            setActiveOrgType={setActiveOrgType}
                            onFieldChange={onFieldChange}
                            onDynamicContentChange={onDynamicContentChange}
                        />
                    )}

                    {editingTpl.mode === "builder" && (
                        <CampaignCtaEditor
                            editingTpl={editingTpl}
                            onFieldChange={onFieldChange}
                            ctas={ctas}
                            isLoadingCtas={isLoadingCtas}
                            onApplyCta={onApplyCta}
                            onClearCta={onClearCta}
                            onOpenCtasManager={onOpenCtasManager}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignEditorForm;
