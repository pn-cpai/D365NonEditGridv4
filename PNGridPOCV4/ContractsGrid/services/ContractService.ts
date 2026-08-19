import { Contract } from '../models/Contract';

export class ContractService {
    private static mockContracts: Contract[] = [
        {
            id: 'cnt-001',
            contractNumber: 'CNT-2026-8801',
            title: 'Enterprise Cloud Subscription & SLA',
            contractValue: 125000.00,
            currency: '$',
            startDate: '2025-01-15',
            endDate: '2026-12-31',
            status: 'Active',
            owner: 'Sarah Jenkins'
        },
        {
            id: 'cnt-002',
            contractNumber: 'CNT-2026-8802',
            title: 'Managed IT Operations Support',
            contractValue: 45000.00,
            currency: '$',
            startDate: '2024-06-01',
            endDate: '2026-05-31',
            status: 'Active',
            owner: 'Alex Rivera'
        },
        {
            id: 'cnt-003',
            contractNumber: 'CNT-2025-4109',
            title: 'Legacy Database Migration Services',
            contractValue: 88000.00,
            currency: '$',
            startDate: '2024-01-01',
            endDate: '2025-01-01',
            status: 'Expired',
            owner: 'Michael Chang'
        },
        {
            id: 'cnt-004',
            contractNumber: 'CNT-2026-9012',
            title: 'AI Copilot Integration & Strategy',
            contractValue: 210000.00,
            currency: '$',
            startDate: '2026-09-01',
            endDate: '2027-08-31',
            status: 'Pending',
            owner: 'Sarah Jenkins'
        }
    ];

    /**
     * Fetch contracts filtered by current Dynamics entity ID and logical name
     */
    public static async fetchContractsByEntity(entityId: string, entityLogicalName: string, apiEndpoint?: string): Promise<Contract[]> {
        // Simulated network latency to mimic 3rd party REST call
        await new Promise((resolve) => setTimeout(resolve, 350));

        // TODO: Replace with real REST API call when ready
        // Example:
        // const response = await fetch(`${apiEndpoint}?entityType=${entityLogicalName}&entityId=${entityId}`);
        // return await response.json();

        return [...this.mockContracts];
    }
}