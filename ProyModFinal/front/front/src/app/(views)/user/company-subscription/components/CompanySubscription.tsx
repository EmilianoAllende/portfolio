'use client';

import { useGlobalMembershipTypes } from '@/hooks/useGlobalMembershipTypes';
import { SubscriptionPlans } from '@/components/Subscription/SubscriptionPlans';

export default function CompanySubscription() {
    const { types, loading, error } = useGlobalMembershipTypes();

    return (
        <SubscriptionPlans
        plans={types}
        title="Elegí el plan ideal para tu empresa"
        error={error}
        loading={loading}
        />
    );
};