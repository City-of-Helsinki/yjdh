import Application from 'shared/types/application';
import Employment from 'shared/types/employment';

export type DashboardVoucher = Employment & {
    applicationId: string;
    applicationStatus: Application['status'];
    modified_at: string;
};

export type DashboardApplication = Application & {
    modified_at: string;
};
