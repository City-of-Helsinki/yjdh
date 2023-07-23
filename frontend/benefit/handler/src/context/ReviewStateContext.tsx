import { ReviewState } from 'benefit/handler/types/application';
import React from 'react';

type ReviewStateContextType = {
  reviewState: ReviewState;
  handleUpdateReviewState: (reviewState: ReviewState) => void;
};

const defaultValues = {
  reviewState: {
    id: '',
    company: false,
    companyContactPerson: false,
    deMinimisAids: false,
    coOperationNegotiations: false,
    employee: false,
    paySubsidy: false,
    benefit: false,
    employment: false,
  },
  handleUpdateReviewState: () => null,
};

export default React.createContext<ReviewStateContextType>(defaultValues);
