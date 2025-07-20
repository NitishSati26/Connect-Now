import { X, Download, ZoomIn, ZoomOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const ImageModal = ({ imageUrl, imageName, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef(null);

  // Reset scale and position when image changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [imageUrl]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        setScale((prev) => Math.min(prev + 0.25, 3));
      } else if (e.key === "-") {
        setScale((prev) => Math.max(prev - 0.25, 0.25));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Handle mouse wheel for zoom
  const handleWheel = (e) => {
    const delta = e.deltaY > 0 ? -0.25 : 0.25;
    setScale((prev) => Math.max(0.25, Math.min(3, prev + delta)));
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  // Handle mouse up for dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Download image
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = imageName || "image";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset zoom and position
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      className="fixed inset-0 bg-base-300/90 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-base-300/50 hover:bg-base-300/70 text-base-content flex items-center justify-center transition-colors"
        title="Close (Esc)"
      >
        <X size={24} />
      </button>

      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        {/* Zoom in */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setScale((prev) => Math.min(prev + 0.25, 3));
          }}
          className="w-10 h-10 rounded-full bg-base-300/50 hover:bg-base-300/70 text-base-content flex items-center justify-center transition-colors"
          title="Zoom In (+)"
        >
          <ZoomIn size={20} />
        </button>

        {/* Zoom out */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setScale((prev) => Math.max(prev - 0.25, 0.25));
          }}
          className="w-10 h-10 rounded-full bg-base-300/50 hover:bg-base-300/70 text-base-content flex items-center justify-center transition-colors"
          title="Zoom Out (-)"
        >
          <ZoomOut size={20} />
        </button>

        {/* Reset */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReset();
          }}
          className="px-3 py-2 rounded-lg bg-base-300/50 hover:bg-base-300/70 text-base-content text-sm transition-colors"
          title="Reset"
        >
          Reset
        </button>

        {/* Download */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className="w-10 h-10 rounded-full bg-base-300/50 hover:bg-base-300/70 text-base-content flex items-center justify-center transition-colors"
          title="Download"
        >
          <Download size={20} />
        </button>
      </div>

      {/* Scale indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 px-3 py-2 rounded-lg bg-base-300/50 text-base-content text-sm">
        {Math.round(scale * 100)}%
      </div>

      {/* Image container */}
      <div
        ref={imageContainerRef}
        className="relative max-w-full max-h-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
        }}
      >
        <img
          src={imageUrl}
          alt={imageName || "Image"}
          className="max-w-full max-h-full object-contain"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${
              position.y / scale
            }px)`,
            transformOrigin: "center",
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
          draggable={false}
        />
      </div>

      {/* Image name */}
      {imageName && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 px-4 py-2 rounded-lg bg-base-300/50 text-base-content text-sm max-w-md truncate">
          {imageName}
        </div>
      )}
    </div>
  );
};

export default ImageModal;
