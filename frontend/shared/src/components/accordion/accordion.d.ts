type CommonAccordionProps = React.PropsWithChildren<{
  border?: false;
  card?: false;
  heading?: React.ReactElement;
  headingLevel?: number;
  headerBackgroundColor?: string;
  id: string;
  initiallyOpen?: boolean;
  onToggle: (isOpened: boolean) => void;
  hasError?: boolean;
}>;

type CardAccordionProps = Omit<CommonAccordionProps, 'card' | 'border'> & {
  border?: boolean;
  card: true;
};

export type AccordionProps = CommonAccordionProps | CardAccordionProps;
