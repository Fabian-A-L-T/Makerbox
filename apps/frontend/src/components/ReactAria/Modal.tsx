'use client';
import { Modal as RACModal, type ModalOverlayProps } from 'react-aria-components/Modal';
import './Modal.css';

export function Modal(props: ModalOverlayProps) {
  return <RACModal {...props}  className={`makerbox-box w-fit h-fit drop-shadow-md [data-entering]:animate-in [data-exiting]:animate-out ${props.className || ''}`}/>;
}
