"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent, MutableRefObject, PointerEvent } from "react";
import { useRef } from "react";

const DRAG_THRESHOLD = 8;

type DragSafeLinkProps = ComponentProps<typeof Link> & {
  dragLockRef?: MutableRefObject<boolean>;
};

export function DragSafeLink({
  dragLockRef,
  onClick,
  onClickCapture,
  onPointerDown,
  onPointerMove,
  onDragStart,
  ...props
}: DragSafeLinkProps) {
  const drag = useRef({ x: 0, y: 0, moved: false });

  const blockIfDragged = (event: MouseEvent<HTMLAnchorElement>) => {
    const locked = drag.current.moved || Boolean(dragLockRef?.current);
    if (!locked) return false;
    event.preventDefault();
    event.stopPropagation();
    drag.current.moved = false;
    if (dragLockRef) dragLockRef.current = false;
    return true;
  };

  return (
    <Link
      {...props}
      draggable={false}
      onDragStart={(event) => {
        event.preventDefault();
        onDragStart?.(event);
      }}
      onPointerDown={(event: PointerEvent<HTMLAnchorElement>) => {
        drag.current = { x: event.clientX, y: event.clientY, moved: false };
        onPointerDown?.(event);
      }}
      onPointerMove={(event: PointerEvent<HTMLAnchorElement>) => {
        if (
          Math.abs(event.clientX - drag.current.x) > DRAG_THRESHOLD ||
          Math.abs(event.clientY - drag.current.y) > DRAG_THRESHOLD
        ) {
          drag.current.moved = true;
        }
        onPointerMove?.(event);
      }}
      onClickCapture={(event) => {
        if (blockIfDragged(event)) return;
        onClickCapture?.(event);
      }}
      onClick={(event) => {
        if (blockIfDragged(event)) return;
        onClick?.(event);
      }}
    />
  );
}
