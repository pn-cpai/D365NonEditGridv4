export type ContractStatus = 'Active' | 'Pending' | 'Expired' | 'Terminated';

export interface Contract {
    id: string;
    contractNumber: string;
    title: string;
    contractValue: number;
    currency: string;
    startDate: string;
    endDate: string;
    status: ContractStatus;
    owner: string;
}