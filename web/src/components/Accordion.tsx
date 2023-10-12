import React, { useState } from 'react';

interface Props {
  title: string;
}

export const Accordion: React.FC<React.PropsWithChildren<Props>> = ({
  title,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={'accordion ' + (isOpen ? 'is-open' : '')}>
      <button
        onClick={() => setIsOpen(isOpen => !isOpen)}
        className="accordion-title"
      >
        {title}
      </button>
      {isOpen && <div className="accordion-content">{children}</div>}
    </div>
  );
};
