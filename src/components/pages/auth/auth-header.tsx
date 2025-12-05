type AuthHeaderProps = {
  title: string;
  subtitle?: string;
  subtitleStart?: string;
  boldText?: string;
  subtitleEnd?: string;
};

export const AuthHeader = ({ title, subtitle, subtitleStart, boldText, subtitleEnd }: AuthHeaderProps) => (
  <div className="text-center">
    <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">{title}</h1>
    {subtitle && <p className="mt-2 text-base text-slate-600">{subtitle}</p>}
    {(subtitleStart || boldText || subtitleEnd) && (
      <p className="mt-1 text-base text-slate-600">
        {subtitleStart}{" "}
        {boldText && <span className="font-semibold text-slate-900">{boldText}</span>} {subtitleEnd}
      </p>
    )}
  </div>
);
