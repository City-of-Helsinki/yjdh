import Application from 'kesaseteli/employer/types/application';
import Company from 'kesaseteli/employer/types/company';

type DomainObjectType = typeof Application | typeof Company | unknown;

export default DomainObjectType;
