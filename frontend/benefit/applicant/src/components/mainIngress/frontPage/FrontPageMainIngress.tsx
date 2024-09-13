import { $ActionContainer } from 'benefit/applicant/components/mainIngress/frontPage/FrontPageMainIngress.sc';
import { useFrontPageMainIngress } from 'benefit/applicant/components/mainIngress/frontPage/useFrontPageMainIngress';
import MainIngress from 'benefit/applicant/components/mainIngress/MainIngress';
import useCloneApplicationMutation from 'benefit/applicant/hooks/useCloneApplicationMutation';
import { Button, IconCopy, IconPlus } from 'hds-react';
import { useRouter } from 'next/router';
import React from 'react';

const FrontPageMainIngress: React.FC = () => {
  const { t, handleNewApplicationClick } = useFrontPageMainIngress();

  const { data: clonedData, mutate: cloneApplication } =
    useCloneApplicationMutation();

  const router = useRouter();

  React.useEffect(() => {
    if (clonedData?.id) {
      void router.push(`/application?id=${clonedData.id}`);
    }
  }, [clonedData?.id, router]);

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
        <hr />
        <Button
          theme="coat"
          variant="secondary"
          iconLeft={<IconCopy />}
          onClick={() => cloneApplication(null)}
          aria-labelledby="clone-application-button-helper"
        >
          {t('common:mainIngress.frontPage.cloneApplication.buttonText')}
        </Button>
        <small id="clone-application-button-helper">
          {t('common:mainIngress.frontPage.cloneApplication.helperText')}
        </small>
      </$ActionContainer>
    </MainIngress>
  );
};

export default FrontPageMainIngress;
