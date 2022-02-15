import React, { useState } from 'react';
import { TetData } from 'tet-shared/types/TetData';
import TetPosting from 'tet-shared/types/tetposting';

type PreviewContextObj = {
  showPreview: boolean;
  tetPosting: TetPosting;
  setPreviewVisibility: (visibility: boolean) => void;
  setTetPostingData: (data: TetPosting) => void;
};

export const initialPosting: TetPosting = {
  title: '',
  description: '',
  location: {
    name: '',
    label: '',
    value: '',
    street_address: '',
    postal_code: '',
    city: '',
  },
  org_name: '',
  spots: 1,
  start_date: '',
  contact_email: '',
  contact_first_name: '',
  contact_last_name: '',
  date_published: null,
  contact_language: 'fi',
  contact_phone: '',
  keywords: [],
  keywords_working_methods: [],
  keywords_attributes: [],
  languages: [],
};

export const PreviewContext = React.createContext<PreviewContextObj>({
  showPreview: false,
  tetPosting: initialPosting,
  setPreviewVisibility: (visibility: boolean) => {},
  setTetPostingData: (data: TetPosting) => {},
});

const PreviewContextProvider: React.FC = (props) => {
  const [showPreview, setShowPreview] = useState(false);
  const [tetPosting, setTetPosting] = useState<TetPosting>(initialPosting);

  const setTetPostingData = (posting: TetPosting) => {
    setTetPosting(posting);
  };

  const contextValue: PreviewContextObj = {
    showPreview,
    tetPosting,
    setPreviewVisibility: setShowPreview,
    setTetPostingData,
  };

  return <PreviewContext.Provider value={contextValue}>{props.children}</PreviewContext.Provider>;
};

export default PreviewContextProvider;
