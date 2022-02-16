import React, { useState } from 'react';
import { TetData } from 'tet/shared/types/TetData';
import TetPosting from 'tet/admin/types/tetposting';

type PreviewContextObj = {
  showPreview: boolean;
  tetData: TetData;
  setPreviewVisibility: (visibility: boolean) => void;
  setPreviewData: (data: TetPosting) => void;
};

const initialTetData: TetData = {
  title: '',
  description: '',
  org_name: '',
  spots: 1,
  start_date: '',
  contact_email: '',
  contact_first_name: '',
  contact_last_name: '',
  contact_language: '',
  contact_phone: '',
  location: {
    zip_code: '',
    city: '',
    street_address: '',
  },
  keywords: [],
  keywords_working_methods: [],
  keywords_attributes: [],
};

export const PreviewContext = React.createContext<PreviewContextObj>({
  showPreview: false,
  tetData: initialTetData,
  setPreviewVisibility: (visibility: boolean) => {},
  setPreviewData: (data: TetPosting) => {},
});

const PreviewContextProvider: React.FC = (props) => {
  const [showPreview, setShowPreview] = useState(false);
  const [tetData, setTetData] = useState<TetData>(initialTetData);

  const setPreviewData = (posting: TetPosting) => {
    setTetData({
      title: posting.title,
      description: posting.description,
      org_name: posting.org_name,
      spots: posting.spots,
      start_date: posting.start_date,
      end_date: posting.end_date,
      contact_email: posting.contact_email,
      contact_first_name: posting.contact_first_name,
      contact_last_name: posting.contact_last_name,
      contact_language: '',
      contact_phone: posting.contact_phone,
      location: {
        zip_code: '',
        city: '',
        street_address: '',
      },
      keywords: [],
      keywords_working_methods: [],
      keywords_attributes: [],
    });
  };

  const contextValue: PreviewContextObj = {
    showPreview,
    tetData,
    setPreviewVisibility: setShowPreview,
    setPreviewData,
  };

  return <PreviewContext.Provider value={contextValue}>{props.children}</PreviewContext.Provider>;
};

export default PreviewContextProvider;
