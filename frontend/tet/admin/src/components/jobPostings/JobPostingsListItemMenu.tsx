import { IconCrossCircle, IconEye, IconPen, IconPlusCircle } from 'hds-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import useConfirm from 'shared/hooks/useConfirm';
import { $Menu, $MenuItem } from 'tet/admin/components/jobPostings/JobPostingsListItemMenu.sc';
import useDeleteTetPosting from 'tet/admin/hooks/backend/useDeleteTetPosting';
import usePublishTetPosting from 'tet/admin/hooks/backend/usePublishTetPosting';
import TetPosting from 'tet/admin/types/tetposting';

type JobPostingsListItemMenuProps = {
  posting: TetPosting;
  onClickOutside: () => void;
  show: boolean;
};

const JobPostingsListItemMenu: React.FC<JobPostingsListItemMenuProps> = (props) => {
  const { t } = useTranslation();
  const { confirm } = useConfirm();
  const ref = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { posting, onClickOutside, show } = props;
  const deleteTetPosting = useDeleteTetPosting();
  const publishTetPosting = usePublishTetPosting();

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (ref.current && !ref.current.contains(event.target as HTMLElement)) {
        onClickOutside && onClickOutside();
      }
    };
    document.addEventListener('click', handleClickOutside, true);

    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [onClickOutside]);

  const editPostingHandler = (): void => {
    void router.push({
      pathname: '/editstatic',
      query: { id: posting.id },
    });
  };

  const copyPostingHandler = (): void => {
    void router.push({
      pathname: '/copystatic',
      query: { id: posting.id },
    });
  };

  const deletePostingHandler = async () => {
    await showConfirm();
  };
  const showConfirm = async () => {
    const isConfirmed = await confirm({
      header: t('common:delete.confirmation', { posting: posting.title }),
      submitButtonLabel: t('common:delete.deletePosting'),
    });

    if (isConfirmed) {
      deleteTetPosting.mutate(posting);
    }
  };

  const publishPostingHandler = async () => {
    const isConfirmed = await confirm({
      header: t('common:publish.confirmation', { posting: posting.title }),
      submitButtonLabel: t('common:publish.publishPosting'),
    });

    if (isConfirmed) {
      publishTetPosting.mutate(posting);
    }
  };

  if (!show) return null;

  return (
    <$Menu ref={ref}>
      <ul>
        <$MenuItem onClick={publishPostingHandler}>
          <IconEye />
          <span>{t('common:application.jobPostings.menu.publishNow')}</span>
        </$MenuItem>
        <$MenuItem onClick={editPostingHandler}>
          <IconPen />
          <span>{t('common:application.jobPostings.menu.edit')}</span>
        </$MenuItem>
        <$MenuItem onClick={copyPostingHandler}>
          <IconPlusCircle />
          <span>{t('common:application.jobPostings.menu.copy')}</span>
        </$MenuItem>
        <$MenuItem onClick={deletePostingHandler}>
          <IconCrossCircle color={'#b01038'} />
          <span>{t('common:application.jobPostings.menu.delete')}</span>
        </$MenuItem>
      </ul>
    </$Menu>
  );
};

export default JobPostingsListItemMenu;
