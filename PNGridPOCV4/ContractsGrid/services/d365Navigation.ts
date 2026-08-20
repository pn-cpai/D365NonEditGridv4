import { extractErrorMessage, isPcfTestHarness } from '../models/LeahConfiguration';

export const DEFAULT_CREATE_CONTRACT_PAGE_NAME = 'cr964_createcontractpagepoc_cd646';

const CREATE_CONTRACT_PANE_ID = 'pn-create-contract-pane';
const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

interface CustomPageInput {
    pageType: 'custom';
    name: string;
    entityName?: string;
    recordId?: string;
}

interface XrmSidePane {
    navigate: (input: CustomPageInput) => Promise<void>;
}

interface XrmSidePanes {
    getPane?: (paneId: string) => XrmSidePane | null;
    createPane?: (options: {
        title?: string;
        paneId?: string;
        canClose?: boolean;
        width?: number;
    }) => Promise<XrmSidePane>;
}

interface XrmNavigation {
    navigateTo?: (
        pageInput: CustomPageInput,
        options?: {
            target: number;
            position?: number;
            width?: { value: number; unit: string };
            title?: string;
        }
    ) => Promise<unknown>;
}

interface XrmHost {
    App?: { sidePanes?: XrmSidePanes };
    Navigation?: XrmNavigation;
}

/**
 * Opens the published Create Contract custom page as a right-side slider.
 * Prefers Xrm.App.sidePanes; falls back to navigateTo (target 2, position 2).
 */
export async function openCreateContractSidePanel(args: {
    pageName: string;
    entityTypeName?: string;
    entityId?: string;
}): Promise<void> {
    const pageName = args.pageName.trim() || DEFAULT_CREATE_CONTRACT_PAGE_NAME;
    const pageInput = buildPageInput(pageName, args.entityTypeName, args.entityId);
    const xrm = getXrm();

    if (isPcfTestHarness() || !xrm) {
        throw new Error(
            'Create Contract opens as a Dynamics 365 side pane. It is not available in the PCF test harness.'
        );
    }

    const sidePanes = xrm.App?.sidePanes;
    if (sidePanes?.createPane) {
        try {
            const existing = sidePanes.getPane?.(CREATE_CONTRACT_PANE_ID) ?? null;
            const pane =
                existing ??
                (await sidePanes.createPane({
                    title: 'Create Contract',
                    paneId: CREATE_CONTRACT_PANE_ID,
                    canClose: true,
                    width: 600
                }));
            await pane.navigate(pageInput);
            return;
        } catch (error) {
            console.warn(
                'sidePanes failed; falling back to navigateTo side dialog',
                extractErrorMessage(error)
            );
        }
    }

    if (!xrm.Navigation?.navigateTo) {
        throw new Error('Xrm.Navigation.navigateTo is unavailable. Cannot open the Create Contract page.');
    }

    // target 2 = dialog, position 2 = side (slider). position 1 would be center.
    await xrm.Navigation.navigateTo(pageInput, {
        target: 2,
        position: 2,
        width: { value: 50, unit: '%' },
        title: 'Create Contract'
    });
}

function buildPageInput(
    pageName: string,
    entityTypeName?: string,
    entityId?: string
): CustomPageInput {
    const pageInput: CustomPageInput = {
        pageType: 'custom',
        name: pageName
    };

    if (entityTypeName) {
        pageInput.entityName = entityTypeName;
    }

    const recordId = stripGuidBraces(entityId ?? '');
    if (recordId && recordId.toLowerCase() !== EMPTY_GUID) {
        pageInput.recordId = recordId;
    }

    return pageInput;
}

function getXrm(): XrmHost | undefined {
    return (window as Window & { Xrm?: XrmHost }).Xrm;
}

function stripGuidBraces(id: string): string {
    return id.replace(/[{}]/g, '');
}
