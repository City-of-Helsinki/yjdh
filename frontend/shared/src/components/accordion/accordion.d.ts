type CommonAccordionProps = React.PropsWithChildren<{
  border?: false;
  card?: false;
  heading?: React.ReactElement | string;
  headingLevel?: number;
  headerBackgroundColor?: string;
  id: string;
  initiallyOpen?: boolean;
  onToggle: (isOpen: boolean) => void;
  hasError?: boolean;
  style?: React.CSSProperties;
}>;

type CardAccordionProps = Omit<CommonAccordionProps, 'card' | 'border'> & {
  border?: boolean;
  card: true;
};

export type AccordionProps = CommonAccordionProps | CardAccordionProps;
