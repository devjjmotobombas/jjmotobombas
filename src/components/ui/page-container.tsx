export const PageContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="w-full space-y-4 p-3 sm:space-y-6 sm:p-6">{children}</div>;
};

export const PageHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">{children}</div>
  );
};

export const PageHeaderContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="w-full space-y-1">{children}</div>;
};

export const PageTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="text-secondary-foreground text-xl font-bold sm:text-2xl">
      {children}
    </div>
  );
};

export const PageDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="text-muted-foreground text-xs sm:text-sm">
      {children}
    </div>
  );
};

export const PageActions = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
};

export const PageContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="space-y-4 sm:space-y-6">{children}</div>;
};

export const PageFooter = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-center text-center">
      {children}
    </div>
  );
};
