import React from 'react';
import CompanyInfo from 'tet/admin/components/editor/companyInfo/CompanyInfo';
import PostingDetails from 'tet/admin/components/editor/postingDetails/PostingDetails';
import { Button } from 'hds-react';

// add new posting / edit existing
const Editor: React.FC = () => {
  console.log('rendering editor');

  return (
    <div>
      <p>* pakollinen tieto</p>
      <CompanyInfo />
      <PostingDetails />
      <Button>Tallenna</Button>
    </div>
  );
};

export default Editor;
