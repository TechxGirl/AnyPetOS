import { useEffect, useRef, useState } from "react";
import { Button, Icon } from "./ui";

export default function TransferSignaturePad({
  value = "",
  onChange,
  disabled = false,
}) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [hasInk, setHasInk] = useState(Boolean(value));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");

    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 3;
    context.strokeStyle = "#111827";

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    if (!value) return;

    const image = new Image();

    image.onload = () => {
      context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );
    };

    image.src = value;
  }, [value]);

  const pointFromEvent = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x:
        ((event.clientX - rect.left) /
          rect.width) *
        canvas.width,
      y:
        ((event.clientY - rect.top) /
          rect.height) *
        canvas.height,
    };
  };

  const startDrawing = (event) => {
    if (disabled) return;

    event.preventDefault();

    const canvas = canvasRef.current;

    canvas.setPointerCapture?.(
      event.pointerId
    );

    const context =
      canvas.getContext("2d");

    const point =
      pointFromEvent(event);

    drawingRef.current = true;

    context.beginPath();
    context.moveTo(
      point.x,
      point.y
    );
  };

  const draw = (event) => {
    if (
      !drawingRef.current ||
      disabled
    ) {
      return;
    }

    event.preventDefault();

    const context =
      canvasRef.current.getContext("2d");

    const point =
      pointFromEvent(event);

    context.lineTo(
      point.x,
      point.y
    );

    context.stroke();

    setHasInk(true);
  };

  const finishDrawing = (event) => {
    if (!drawingRef.current) return;

    event.preventDefault();

    drawingRef.current = false;

    const canvas =
      canvasRef.current;

    canvas.releasePointerCapture?.(
      event.pointerId
    );

    const dataUrl =
      canvas.toDataURL("image/png");

    setHasInk(true);
    onChange?.(dataUrl);
  };

  const clear = () => {
    if (disabled) return;

    const canvas =
      canvasRef.current;

    canvas
      .getContext("2d")
      .clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

    setHasInk(false);
    onChange?.("");
  };

  return (
    <div className="transferSignaturePad">
      <div className="transferSignaturePad__header">
        <div>
          <strong>
            Drawn signature (optional)
          </strong>

          <small>
            Add this only when you want a handwritten-style
            mark on the receipt.
          </small>
        </div>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          leftIcon={
            <Icon
              name="trash"
              size={15}
            />
          }
          onClick={clear}
          disabled={
            disabled || !hasInk
          }
        >
          Clear
        </Button>
      </div>

      <canvas
        ref={canvasRef}
        width="900"
        height="260"
        className={
          hasInk ? "has-ink" : ""
        }
        aria-label="Optional drawn signature area"
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={finishDrawing}
        onPointerCancel={
          finishDrawing
        }
        onPointerLeave={(event) => {
          if (
            drawingRef.current &&
            event.buttons === 0
          ) {
            finishDrawing(event);
          }
        }}
      />

      {!hasInk && (
        <span className="transferSignaturePad__placeholder">
          Draw inside this box
        </span>
      )}
    </div>
  );
}