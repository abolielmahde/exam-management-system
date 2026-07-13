/**
 * רכיב הגנה מפני קריסת React. מציג מסך שגיאה במקום דף לבן כאשר קומפוננטה נכשלת.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "Unexpected page error",
    };
  }

  componentDidCatch(error, info) {
    console.error("Page rendering error:", error, info);
  }

  componentDidUpdate(previousProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, message: "" });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="card empty-state">
          <h2>Page could not be displayed</h2>
          <p>{this.state.message}</p>
          <button className="primary" onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </section>
      );
    }
    return this.props.children;
  }
}
