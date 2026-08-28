import React from "react";

interface CardListProps {
    children: React.ReactNode
}

const CardList = ({ children }: CardListProps) => {
    return (
            <div className="flex flex-wrap items-center justify-center gap-8">
                {children}
            </div>
    );
};

export default CardList;