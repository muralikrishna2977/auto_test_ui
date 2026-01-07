import { useEffect, useRef, useState } from "react";
import "./Dropdown2.css";

export default function Dropdown2({
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
    <div className="dropdown-container2" ref={ref}>
      <button
        className="dropdown-trigger2"
        onClick={() => setOpen(o => !o)}
      >
        {trigger}
      </button>

      {open && (
        <div
          className="dropdown-menu2"
          style={menuStyle}
          onClick={() => closeOnClick && setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}
