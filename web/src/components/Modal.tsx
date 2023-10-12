import React from 'react';
import { IoClose } from 'react-icons/io5';
import { FormProvider, useForm } from 'react-hook-form';

import { Portal } from './Portal';

export interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
}

export const Modal: React.FC<React.PropsWithChildren<ModalProps>> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const methods = useForm();

  return (
    <Portal isOpen={isOpen}>
      <div
        className="overlay"
        onClick={e => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="modal">
          <div className="modal_title">
            <h2>{title}</h2>
            <button title="Close" onClick={onClose}>
              <IoClose />
            </button>
          </div>
          <FormProvider {...methods}>
            <div className="modal_content">{children}</div>
          </FormProvider>
        </div>
      </div>
    </Portal>
  );
};
