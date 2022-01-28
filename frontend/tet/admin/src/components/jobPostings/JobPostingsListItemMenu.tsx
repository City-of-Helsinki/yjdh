import * as React from 'react';
import { IconPen, IconEye, IconPlusCircle, IconCrossCircle } from 'hds-react';
import { $Menu, $MenuItem } from 'tet/admin/components/jobPostings/JobPostingsListItemMenu.sc';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

type JobPostingsListItemMenuProps = {
  postingId: string;
  onClickOutside: () => void;
  show: boolean;
};

const JobPostingsListItemMenu: React.FC<JobPostingsListItemMenuProps> = (props) => {
  const { t } = useTranslation();
  const ref = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { postingId, onClickOutside, show } = props;

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
    router.push(`/edit/${postingId}`);
  };

  const deletePostingHandler = (): void => {
    //TODO
  };

  if (!show) return null;

  return (
    <$Menu ref={ref}>
      <ul>
        <$MenuItem>
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
