import React, { useState } from 'react';
import { TetData } from 'tet-shared/types/TetData';
import TetPosting from 'tet/admin/types/tetposting';

type PreviewContextObj = {
  showPreview: boolean;
  tetPosting: TetPosting;
  setPreviewVisibility: (visibility: boolean) => void;
  setTetPostingData: (data: TetPosting) => void;
  getTemplateData: () => TetData;
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
};
const initialTemplateData: TetData = {
  title: '',
  description: '',
  location: {
    name: '',
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
  contact_language: '',
  contact_phone: '',
  keywords: [],
  keywords_working_methods: [],
  keywords_attributes: [],
};

export const PreviewContext = React.createContext<PreviewContextObj>({
  showPreview: false,
  tetPosting: initialPosting,
  setPreviewVisibility: (visibility: boolean) => {},
  setTetPostingData: (data: TetPosting) => {},
  getTemplateData: () => initialTemplateData,
});

const PreviewContextProvider: React.FC = (props) => {
  const [showPreview, setShowPreview] = useState(false);
  const [tetPosting, setTetPosting] = useState<TetPosting>(initialPosting);

  const setTetPostingData = (posting: TetPosting) => {
    setTetPosting(posting);
  };

  const getTemplateData = (): TetData => {
    console.log(tetPosting, 'previewContext posting');
    return {
      title: tetPosting.title,
      description: tetPosting.description,
      location: {
        name: tetPosting.location?.name ? tetPosting.location.name : '',
        street_address: tetPosting?.location?.street_address ? tetPosting.location.street_address : '',
        postal_code: tetPosting?.location?.postal_code ? tetPosting.location.postal_code : '',
        city: tetPosting?.location?.city ? tetPosting.location.city : '',
      },
      org_name: tetPosting.org_name,
      spots: tetPosting.spots,
      start_date: tetPosting.start_date,
      end_date: tetPosting.end_date,
      contact_email: tetPosting.contact_email,
      contact_first_name: tetPosting.contact_first_name,
      contact_last_name: tetPosting.contact_last_name,
      contact_phone: tetPosting.contact_phone,
      date_published: null,
      contact_language: tetPosting.contact_language,
      keywords: tetPosting.keywords.map((item) => item.name),
      keywords_working_methods: tetPosting.keywords_working_methods.map((item) => item.name),
      keywords_attributes: tetPosting.keywords_attributes.map((item) => item.name),
    };
  };

  const contextValue: PreviewContextObj = {
    showPreview,
    tetPosting,
    setPreviewVisibility: setShowPreview,
    setTetPostingData,
    getTemplateData,
  };

  return <PreviewContext.Provider value={contextValue}>{props.children}</PreviewContext.Provider>;
};

export default PreviewContextProvider;
