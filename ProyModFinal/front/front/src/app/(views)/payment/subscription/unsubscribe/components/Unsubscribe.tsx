'use client';

import React from 'react';

export default function Unsubscribe() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto max-w-3xl text-center space-y-6">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Desuscripción
            </h2>
            <p className="text-muted-foreground text-lg">
            Lamentamos que quieras irte. Completá el siguiente formulario para iniciar el proceso de baja.
            </p>

            <div className="w-full h-[680px] mt-6">
                <iframe
                    src="https://tally.so/r/n0Y5KP"
                    width="100%"
                    height="100%"
                    title="Formulario de baja"
                ></iframe>
            </div>
        </div>
        </section>
    );
};