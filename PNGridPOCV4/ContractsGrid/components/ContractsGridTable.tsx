import * as React from 'react';
import {
    DataGrid,
    DataGridHeader,
    DataGridRow,
    DataGridHeaderCell,
    DataGridBody,
    DataGridCell,
    TableColumnDefinition,
    createTableColumn,
    Badge,
    Spinner,
    makeStyles,
    tokens,
    shorthands
} from '@fluentui/react-components';
import { Contract, ContractStatus } from '../models/Contract';
import { DocumentIcon } from './Icons';

const useStyles = makeStyles({
    gridContainer: {
        width: '100%',
        flexGrow: 1,
        overflowX: 'auto',
        backgroundColor: tokens.colorNeutralBackground1
    },
    noDataContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        ...shorthands.padding(tokens.spacingVerticalXXXL, tokens.spacingHorizontalL),
        color: tokens.colorNeutralForeground3
    },
    headerCell: {
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorNeutralForeground1
    },
    contractLink: {
        color: tokens.colorBrandForeground1,
        textDecorationLine: 'none',
        fontWeight: tokens.fontWeightSemibold,
        cursor: 'pointer',
        ':hover': {
            textDecorationLine: 'underline'
        }
    }
});

interface ContractsGridTableProps {
    items: Contract[];
    isLoading: boolean;
}

export const ContractsGridTable: React.FC<ContractsGridTableProps> = ({ items, isLoading }) => {
    const styles = useStyles();

    const getBadgeAppearance = (status: ContractStatus) => {
        switch (status) {
            case 'Active':
                return { color: 'success' as const, appearance: 'tint' as const };
            case 'Pending':
                return { color: 'warning' as const, appearance: 'tint' as const };
            case 'Expired':
                return { color: 'severe' as const, appearance: 'tint' as const };
            case 'Terminated':
                return { color: 'danger' as const, appearance: 'tint' as const };
            default:
                return { color: 'informative' as const, appearance: 'tint' as const };
        }
    };

    const columns: TableColumnDefinition<Contract>[] = [
        createTableColumn<Contract>({
            columnId: 'contractNumber',
            compare: (a, b) => a.contractNumber.localeCompare(b.contractNumber),
            renderHeaderCell: () => <span className={styles.headerCell}>Contract Number</span>,
            renderCell: (item) => (
                <a className={styles.contractLink} onClick={() => alert(`Opening contract: ${item.contractNumber}`)}>
                    {item.contractNumber}
                </a>
            )
        }),
        createTableColumn<Contract>({
            columnId: 'title',
            compare: (a, b) => a.title.localeCompare(b.title),
            renderHeaderCell: () => <span className={styles.headerCell}>Contract Title</span>,
            renderCell: (item) => <span>{item.title}</span>
        }),
        createTableColumn<Contract>({
            columnId: 'status',
            compare: (a, b) => a.status.localeCompare(b.status),
            renderHeaderCell: () => <span className={styles.headerCell}>Status</span>,
            renderCell: (item) => {
                const config = getBadgeAppearance(item.status);
                return (
                    <Badge color={config.color} appearance={config.appearance}>
                        {item.status}
                    </Badge>
                );
            }
        }),
        createTableColumn<Contract>({
            columnId: 'contractValue',
            compare: (a, b) => a.contractValue - b.contractValue,
            renderHeaderCell: () => <span className={styles.headerCell}>Value</span>,
            renderCell: (item) => (
                <span>
                    {item.currency}{item.contractValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            )
        }),
        createTableColumn<Contract>({
            columnId: 'startDate',
            compare: (a, b) => a.startDate.localeCompare(b.startDate),
            renderHeaderCell: () => <span className={styles.headerCell}>Start Date</span>,
            renderCell: (item) => <span>{item.startDate}</span>
        }),
        createTableColumn<Contract>({
            columnId: 'endDate',
            compare: (a, b) => a.endDate.localeCompare(b.endDate),
            renderHeaderCell: () => <span className={styles.headerCell}>End Date</span>,
            renderCell: (item) => <span>{item.endDate}</span>
        }),
        createTableColumn<Contract>({
            columnId: 'owner',
            compare: (a, b) => a.owner.localeCompare(b.owner),
            renderHeaderCell: () => <span className={styles.headerCell}>Owner</span>,
            renderCell: (item) => <span>{item.owner}</span>
        })
    ];

    if (isLoading) {
        return (
            <div className={styles.noDataContainer}>
                <Spinner label="Loading contracts..." />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className={styles.noDataContainer}>
                <DocumentIcon />
                <p>No contracts found for this record.</p>
            </div>
        );
    }

    return (
        <div className={styles.gridContainer}>
            <DataGrid items={items} columns={columns} sortable resizableColumns focusMode="composite">
                <DataGridHeader>
                    <DataGridRow>
                        {({ renderHeaderCell }) => (
                            <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
                        )}
                    </DataGridRow>
                </DataGridHeader>
                <DataGridBody<Contract>>
                    {({ item, rowId }) => (
                        <DataGridRow<Contract> key={rowId}>
                            {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
                        </DataGridRow>
                    )}
                </DataGridBody>
            </DataGrid>
        </div>
    );
};