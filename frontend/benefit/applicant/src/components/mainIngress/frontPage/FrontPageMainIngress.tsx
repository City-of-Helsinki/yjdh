import { $ActionContainer } from 'benefit/applicant/components/mainIngress/frontPage/FrontPageMainIngress.sc';
import { useFrontPageMainIngress } from 'benefit/applicant/components/mainIngress/frontPage/useFrontPageMainIngress';
import MainIngress from 'benefit/applicant/components/mainIngress/MainIngress';
import { Button, IconPlus } from 'hds-react';
import React from 'react';

const FrontPageMainIngress: React.FC = () => {
  const { t, handleNewApplicationClick } = useFrontPageMainIngress();

  return (
    <MainIngress
      heading={t('common:mainIngress.frontPage.heading')}
      description={
        <>
          {t('common:mainIngress.frontPage.description1')}{' '}
          {/* TODO: uncomment once having link to redirect to more info url
                 or remove if this won't be used.
                 handleMoreInfoClick is from useMainIngress */}
          {/* <$Link onClick={handleMoreInfoClick}>
            {t('common:mainIngress.frontPage.linkText')}
          </$Link> */}
          {t('common:mainIngress.frontPage.description2')}
        </>
      }
    >
      <$ActionContainer>
        <Button
          data-testid="newApplicationButton"
          iconLeft={<IconPlus />}
          onClick={handleNewApplicationClick}
          theme="coat"
        >
          {t('common:mainIngress.frontPage.newApplicationBtnText')}
        </Button>
      </$ActionContainer>
    </MainIngress>
  );
};

export default FrontPageMainIngress;
