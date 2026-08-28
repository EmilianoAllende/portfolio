import React from "react";
import { normalizePressEmailBlocks, renderPressInlineTokens } from "../utils/pressEmailUtils";

export default function PressEmailBody({ content }) {
    const blocks = normalizePressEmailBlocks(content);

    if (blocks.length === 0) {
        return <p>No hay cuerpo de nota disponible.</p>;
    }

    return (
        <>
            {blocks.map((block, index) => {
                if (block.type === "callout") {
                    return (
                        <div
                            key={`${block.type}-${index}`}
                            className="rounded-[10px] border border-[var(--border)] bg-slate-50 px-3 py-3 text-[12px] leading-6 text-slate-600 dark:bg-[var(--bg2)] dark:text-[var(--text3)]"
                        >
                            {renderPressInlineTokens(block.text)}
                        </div>
                    );
                }

                if (block.type === "heading") {
                    return (
                        <div key={`${block.type}-${index}`} className="text-[15px] font-semibold leading-6 text-slate-900 dark:text-[var(--text)]">
                            {renderPressInlineTokens(block.text)}
                        </div>
                    );
                }

                if (block.type === "list") {
                    return (
                        <ul key={`${block.type}-${index}`} className="space-y-2 rounded-[10px] border border-[var(--border)] bg-slate-50 px-4 py-3 text-[12px] leading-6 text-slate-700 dark:bg-[var(--bg2)] dark:text-[var(--text2)]">
                            {block.items.map((item, itemIndex) => (
                                <li key={`${block.type}-${index}-${itemIndex}`} className="list-disc ml-4">
                                    {renderPressInlineTokens(item)}
                                </li>
                            ))}
                        </ul>
                    );
                }

                if (block.type === "meta") {
                    return (
                        <div key={`${block.type}-${index}`} className="rounded-[10px] border border-[var(--border)] bg-slate-50 px-3 py-3 text-[12px] leading-6 text-slate-600 dark:bg-[var(--bg2)] dark:text-[var(--text3)]">
                            {renderPressInlineTokens(block.text)}
                        </div>
                    );
                }

                return (
                    <p key={`${block.type}-${index}`}>
                        {renderPressInlineTokens(block.text)}
                    </p>
                );
            })}
        </>
    );
}
