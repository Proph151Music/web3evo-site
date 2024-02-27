import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type PortalProps = {
  container?: string;
  children: ReactNode;
};

export default function Portal(props: PortalProps) {
  let container = document.querySelector(props.container ?? 'body');

  if (!container) {
    throw new Error(`Invalid query selector. Element ${props.container} does not exist.`);
  }

  return createPortal(props.children, container);
}
