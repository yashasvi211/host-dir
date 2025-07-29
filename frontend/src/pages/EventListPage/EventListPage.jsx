import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter } from 'lucide-react';
import './EventListPage.css';

// Helper function to determine the CSS class for the status badge
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Planned': return 'status-planned';
    case 'In Progress': return 'status-in-progress';
    case 'Closed': return 'status-closed';
    case 'Cancelled': return 'status-cancelled';
    default: return 'status-default';
  }
};

// Helper function to get the correct prefix for the event type
const getEventTypePrefix = (eventType) => {
  switch (eventType) {
    case 'Audit':
      return 'AUD';
    case 'Change Control':
      return 'CHC';
    case 'CAPA':
      return 'CPA';
    case 'Deviation':
      return 'DEV';
    default:
      return eventType.substring(0, 3).toUpperCase();
  }
};

function EventListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        // Wake up AI Agent backend
        fetch('https://host-dir-server-ai-agent.onrender.com').catch(err =>
          console.warn("Optional AI Agent wake-up failed:", err.message)
        );

        const response = await fetch('https://host-dir-qms-server-main.onrender.com/events');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEvents(data);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch events:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleRowClick = (eventType, eventId) => {
    if (!eventType || !eventId) return;
    const path = eventType.toLowerCase().replace(/\s+/g, '-');
    navigate(`/event/${path}/${eventId}`);
  };

  if (loading) {
    return <div className="list-page-container"><p>Loading events...</p></div>;
  }

  if (error) {
    return <div className="list-page-container"><p>Error fetching data: {error}</p></div>;
  }

  return (
    <div className="list-page-container">
      <div className="view-header">
        <h1 className="view-title">QMS Dashboard</h1>
        <div className="view-actions">
          <button className="action-button secondary" onClick={() => setFiltersVisible(!filtersVisible)}>
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {filtersVisible && (
        <div className="filter-panel">
          {/* Filter inputs can be implemented here */}
          <p>Filter controls will go here.</p>
        </div>
      )}

      <div className="content-card">
        <p className="load-warning">
          ⚠️ Initial load might take a few seconds due to free hosting. Please wait...
        </p>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Author</th>
                <th>Due/End Date</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map((event) => (
                  <tr key={`${event.type}-${event.id}`} onClick={() => handleRowClick(event.type, event.id)} className="clickable-row">
                    <td className="linkable">{`${getEventTypePrefix(event.type)}-${event.id}`}</td>
                    <td className="wrap-text">{event.title}</td>
                    <td>{event.type}</td>
                    <td><span className={`status-badge ${getStatusBadgeClass(event.status)}`}>{event.status}</span></td>
                    <td>{event.owner || 'N/A'}</td>
                    <td>{event.due_date ? new Date(event.due_date).toLocaleDateString() : 'N/A'}</td>
                    <td>{event.risk || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>No events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EventListPage;
