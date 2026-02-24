export default function ArabicText({
  children,
  className = '',
  size = 'text-2xl',
  as: Tag = 'span',
  ...props
}) {
  return (
    <Tag
      dir="rtl"
      lang="ar"
      className={`font-arabic ${size} leading-[1.8] ${className}`}
      style={{
        unicodeBidi: 'isolate',
        fontFeatureSettings: '"liga" 1, "calt" 1',
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}
