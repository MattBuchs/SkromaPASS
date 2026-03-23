// =====================================================================
// content-generator.js — Bouton inscription + générateur de mot de passe
// =====================================================================

// Ajouter le bouton générateur (dés, inscription) à côté d'un champ
function addRegistrationButton(form, passwordField) {
	if (!buttonSettings.signupButtonEnabled) return;
	if (passwordField.dataset.SkromaPASSRegButton) return;
	passwordField.dataset.SkromaPASSRegButton = "true";

	const { button, positionNearField, setupDrag } = _createDraggableButton(
		28,
		28,
	);
	button.className = "SkromaPASS-autofill-btn";
	button.title = "Générer un mot de passe avec SkromaPASS";
	button.style.background =
		"linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)";
	button.style.boxShadow = "0 2px 8px rgba(20, 184, 166, 0.4)";
	button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill="white" stroke="none"/>
      <circle cx="15.5" cy="8.5" r="1.5" fill="white" stroke="none"/>
      <circle cx="15.5" cy="15.5" r="1.5" fill="white" stroke="none"/>
      <circle cx="8.5" cy="15.5" r="1.5" fill="white" stroke="none"/>
      <circle cx="12" cy="12" r="1.5" fill="white" stroke="none"/>
    </svg>
  `;

	const onScroll = () => {
		if (!positionNearField(passwordField)) cleanup();
	};
	const onResize = () => {
		if (!positionNearField(passwordField)) cleanup();
	};

	window.addEventListener("scroll", onScroll, {
		passive: true,
		capture: true,
	});
	window.addEventListener("resize", onResize, { passive: true });

	const { onMouseMove, onMouseUp } = setupDrag(() => {
		browserAPI.runtime.sendMessage({ action: "openGeneratorForSignup" });
	});

	function cleanup() {
		window.removeEventListener("scroll", onScroll, true);
		window.removeEventListener("resize", onResize);
		document.removeEventListener("mousemove", onMouseMove);
		document.removeEventListener("mouseup", onMouseUp);
	}
	button._mkpCleanup = cleanup;

	positionNearField(passwordField);
	document.body.appendChild(button);
}
