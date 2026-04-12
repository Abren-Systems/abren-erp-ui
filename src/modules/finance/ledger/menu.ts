export interface ModuleMenuItem {
  label: string;
  routeName: string;
  icon?: string;
  requiredPermission?: string;
}

export interface ModuleMenu {
  id: string;
  label: string;
  icon: string;
  items: ModuleMenuItem[];
}

/**
 * Standardized navigation menu for the Ledger Boundaries.
 * The App Shell imports this to dynamically construct the sidebar navigation,
 * rendering links only if the active user satisfies `requiredPermission`.
 */
export const ledgerMenu: ModuleMenu = {
  id: "ledger",
  label: "General Ledger",
  icon: "BookOpen", // E.g., Lucide Icon name
  items: [
    {
      label: "Chart of Accounts",
      routeName: "LedgerCoa",
      requiredPermission: "ledger:view",
    },
    {
      label: "Journal Entries",
      routeName: "LedgerJournals",
      requiredPermission: "ledger:view",
    },
    {
      label: "Fiscal Periods",
      routeName: "LedgerFiscalPeriods",
      requiredPermission: "ledger:view",
    },
    {
      label: "Settings",
      routeName: "LedgerSettings",
      requiredPermission: "ledger:manage_accounts",
    },
  ],
};
