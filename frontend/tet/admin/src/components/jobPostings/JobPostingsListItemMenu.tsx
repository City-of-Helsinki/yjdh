import * as React from 'react';
import { IconPen, IconEye, IconPlusCircle, IconCrossCircle } from 'hds-react';
import { $Menu, $MenuItem } from 'tet/admin/components/jobPostings/JobPostingsListItemMenu.sc';

type JobPostingsListItemMenuProps = {
  onClickOutside: () => void;
  show: boolean;
};

const JobPostingsListItemMenu: React.FC<JobPostingsListItemMenuProps> = (props) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { onClickOutside } = props;

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

  if (!props.show) return null;

  return (
    <$Menu ref={ref}>
      <ul>
        <$MenuItem>
          <IconEye />
          <span>Julkaise nyt</span>
        </$MenuItem>
        <$MenuItem>
          <IconPen />
          <span>Muokkaa</span>
        </$MenuItem>
        <$MenuItem>
          <IconPlusCircle />
          <span>Tee kopio</span>
        </$MenuItem>
        <$MenuItem>
          <IconCrossCircle color={'#b01038'} />
          <span>Poista</span>
        </$MenuItem>
      </ul>
    </$Menu>
  );
};

export default JobPostingsListItemMenu;
