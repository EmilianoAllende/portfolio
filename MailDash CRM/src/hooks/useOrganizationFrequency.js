import { useState, useCallback, useEffect } from 'react';
import apiClient from '../api/apiClient';

const API_PATH = "/webhook/read-frequency"; // Use the production webhook path instead of webhook-test

export const useOrganizationFrequency = (currentUser) => {
    const [frequencyMap, setFrequencyMap] = useState({});
    const [isInitialLoading, setIsInitialLoading] = useState(false);
    const [isManualLoading, setIsManualLoading] = useState(false);

    const CACHE_KEY = currentUser?.email ? `org_frequency_data_${currentUser.email}` : 'org_frequency_data_anonymous';

    const loadAndProcessData = useCallback(async (isManual = false) => {
        if (!isManual) {
            setIsInitialLoading(true);
        } else {
            setIsManualLoading(true);
        }

        try {
            const response = await apiClient.post(API_PATH);
            const data = response.data;
            
            // data should be an array of objects: { email_remitente, fecha_mes, cantidad }
            const now = new Date().getTime();
            const fourteenDaysInMs = 14 * 24 * 60 * 60 * 1000;
            
            // grouping by email
            const emailSumMap = {};
            
            data.forEach(item => {
                if (!item.email_remitente || !item.fecha_mes || !item.cantidad) return;
                
                const itemDate = new Date(item.fecha_mes).getTime();
                if (now - itemDate <= fourteenDaysInMs) {
                    if (!emailSumMap[item.email_remitente]) {
                        emailSumMap[item.email_remitente] = 0;
                    }
                    emailSumMap[item.email_remitente] += Number(item.cantidad);
                }
            });

            // calculate categories
            const newFrequencyMap = {};
            Object.keys(emailSumMap).forEach(email => {
                const total = emailSumMap[email];
                if (total >= 10) newFrequencyMap[email] = 'alta';
                else if (total >= 5) newFrequencyMap[email] = 'media';
                else if (total > 0) newFrequencyMap[email] = 'baja';
            });

            setFrequencyMap(newFrequencyMap);

            // save to cache
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                date: new Date().toDateString(),
                map: newFrequencyMap
            }));

        } catch (error) {
            console.error("Error loading frequency:", error);
        } finally {
            setIsInitialLoading(false);
            setIsManualLoading(false);
        }
    }, [CACHE_KEY]);

    useEffect(() => {
        const cachedStr = localStorage.getItem(CACHE_KEY);
        if (cachedStr) {
            try {
                const cachedData = JSON.parse(cachedStr);
                const todayStr = new Date().toDateString();
                if (cachedData.date === todayStr && cachedData.map) {
                    setFrequencyMap(cachedData.map);
                    return; // Cache is still valid for today
                }
            } catch (e) {
                console.error("Error parsing frequency cache:", e);
            }
        }

        // Need to load
        loadAndProcessData(false);
    }, [CACHE_KEY, loadAndProcessData]);

    const handleManualUpdate = useCallback(() => {
        loadAndProcessData(true);
    }, [loadAndProcessData]);

    return {
        frequencyMap,
        isInitialLoading,
        isManualLoading,
        handleManualUpdate,
    };
};
