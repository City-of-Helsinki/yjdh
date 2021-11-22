import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Container from 'shared/components/container/Container';

import {
  $Col,
  $HandlerWrapper,
  $InnerWrapper,
  $ItemHeader,
  $ItemValue,
  $ItemWrapper,
  $Wrapper,
} from './ApplicationHeader.sc';

const ApplicationHeader: React.FC = () => {
  const { t } = useTranslation();
  const translationBase = 'common:applications.list.columns';

  return (
    <$Wrapper>
      <Container>
        <$InnerWrapper>
          <$Col>
            <$ItemWrapper>
              <$ItemHeader>{t(`${translationBase}.companyName`)}</$ItemHeader>
              <$ItemValue>Herkkulautanen Oy</$ItemValue>
            </$ItemWrapper>
            <$ItemWrapper>
              <$ItemHeader>{t(`${translationBase}.companyId`)}</$ItemHeader>
              <$ItemValue>1234567-1234</$ItemValue>
            </$ItemWrapper>
            <$ItemWrapper>
              <$ItemHeader>{t(`${translationBase}.companyForm`)}</$ItemHeader>
              <$ItemValue>Yritys</$ItemValue>
            </$ItemWrapper>
            <$ItemWrapper>
              <$ItemHeader>{t(`${translationBase}.submittedAt`)}</$ItemHeader>
              <$ItemValue>21.06.2021</$ItemValue>
            </$ItemWrapper>
            <$ItemWrapper>
              <$ItemHeader>
                {t(`${translationBase}.applicationNum`)}
              </$ItemHeader>
              <$ItemValue>123456789</$ItemValue>
            </$ItemWrapper>
            <$ItemWrapper>
              <$ItemHeader>{t(`${translationBase}.employeeName`)}</$ItemHeader>
              <$ItemValue>Teemu Rantamäki</$ItemValue>
            </$ItemWrapper>
          </$Col>
          <$Col>
            <$HandlerWrapper>KK</$HandlerWrapper>
          </$Col>
        </$InnerWrapper>
      </Container>
    </$Wrapper>
  );
};

export default ApplicationHeader;
