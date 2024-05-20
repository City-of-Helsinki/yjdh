import { $Section } from 'benefit/handler/components/alterationHandling/AlterationHandling.sc';
import React from 'react';

type Props = {
  heading: React.ReactNode;
  withBottomHeadingBorder?: boolean;
};

const AlterationHandlingSection: React.FC<React.PropsWithChildren<Props>> = ({
  heading,
  withBottomHeadingBorder,
  children,
}) => (
  <$Section $headingBottomBorder={withBottomHeadingBorder || false}>
    <h2>{heading}</h2>
    {children}
  </$Section>
);

export default AlterationHandlingSection;
