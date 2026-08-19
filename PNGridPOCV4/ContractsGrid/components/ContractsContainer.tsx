import * as React from 'react';
import { FluentProvider, webLightTheme, webDarkTheme, Theme } from '@fluentui/react-components';
import { ContractsToolbar } from './ContractsToolbar';
import { ContractsGridTable } from './ContractsGridTable';
import { ContractService } from '../services/ContractService';
import { Contract } from '../models/Contract';

interface ContractsContainerProps {
    entityId: string;
    entityTypeName: string;
    apiEndpoint?: string;
    tokenTheme?: Theme;
    isDarkMode?: boolean;
}

export const ContractsContainer: React.FC<ContractsContainerProps> = ({
    entityId,
    entityTypeName,
    apiEndpoint,
    tokenTheme,
    isDarkMode = false
}) => {
    const [contracts, setContracts] = React.useState<Contract[]>([]);
    const [filteredContracts, setFilteredContracts] = React.useState<Contract[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);

    // Prefer the host model-driven theme so branding matches native D365; harness fallback only
    const theme: Theme = tokenTheme ?? (isDarkMode ? webDarkTheme : webLightTheme);

    const loadData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await ContractService.fetchContractsByEntity(entityId, entityTypeName, apiEndpoint);
            setContracts(data);
            setFilteredContracts(data);
        } catch (error) {
            console.error('Failed to load contract records:', error);
        } finally {
            setIsLoading(false);
        }
    }, [entityId, entityTypeName, apiEndpoint]);

    React.useEffect(() => {
        void loadData();
    }, [loadData]);

    const handleSearch = (query: string) => {
        if (!query.trim()) {
            setFilteredContracts(contracts);
            return;
        }
        const lower = query.toLowerCase();
        setFilteredContracts(
            contracts.filter(
                (c) =>
                    c.contractNumber.toLowerCase().includes(lower) ||
                    c.title.toLowerCase().includes(lower) ||
                    c.owner.toLowerCase().includes(lower) ||
                    c.status.toLowerCase().includes(lower)
            )
        );
    };

    const handleAddContract = () => {
        alert('Action: Opening "Create New Contract" dialog or navigate to custom creation form.');
    };

    const handleRefresh = () => {
        void loadData();
    };

    return (
        <FluentProvider theme={theme} style={{ width: '100%', height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                <ContractsToolbar
                    onAddContract={handleAddContract}
                    onRefresh={handleRefresh}
                    onSearchChange={handleSearch}
                    isLoading={isLoading}
                />
                <ContractsGridTable items={filteredContracts} isLoading={isLoading} />
            </div>
        </FluentProvider>
    );
};