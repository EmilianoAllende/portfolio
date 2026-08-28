import React from "react";
import BasicInfoFields from "./BasicInfoFields";
import SenderSelector from "./SenderSelector";
import RawEditor from "./RawEditor";
import BuilderEditor from "./BuilderEditor";
import EditorActions from "./EditorActions";

const EditorForm = ({
    editingTpl,
    setEditingTpl,
    handleFieldChange,
    activeOrgType,
    setActiveOrgType,
    handleDynamicContentChange,
    handleUseClick,
    handleDeleteClick,
    handleSaveClick,
}) => {
    if (!editingTpl) {
        return (
            <div className="p-8 text-center text-sm text-slate-600 dark:text-slate-300 italic">
                Selecciona o crea una plantilla.
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <BasicInfoFields
                editingTpl={editingTpl}
                handleFieldChange={handleFieldChange}
            />

            <SenderSelector editingTpl={editingTpl} setEditingTpl={setEditingTpl} />

            {editingTpl.mode === "raw" ? (
                <RawEditor
                    editingTpl={editingTpl}
                    handleFieldChange={handleFieldChange}
                />
            ) : (
                <BuilderEditor
                    editingTpl={editingTpl}
                    handleFieldChange={handleFieldChange}
                    activeOrgType={activeOrgType}
                    setActiveOrgType={setActiveOrgType}
                    handleDynamicContentChange={handleDynamicContentChange}
                />
            )}

            <EditorActions
                handleUseClick={handleUseClick}
                handleDeleteClick={handleDeleteClick}
                handleSaveClick={handleSaveClick}
            />
        </div>
    );
};

export default EditorForm;
