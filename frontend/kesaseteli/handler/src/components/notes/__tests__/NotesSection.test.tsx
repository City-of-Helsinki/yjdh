import { screen } from '@testing-library/react';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

import useUser from '../../../hooks/useUser';
import { NoteTargetType } from '../../../types/note';
import $AccordionSection from '../../form/AccordionSection.sc';
import NotesSection from '../NotesSection';

jest.mock('../../../hooks/useUser');

describe('NotesSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      user: {
        id: 'user-1',
        given_name: 'Test',
        family_name: 'User',
        name: 'Test User',
      },
    });
  });

  it('renders the note form in an open accordion', () => {
    renderComponent(
      <$AccordionSection
        id="notes-accordion"
        heading="Käsittelijän huomiot"
        initiallyOpen
      >
        <NotesSection
          applicationId="app-1"
          targetType={NoteTargetType.YOUTH_APPLICATION}
        />
      </$AccordionSection>
    );

    expect(
      screen.getByRole('button', { name: /^käsittelijän huomiot$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /kirjoita huomio/i })
    ).toBeInTheDocument();
  });
});
