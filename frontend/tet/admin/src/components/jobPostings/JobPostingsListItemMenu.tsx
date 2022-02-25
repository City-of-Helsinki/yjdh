import * as React from 'react';
import { IconPen, IconEye, IconPlusCircle, IconCrossCircle } from 'hds-react';
import { $Menu, $MenuItem } from 'tet/admin/components/jobPostings/JobPostingsListItemMenu.sc';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import useConfirm from 'tet/admin/hooks/context/useConfirm';
import TetPosting from 'tet/admin/types/tetposting';
import useDeleteTetPosting from 'tet/admin/hooks/backend/useDeleteTetPosting';
import usePublishTetPosting from 'tet/admin/hooks/backend/usePublishTetPosting';

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

  const deletePostingHandler = async () => {
    //TODO
    await showConfirm();
  };

  const publishPostingHandler = async () => {
    const isConfirmed = await confirm(t('common:publish.confirmation', { posting: posting.title }));

    if (isConfirmed) {
      publishTetPosting.mutate(posting);
    } else {
      console.log('not confirmed');
    }
  };

  const showConfirm = async () => {
    const isConfirmed = await confirm(t('common:delete.confirmation', { posting: posting.title }));

    if (isConfirmed) {
      deleteTetPosting.mutate(posting);
    } else {
      console.log('not confirmed');
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
        <$MenuItem>
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
