import { useTranslation } from 'next-i18next';
import React, { useContext } from 'react';
import useConfirm from 'shared/hooks/useConfirm';
import PreviewBar from 'tet/admin/components/editor/previewWrapper/PreviewBar';
import useUpsertTetPosting from 'tet/admin/hooks/backend/useUpsertTetPosting';
import { PreviewContext } from 'tet/admin/store/PreviewContext';
import { tetPostingToEvent } from 'tet-shared/backend-api/transformations';
import TetPosting from 'tet-shared/types/tetposting';

const PreviewWrapper: React.FC<{ posting: TetPosting }> = ({ children, posting }) => {
  const upsertTetPosting = useUpsertTetPosting();
  const { confirm } = useConfirm();
  const { t } = useTranslation();
  const { formValid } = useContext(PreviewContext);

  const allowPublish = posting.date_published === null && formValid;

  const publishPostingHandler = async (): Promise<void> => {
    if (posting) {
      const isConfirmed = await confirm({
        header: t('common:publish.confirmation', { posting: posting.title }),
        submitButtonLabel: t('common:publish.publishPosting'),
      });

      if (isConfirmed) {
        const event = tetPostingToEvent({
          posting,
          publish: true,
        });

        upsertTetPosting.mutate({
          id: posting.id,
          event,
        });
      }
    }
  };

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <PreviewBar allowPublish={allowPublish} onPublish={publishPostingHandler} />
      <div>{children}</div>
      <PreviewBar hasMargin allowPublish={allowPublish} onPublish={publishPostingHandler} />
    </>
  );
};

export default PreviewWrapper;
