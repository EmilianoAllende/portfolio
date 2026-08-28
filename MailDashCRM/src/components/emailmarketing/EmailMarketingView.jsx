import React, { useState } from "react";
import { Building, Mail, Zap } from "lucide-react";
import EntesView from "./entes/EntesView";
import PatrociniosView from "./patrocinios/PatrociniosView";
import PromptsView from "./prompts/PromptsView";

const EmailMarketingView = () => {
  const [activeTab, setActiveTab] = useState("entes");

  const tabs = [
    { id: "entes", label: "Entes", icon: Building },
    { id: "patrocinios", label: "Patrocinios", icon: Mail },
    { id: "prompts", label: "Prompts", icon: Zap },
  ];

  return (
    <div className="flex flex-col h-full p-6 bg-slate-100 dark:bg-slate-900">
      {/* Header */}
      <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Email Marketing EC
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Gestiona campañas de email marketing, entes y patrocinios
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-4 mb-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}>
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "entes" && <EntesView />}
        {activeTab === "patrocinios" && <PatrociniosView />}
        {activeTab === "prompts" && <PromptsView />}
      </div>
    </div>
  );
};

export default EmailMarketingView;
