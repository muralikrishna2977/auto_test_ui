import { useEffect, useRef, useState } from "react";
import "./Dropdown.css";

export default function Dropdown({
  trigger,
  children,
  menuStyle = {},
  closeOnClick = true,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dropdown-container" ref={ref}>
      <button
        className="dropdown-trigger"
        onClick={() => setOpen(o => !o)}
      >
        {trigger}
      </button>

      {open && (
        <div
          className="dropdown-menu"
          style={menuStyle}
          onClick={() => closeOnClick && setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}
