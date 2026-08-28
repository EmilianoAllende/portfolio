import React from "react";

export interface RegisterFormInputProps {
    id: string;
    label: string;
    name: string;
    type: string;
    value: string;
    touched: boolean;
    error: string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleBlur: (e: React.ChangeEvent<HTMLInputElement>) => void;
};