// =====================================================================
// content-styles.js — Injection des styles CSS globaux
// =====================================================================

const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to   { transform: translateX(0);     opacity: 1; }
  }

  .memkeypass-autofill-btn:hover {
    background: linear-gradient(135deg, #0d9488 0%, #0e7490 100%) !important;
    box-shadow: 0 4px 12px rgba(20, 184, 166, 0.4) !important;
  }
  .memkeypass-autofill-btn:active {
    box-shadow: 0 2px 6px rgba(20, 184, 166, 0.3) !important;
  }

  .memkeypass-selector::-webkit-scrollbar        { width: 8px; }
  .memkeypass-selector::-webkit-scrollbar-track  { background: #f1f1f1; border-radius: 8px; }
  .memkeypass-selector::-webkit-scrollbar-thumb  { background: #14b8a6; border-radius: 8px; }
  .memkeypass-selector::-webkit-scrollbar-thumb:hover { background: #0d9488; }

  /* Firefox scrollbar */
  .memkeypass-selector { scrollbar-width: thin; scrollbar-color: #14b8a6 #f1f1f1; }
`;
document.head.appendChild(style);
