"use client";
import { useEffect, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Text,
  Rect,
  Image as KonvaImage,
  Transformer,
} from "react-konva";
import type Konva from "konva";
import type { SlideElement, SlideDocument } from "@/lib/contracts";
function Picture({
  assetId,
  ...props
}: { assetId: string } & Record<string, unknown>) {
  const [image, setImage] = useState<HTMLImageElement>();
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setImage(img);
    img.src = "/api/assets/" + assetId;
    return () => {
      img.onload = null;
    };
  }, [assetId]);
  return <KonvaImage {...props} image={image} />;
}
export default function SlideCanvas({
  slide,
  selected,
  onSelect,
  onChange,
}: {
  slide: SlideDocument["slides"][number];
  selected: string | null;
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<SlideElement>) => void;
}) {
  const container = useRef<HTMLDivElement>(null),
    stage = useRef<Konva.Stage>(null),
    transformer = useRef<Konva.Transformer>(null);
  const [width, setWidth] = useState(960);
  useEffect(() => {
    const observer = new ResizeObserver((entries) =>
      setWidth(entries[0].contentRect.width),
    );
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const node = selected ? stage.current?.findOne("#" + selected) : null;
    transformer.current?.nodes(node ? [node] : []);
  }, [selected, slide]);
  const scale = width / 960;
  return (
    <div
      ref={container}
      className="canvas-wrap"
      role="application"
      aria-label="Presentation canvas"
      tabIndex={0}
      onKeyDown={(e) => {
        if (!selected) return;
        const obj = slide.objects.find((o) => o.id === selected);
        if (!obj) return;
        const amount = e.shiftKey ? 10 : 1;
        if (
          ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
        ) {
          e.preventDefault();
          onChange(selected, {
            x:
              obj.x +
              (e.key === "ArrowLeft"
                ? -amount
                : e.key === "ArrowRight"
                  ? amount
                  : 0),
            y:
              obj.y +
              (e.key === "ArrowUp"
                ? -amount
                : e.key === "ArrowDown"
                  ? amount
                  : 0),
          });
        }
      }}
    >
      <Stage
        ref={stage}
        width={width}
        height={(width * 9) / 16}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) onSelect(null);
        }}
        onTouchStart={(e) => {
          if (e.target === e.target.getStage()) onSelect(null);
        }}
      >
        <Layer>
          <Rect
            width={960}
            height={540}
            fill={slide.background}
            listening={false}
          />
          {slide.objects.map((o) => {
            const props = {
              id: o.id,
              key: o.id,
              x: o.x,
              y: o.y,
              width: o.width,
              height: o.height,
              rotation: o.rotation,
              draggable: true,
              onClick: () => onSelect(o.id),
              onTap: () => onSelect(o.id),
              onDragStart: () => onSelect(o.id),
              onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) =>
                onChange(o.id, {
                  x: Math.round(e.target.x()),
                  y: Math.round(e.target.y()),
                }),
              onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
                const node = e.target;
                const w = Math.max(
                    10,
                    Math.min(1920, node.width() * node.scaleX()),
                  ),
                  h = Math.max(
                    10,
                    Math.min(1080, node.height() * node.scaleY()),
                  );
                node.scaleX(1);
                node.scaleY(1);
                onChange(o.id, {
                  x: Math.round(node.x()),
                  y: Math.round(node.y()),
                  width: Math.round(w),
                  height: Math.round(h),
                  rotation: Math.round(node.rotation()),
                });
              },
            };
            return o.type === "text" ? (
              <Text
                {...props}
                key={o.id}
                text={o.text}
                fontSize={o.fontSize}
                fill={o.fill}
                fontFamily="Arial"
              />
            ) : o.type === "shape" ? (
              <Rect {...props} key={o.id} fill={o.fill} cornerRadius={12} />
            ) : (
              <Picture {...props} key={o.id} assetId={o.assetId!} />
            );
          })}
          <Transformer
            ref={transformer}
            flipEnabled={false}
            keepRatio={false}
            boundBoxFunc={(oldBox, newBox) =>
              Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10
                ? oldBox
                : newBox
            }
          />
        </Layer>
      </Stage>
    </div>
  );
}
