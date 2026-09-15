import * as React from 'react';
import {
    FluentProvider,
    webLightTheme,
    webDarkTheme,
    Theme,
    makeStyles,
    tokens,
    shorthands,
    MessageBar,
    MessageBarBody,
    MessageBarTitle
} from '@fluentui/react-components';
import { ContractsToolbar } from './ContractsToolbar';
import { ContractRequestGridTable, ContractsGridTable } from './ContractsGridTable';
import { ContractService } from '../services/ContractService';
import { Contract, ContractRequest } from '../models/Contract';
import { extractErrorMessage } from '../models/LeahConfiguration';
import { openCreateContractSidePanel } from '../services/d365Navigation';

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minWidth: 0,
        height: '100%',
        backgroundColor: tokens.colorNeutralBackground1
    },
    errorBar: {
        ...shorthands.margin(tokens.spacingVerticalS, tokens.spacingHorizontalS)
    }
});

interface ContractsContainerProps {
    webAPI: ComponentFramework.WebApi;
    entityId: string;
    entityTypeName: string;
    createContractPageName: string;
    tokenTheme?: Theme;
    isDarkMode?: boolean;
}

export const ContractsContainer: React.FC<ContractsContainerProps> = ({
    webAPI,
    entityId,
    entityTypeName,
    createContractPageName,
    tokenTheme,
    isDarkMode = false
}) => {
    const styles = useStyles();
    const [contracts, setContracts] = React.useState<Contract[]>([]);
    //const [contracts, setContracts] = React.useState<ContractRequest[]>([]);
    const [filteredContracts, setFilteredContracts] = React.useState<Contract[]>([]);
    //const [filteredContracts, setFilteredContracts] = React.useState<ContractRequest[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [infoMessage, setInfoMessage] = React.useState<string | null>(null);

    // Prefer the host model-driven theme so branding matches native D365; harness fallback only
    const theme: Theme = tokenTheme ?? (isDarkMode ? webDarkTheme : webLightTheme);

    const loadData = React.useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const data = await ContractService.fetchContractsByEntity(webAPI, entityId, entityTypeName);
            //const data = await ContractService.fetchContractRequestsByEntity(webAPI, entityId, entityTypeName);
            setContracts(data);
            setFilteredContracts(data);
        } catch (error) {
            setContracts([]);
            setFilteredContracts([]);
            setErrorMessage(extractErrorMessage(error, 'Failed to load contract records.'));
        } finally {
            setIsLoading(false);
        }
    }, [webAPI, entityId, entityTypeName]);

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

        //  setFilteredContracts(
        //     contracts.filter(
        //         (c) =>
        //             c.recordId.toString().toLowerCase().includes(lower) ||
        //             c.requesterDepartmentId.toString().toLowerCase().includes(lower) ||
        //             c.requesterUserId.toString().toLowerCase().includes(lower) ||
        //             c.workflowStage.toLowerCase().includes(lower)
        //     )
        // );
    };

    const handleAddContract = () => {
        setInfoMessage(null);
        void openCreateContractSidePanel({
            pageName: createContractPageName,
            entityTypeName,
            entityId
        }).catch((error: unknown) => {
            setInfoMessage(extractErrorMessage(error, 'Unable to open the Create Contract page.'));
        });
    };

    const handleRefresh = () => {
        void loadData();
    };

    return (
        <FluentProvider theme={theme} className={styles.root}>
            <ContractsToolbar
                onAddContract={handleAddContract}
                onRefresh={handleRefresh}
                onSearchChange={handleSearch}
                isLoading={isLoading}
            />
            {errorMessage ? (
                <MessageBar intent="error" className={styles.errorBar}>
                    <MessageBarBody>
                        <MessageBarTitle>Unable to load contracts</MessageBarTitle>
                        {errorMessage}
                    </MessageBarBody>
                </MessageBar>
            ) : null}
            {infoMessage ? (
                <MessageBar intent="warning" className={styles.errorBar}>
                    <MessageBarBody>
                        <MessageBarTitle>Create Contract</MessageBarTitle>
                        {infoMessage}
                    </MessageBarBody>
                </MessageBar>
            ) : null}
             <ContractsGridTable items={filteredContracts} isLoading={isLoading} /> 
            {/* <ContractRequestGridTable items={filteredContracts} isLoading={isLoading} /> */}
        </FluentProvider>
    );
};
