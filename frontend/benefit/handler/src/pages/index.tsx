import MainIngress from 'benefit/handler/components/mainIngress/MainIngress';
import AppContext from 'benefit/handler/context/AppContext';
import FrontPageProvider from 'benefit/handler/context/FrontPageProvider';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as React from 'react';
import { useEffect } from 'react';
import Container from 'shared/components/container/Container';
import Table, { Column, COLUMN_WIDTH } from 'shared/components/table/Table';
import { $Link } from 'shared/components/table/Table.sc';
import theme from 'shared/styles/theme';

type Application = {
  id: string;
  companyName: string;
  companyId: string;
  received: string;
  applicationNumber: string;
  employeeName: string;
  processorName: string;
};

type ColumnType = Column<Application>;

const ApplicantIndex: NextPage = () => {
  const { setIsNavigationVisible, setLayoutBackgroundColor } =
    React.useContext(AppContext);

  // configure page specific settings
  useEffect(() => {
    setIsNavigationVisible(true);
    setLayoutBackgroundColor(theme.colors.silverLight);
    return () => {
      setIsNavigationVisible(false);
      setLayoutBackgroundColor(theme.colors.white);
    };
  }, [setIsNavigationVisible, setLayoutBackgroundColor]);

  const rawColumns: (ColumnType | undefined)[] = [
    {
      // eslint-disable-next-line react/display-name
      Cell: ({
        cell: {
          row: {
            original: { companyName },
          },
        },
      }) => <$Link>{companyName}</$Link>,
      Header: 'Hakija',
      accessor: 'companyName',
      width: COLUMN_WIDTH.L,
    },
    {
      Header: 'Y-tunnus',
      accessor: 'companyId',
      disableSortBy: true,
      width: COLUMN_WIDTH.S,
    },
    {
      Header: 'Saapunut',
      accessor: 'received',
      disableSortBy: true,
      width: COLUMN_WIDTH.S,
    },
    {
      Header: 'Numero',
      accessor: 'applicationNumber',
      disableSortBy: true,
      width: COLUMN_WIDTH.S,
    },
    {
      Header: 'Työntekijä',
      accessor: 'employeeName',
      disableSortBy: true,
      width: COLUMN_WIDTH.M,
    },
    {
      Header: 'Käsittelijä',
      accessor: 'processorName',
      disableSortBy: true,
      width: COLUMN_WIDTH.M,
    },
  ];

  const columns: ColumnType[] = rawColumns.filter(
    (column): column is ColumnType => column !== undefined
  );

  return (
    <FrontPageProvider>
      <MainIngress />
      <Container>
        <Table
          data={[
            {
              id: '123',
              companyName: 'Some1 Oy',
              companyId: '1234568-1234',
              received: '21.06.2021',
              applicationNumber: '1234553123',
              employeeName: 'Employee name 1',
              processorName: 'Processor name 1',
            },
            {
              id: '1234',
              companyName: 'Some2 Oy',
              companyId: '1234567-1234',
              received: '22.06.2021',
              applicationNumber: '3232133123',
              employeeName: 'Employee name 2',
              processorName: 'Processor name 2',
            },
            {
              id: '1235',
              companyName: 'Some3 Oy',
              companyId: '1234569-1234',
              received: '23.06.2021',
              applicationNumber: '43242323',
              employeeName: 'Employee name 3',
              processorName: 'Processor name 3',
            },
          ]}
          columns={columns}
        />
      </Container>
    </FrontPageProvider>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default ApplicantIndex;
