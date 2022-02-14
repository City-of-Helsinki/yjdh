import React from 'react';
import TetPosting from 'tet/admin/types/tetposting';
import Container from 'shared/components/container/Container';
import PostingInfoItem from 'tet/shared/components/posting/postingInfoItem/PostingInfoItem';
import {
  $ContentWrapper,
  $Body,
  $InfoWrapper,
  $Title,
} from 'tet/shared/components/posting/postingContent/PostingContent.sc';
import { IconCalendarClock, IconLocation, IconInfoCircle } from 'hds-react';
import PostingShareLinks from 'tet/shared/components/posting/postingShareLinks/PostingShareLinks';
import getFormattedDate from 'tet/shared/util/getFormattedDate';

type Props = {
  posting: TetPosting;
};

const PostingContent: React.FC<Props> = ({ posting }) => {
  const addressList = ['Kallin kirjasto', 'Viides Linja 11', '00530 Helsinki'];
  const contact = ['040 123 4567', 'email@email.com'];

  const date = `${getFormattedDate('10-10-2022')}`;

  return (
    <Container>
      <$ContentWrapper>
        <$Body>
          <$Title>Kuvaus</$Title>
          <div>
            Kirjaston työtehtäviin kuuluu palautettujen kirjojen vastaanottaminen, järjestely ja hyllyttäminen. Lorem
            ipsum dolor sit amet, consectetur adipiscing elit. Donec vel neque a diam porta fringilla vel vel tellus.
            Nam aliquet turpis sit amet erat vulputate vehicula. Suspendisse dignissim, lorem nec gravida elementum,
            urna quam dictum enim, sit amet interdum magna neque a purus. Vivamus nunc est, rutrum at sapien accumsan,
            finibus consequat lacus. Aliquam tincidunt sapien eros, at efficitur ipsum porta non. Suspendisse a ipsum
            aliquam, vehicula nulla vitae, congue nibh. In hac habitasse platea dictumst. Vivamus ac auctor odio.
            Praesent quis eleifend augue. Pellentesque dapibus auctor orci eget imperdiet. Nam nunc leo, facilisis
            laoreet mattis sit amet, bibendum in felis. Etiam et rhoncus lorem. Morbi ut leo nulla.
          </div>
          <PostingShareLinks />
        </$Body>
        <$InfoWrapper>
          <PostingInfoItem title={'Päivä ja aika'} body={date} icon={<IconCalendarClock />} />
          <PostingInfoItem title={'Paikka'} body={addressList} icon={<IconLocation />} />
          <PostingInfoItem title={'Muut tiedot'} body={contact} icon={<IconInfoCircle />} />
        </$InfoWrapper>
      </$ContentWrapper>
    </Container>
  );
};

export default PostingContent;
