// =====================================================================
// content-autofill.js — Bouton d'auto-remplissage, sélecteur, remplissage
// =====================================================================

const MAX_DRAG_RADIUS = 100;

// Créer un bouton draggable positonné en fixed près d'un champ
function _createDraggableButton(width, height) {
	const button = document.createElement("button");
	button.type = "button";
	button.style.cssText = `
    border: none;
    border-radius: 6px;
    cursor: grab;
    width: ${width}px;
    height: ${height}px;
    position: fixed;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: background 0.2s ease;
  `;

	let isDragging = false;
	let dragStartTime = 0;
	let startMouseX = 0;
	let startMouseY = 0;
	let startBtnX = 0;
	let startBtnY = 0;
	let hasMoved = false;
	let userMoved = false;
	let originX = null;
	let originY = null;

	function positionNearField(field) {
		if (!field.isConnected) return false;
		if (!userMoved) {
			const rect = field.getBoundingClientRect();
			const newLeft = rect.right + 6;
			const newTop = rect.top + (rect.height - height) / 2;
			button.style.left = newLeft + "px";
			button.style.top = newTop + "px";
			originX = newLeft;
			originY = newTop;
		}
		return true;
	}

	function setupDrag(onClickCallback) {
		button.addEventListener("mousedown", (e) => {
			isDragging = true;
			hasMoved = false;
			dragStartTime = Date.now();
			startMouseX = e.clientX;
			startMouseY = e.clientY;
			const btnRect = button.getBoundingClientRect();
			startBtnX = btnRect.left;
			startBtnY = btnRect.top;
			button.style.cursor = "grabbing";
			button.style.transition = "none";
			e.preventDefault();
			e.stopPropagation();
		});

		const onMouseMove = (e) => {
			if (!isDragging) return;
			const dx = e.clientX - startMouseX;
			const dy = e.clientY - startMouseY;
			if (Math.abs(dx) + Math.abs(dy) > 5) hasMoved = true;

			let newLeft = startBtnX + dx;
			let newTop = startBtnY + dy;

			if (originX !== null) {
				const ox = newLeft - originX;
				const oy = newTop - originY;
				const dist = Math.sqrt(ox * ox + oy * oy);
				if (dist > MAX_DRAG_RADIUS) {
					newLeft = originX + (ox / dist) * MAX_DRAG_RADIUS;
					newTop = originY + (oy / dist) * MAX_DRAG_RADIUS;
				}
			}

			newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - width));
			newTop = Math.max(0, Math.min(newTop, window.innerHeight - height));

			button.style.left = newLeft + "px";
			button.style.top = newTop + "px";
			userMoved = true;
		};

		const onMouseUp = () => {
			if (!isDragging) return;
			isDragging = false;
			button.style.cursor = "grab";
			button.style.transition = "background 0.2s ease";
			if (!hasMoved || Date.now() - dragStartTime < 200) {
				onClickCallback();
			}
		};

		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", onMouseUp);

		return { onMouseMove, onMouseUp };
	}

	return { button, positionNearField, setupDrag };
}

// Ajouter le bouton MemKeyPass (auto-remplissage) à côté d'un champ de mot de passe
function addMemKeyPassButton(passwordField, hasPasswords) {
	if (!buttonSettings.enabled) return;
	if (!hasPasswords) return;
	if (passwordField.dataset.memkeypassButton) return;

	passwordField.dataset.memkeypassButton = "true";

	const { button, positionNearField, setupDrag } = _createDraggableButton(
		32,
		32,
	);
	button.className = "memkeypass-autofill-btn";
	button.title = "Remplir avec MemKeyPass";
	button.style.background =
		"linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)";
	button.style.boxShadow = "0 2px 8px rgba(20, 184, 166, 0.3)";
	button.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="3" fill="white"/>
      <circle cx="7" cy="7" r="1.2" fill="#14b8a6"/>
      <rect x="6" y="7" width="2" height="12" fill="white"/>
      <rect x="4" y="17" width="2" height="2" fill="white"/>
      <rect x="4" y="14" width="2" height="2" fill="white"/>
      <rect x="8" y="15.5" width="2" height="2" fill="white"/>
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
		chrome.runtime.sendMessage(
			{ action: "getPasswords", url: window.location.href },
			(response) => {
				if (
					response &&
					response.success &&
					response.passwords.length > 0
				) {
					showPasswordSelector(passwordField, response.passwords);
				} else {
					alert("Aucun mot de passe enregistré pour ce site");
				}
			},
		);
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

// Afficher un sélecteur de mot de passe sous le champ
function showPasswordSelector(passwordField, passwords) {
	const old = document.querySelector(".memkeypass-selector");
	if (old) old.remove();

	const selector = document.createElement("div");
	selector.className = "memkeypass-selector";
	selector.style.cssText = `
    position: absolute;
    background: white;
    border: 2px solid #14b8a6;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(20, 184, 166, 0.2);
    z-index: 10001;
    max-height: 300px;
    overflow-y: auto;
    min-width: 280px;
  `;

	passwords.forEach((pwd) => {
		const item = document.createElement("div");
		item.style.cssText = `
      padding: 14px 18px;
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;
      transition: all 0.2s ease;
    `;
		item.innerHTML = `
      <div style="font-weight: 600; color: #0f172a; font-size: 14px;">${escapeHtml(pwd.name)}</div>
      <div style="font-size: 13px; color: #64748b; margin-top: 4px;">${escapeHtml(pwd.username || pwd.email || "")}</div>
    `;
		item.addEventListener("mouseover", () => {
			item.style.backgroundColor = "#f0fdfa";
			item.style.borderLeft = "3px solid #14b8a6";
			item.style.paddingLeft = "15px";
		});
		item.addEventListener("mouseout", () => {
			item.style.backgroundColor = "white";
			item.style.borderLeft = "none";
			item.style.paddingLeft = "18px";
		});
		item.addEventListener("click", () => {
			selector.remove();
			document
				.querySelectorAll(".memkeypass-autofill-btn")
				.forEach((btn) => {
					if (btn._mkpCleanup) btn._mkpCleanup();
					btn.remove();
				});
			fillFormWithPassword(passwordField, pwd);
		});
		selector.appendChild(item);
	});

	const rect = passwordField.getBoundingClientRect();
	selector.style.top = `${rect.bottom + window.scrollY + 5}px`;
	selector.style.left = `${rect.left + window.scrollX}px`;
	document.body.appendChild(selector);

	setTimeout(() => {
		document.addEventListener(
			"click",
			(e) => {
				if (!selector.contains(e.target)) selector.remove();
			},
			{ once: true },
		);
	}, 100);
}

// Remplir le formulaire avec les données du mot de passe sélectionné
function fillFormWithPassword(passwordField, passwordData) {
	const form = passwordField.closest("form");
	if (!form) return;

	const fields = findFormFields(form);

	const fillField = (field, value) => {
		if (!field || !value) return;
		field.focus();
		const setter = Object.getOwnPropertyDescriptor(
			window.HTMLInputElement.prototype,
			"value",
		).set;
		setter.call(field, value);
		field.dispatchEvent(
			new Event("input", { bubbles: true, cancelable: true }),
		);
		field.dispatchEvent(
			new Event("change", { bubbles: true, cancelable: true }),
		);
		field.dispatchEvent(
			new InputEvent("input", {
				bubbles: true,
				cancelable: true,
				inputType: "insertText",
				data: value,
			}),
		);
		field.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, cancelable: true }),
		);
		field.dispatchEvent(
			new KeyboardEvent("keyup", { bubbles: true, cancelable: true }),
		);
		setTimeout(() => field.blur(), 50);
	};

	if (fields.email) {
		fillField(
			fields.email,
			passwordData.email || passwordData.username || "",
		);
	} else if (fields.username) {
		fillField(
			fields.username,
			passwordData.email || passwordData.username || "",
		);
	}

	setTimeout(() => {
		if (fields.password && passwordData.password) {
			fillField(fields.password, passwordData.password);
		}

		if (autoSubmitEnabled) {
			setTimeout(() => {
				const submitButton = form.querySelector(
					'button[type="submit"], input[type="submit"], button:not([type="button"]):not([type="reset"])',
				);
				if (submitButton && !submitButton.disabled) {
					submitButton.click();
				} else {
					try {
						form.submit();
					} catch (e) {
						form.dispatchEvent(
							new Event("submit", {
								bubbles: true,
								cancelable: true,
							}),
						);
					}
				}
			}, 500);
		}
	}, 200);
}
