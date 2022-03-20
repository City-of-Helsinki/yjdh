import Image from 'next/image';
import { $ImageWrapper, $PageContent, $Textbox, $TextboxTitle } from './PageContent.sc';

const PageContent = () => {
  return (
    <$PageContent>
      <$ImageWrapper>
        <Image
          width="100%"
          height="100%"
          layout="responsive"
          objectFit="contain"
          src="/etela-haaga_kirjasto_230421_kuva_jussi_hellsten_0693.jpg"
          alt="canteen counter"
        />
      </$ImageWrapper>
      <$Textbox>
        <$TextboxTitle>Mikä TET-paikka?</$TextboxTitle>
        <div>
          Työelämään tutustuminen eli TET kuuluu jokaisen peruskoululaisen elämään. TET:n aikana pääsee näkemään, mitä
          erilaisissa ammateissa tehdään ja pääsee itse kokemaan työelämää
        </div>
      </$Textbox>
    </$PageContent>
  );
};

export default PageContent;
