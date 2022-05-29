import React, { useState } from 'react';
import TetPosting from 'tet-shared/types/tetposting';

type PreviewContextObj = {
  showPreview: boolean;
  tetPosting: TetPosting;
  formValid: boolean;
  setPreviewVisibility: (visibility: boolean) => void;
  setTetPostingData: (data: TetPosting) => void;
  setFormValid: (isValid: boolean) => void;
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
    position: {
      type: 'Point',
      coordinates: [],
    },
  },
  org_name: '',
  spots: 1,
  start_date: '',
  contact_email: '',
  contact_first_name: '',
  contact_last_name: '',
  date_published: null,
  contact_phone: '',
  keywords: [],
  keywords_working_methods: [],
  keywords_attributes: [],
  languages: [],
  image: null,
  image_url: '',
  image_id: '',
};

export const PreviewContext = React.createContext<PreviewContextObj>({
  showPreview: false,
  tetPosting: initialPosting,
  formValid: false,
  setPreviewVisibility: (visibility: boolean) => {},
  setTetPostingData: (data: TetPosting) => {},
  setFormValid: (isValid: boolean) => {},
});

const PreviewContextProvider: React.FC = (props) => {
  const [showPreview, setShowPreview] = useState(false);
  const [tetPosting, setTetPosting] = useState<TetPosting>(initialPosting);
  const [formValid, setFormValid] = useState(false);

  const setTetPostingData = (posting: TetPosting) => {
    setTetPosting(posting);
  };

  const contextValue: PreviewContextObj = {
    showPreview,
    tetPosting,
    formValid,
    setPreviewVisibility: setShowPreview,
    setTetPostingData,
    setFormValid,
  };

  return <PreviewContext.Provider value={contextValue}>{props.children}</PreviewContext.Provider>;
};

export default PreviewContextProvider;
