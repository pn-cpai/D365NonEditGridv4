import * as React from 'react';
import {
    Toolbar,
    ToolbarButton,
    Input,
    makeStyles,
    tokens,
    shorthands
} from '@fluentui/react-components';

import { AddIcon, RefreshIcon, SearchIcon } from "./Icons";

const useStyles = makeStyles({
    toolbarContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: tokens.colorNeutralBackground1,
        ...shorthands.padding('4px', '8px'),
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`
    },
    actionGroup: {
        display: 'flex',
        alignItems: 'center',
        ...shorthands.gap('4px')
    },
    searchInput: {
        width: '220px'
    }
});

interface ContractsToolbarProps {
    onAddContract: () => void;
    onRefresh: () => void;
    onSearchChange: (searchQuery: string) => void;
    isLoading: boolean;
}

export const ContractsToolbar: React.FC<ContractsToolbarProps> = ({
    onAddContract,
    onRefresh,
    onSearchChange,
    isLoading
}) => {
    const styles = useStyles();

    return (
        <div className={styles.toolbarContainer}>
            <Toolbar aria-label="Contracts Command Bar">
                <div className={styles.actionGroup}>
                    <ToolbarButton
                        icon={<AddIcon />}
                        appearance="subtle"
                        onClick={onAddContract}
                        disabled={isLoading}
                    >
                        New Contract
                    </ToolbarButton>
                    
                    <ToolbarButton
                        icon={<RefreshIcon />}
                        appearance="subtle"
                        onClick={onRefresh}
                        disabled={isLoading}
                    >
                        Refresh
                    </ToolbarButton>
                </div>
            </Toolbar>

            <Input
                className={styles.searchInput}
                contentBefore={<SearchIcon />}
                placeholder="Filter contracts..."
                appearance="underline"
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
    );
};