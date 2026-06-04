import React, { forwardRef, useState, useRef } from 'react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ items, allowMultiple = false }, ref) => {
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());
    const contentRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    const toggleItem = (id: string) => {
      setOpenItems((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          if (!allowMultiple) {
            next.clear();
          }
          next.add(id);
        }
        return next;
      });
    };

    return (
      <div ref={ref} className="accordion">
        {items.map((item) => (
          <div key={item.id} className="accordion-item">
            <button
              className="accordion-header"
              onClick={() => toggleItem(item.id)}
              aria-expanded={openItems.has(item.id)}
            >
              {item.title}
              <span className={`accordion-icon ${openItems.has(item.id) ? 'open' : ''}`}>
                &#9662;
              </span>
            </button>
            <div
              ref={(el) => {
                if (el) contentRefs.current.set(item.id, el);
              }}
              className={`accordion-content ${openItems.has(item.id) ? 'expanded' : ''}`}
            >
              {item.content}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

Accordion.displayName = 'Accordion';

export default Accordion;
