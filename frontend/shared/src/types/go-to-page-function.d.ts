type Options = {
  operation?: 'push' | 'replace';
  asPath?: string;
  shallow?: boolean;
  locale?: string | false;
  scroll?: boolean;
};

type GoToPageFunction = (pagePath?: string, options?: Options) => void;

export default GoToPageFunction;
