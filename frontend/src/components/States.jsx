import { Inbox } from 'lucide-react';

// spinner shown while data is loading
export const Loader = ({ text = 'Loading...' }) => (
  <div className="loader">
    <span className="spinner" />
    <p>{text}</p>
  </div>
);

// friendly message when a list is empty
export const EmptyState = ({ icon: Icon = Inbox, title, text, children }) => (
  <div className="empty-state">
    <div className="empty-icon">
      <Icon size={26} />
    </div>
    <h4>{title}</h4>
    {text && <p>{text}</p>}
    {children}
  </div>
);
