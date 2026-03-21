"use client";

import Button from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, ArrowRight, Check, GripHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function TutorialTour({
	steps,
	onComplete,
	onSkip,
	onNavigate,
	onStepChange,
	currentStepIndexOverride,
	totalSteps,
	globalStepIndex,
}) {
	const { t } = useLanguage();
	const [isVisible, setIsVisible] = useState(false);
	const [cardVisible, setCardVisible] = useState(false);
	const [dragPos, setDragPos] = useState(null);
	const [isDragging, setIsDragging] = useState(false);
	const dragStartRef = useRef(null);
	const cardRef = useRef(null);

	useEffect(() => {
		// Petit délai avant d'afficher le tour
		const timer = setTimeout(() => setIsVisible(true), 500);
		return () => clearTimeout(timer);
	}, []);

	// Utiliser currentStepIndexOverride directement comme source de vérité
	const currentStep =
		currentStepIndexOverride !== undefined ? currentStepIndexOverride : 0;

	// Réinitialiser la position du drag lors d'un changement d'étape
	useEffect(() => {
		const timer = setTimeout(() => setDragPos(null), 0);
		return () => clearTimeout(timer);
	}, [currentStep]);

	// Scroll automatique vers l'élément ciblé avant de désactiver le scroll
	useEffect(() => {
		if (isVisible && currentStep < steps.length) {
			const target = steps[currentStep].target;
			const element = target ? document.querySelector(target) : null;
			if (element) {
				// Cacher temporairement la carte
				const timer1 = setTimeout(() => setCardVisible(false), 0);

				// Déterminer le comportement de scroll selon l'élément
				const is2FASection =
					steps[currentStep].target === "[data-tour='2fa-section']";
				const isSettingsMenu =
					steps[currentStep].target === "[data-tour='settings-menu']";

				// Scroll vers l'élément avant de bloquer le scroll
				element.scrollIntoView({
					behavior: "smooth",
					block: is2FASection || isSettingsMenu ? "end" : "center", // Pour 2FA et settings menu, aligner en bas pour avoir de l'espace au-dessus
					inline: "center",
				});

				// Attendre que le scroll soit terminé avant de bloquer et d'afficher la carte
				const timer2 = setTimeout(() => {
					document.body.style.overflow = "hidden";
					setCardVisible(true);
				}, 600);

				return () => {
					clearTimeout(timer1);
					clearTimeout(timer2);
					document.body.style.overflow = "";
				};
			} else {
				document.body.style.overflow = "hidden";
				const timer = setTimeout(() => setCardVisible(true), 0);
				return () => {
					clearTimeout(timer);
					document.body.style.overflow = "";
				};
			}
		}
	}, [currentStep, isVisible, steps]);

	const handleDragStart = (e) => {
		if (e.type === "mousedown") e.preventDefault();
		const clientX = e.touches ? e.touches[0].clientX : e.clientX;
		const clientY = e.touches ? e.touches[0].clientY : e.clientY;
		const cardRect = cardRef.current?.getBoundingClientRect();
		dragStartRef.current = {
			mouseX: clientX,
			mouseY: clientY,
			cardX: cardRect?.left ?? 0,
			cardY: cardRect?.top ?? 0,
		};
		setIsDragging(true);
	};

	useEffect(() => {
		if (!isDragging) return;
		const handleMove = (e) => {
			const clientX = e.touches ? e.touches[0].clientX : e.clientX;
			const clientY = e.touches ? e.touches[0].clientY : e.clientY;
			const dx = clientX - dragStartRef.current.mouseX;
			const dy = clientY - dragStartRef.current.mouseY;
			const cardW = cardRef.current?.offsetWidth || 400;
			const cardH = cardRef.current?.offsetHeight || 350;
			const minX = -(cardW / 3);
			const maxX = window.innerWidth - (cardW * 2) / 3;
			const minY = -(cardH / 3);
			const maxY = window.innerHeight - (cardH * 2) / 3;
			setDragPos({
				x: Math.max(
					minX,
					Math.min(maxX, dragStartRef.current.cardX + dx),
				),
				y: Math.max(
					minY,
					Math.min(maxY, dragStartRef.current.cardY + dy),
				),
			});
		};
		const handleUp = () => setIsDragging(false);
		window.addEventListener("mousemove", handleMove);
		window.addEventListener("mouseup", handleUp);
		window.addEventListener("touchmove", handleMove, { passive: true });
		window.addEventListener("touchend", handleUp);
		return () => {
			window.removeEventListener("mousemove", handleMove);
			window.removeEventListener("mouseup", handleUp);
			window.removeEventListener("touchmove", handleMove);
			window.removeEventListener("touchend", handleUp);
		};
	}, [isDragging]);

	const handleNext = () => {
		const nextLocalStep = currentStep + 1;
		const currentStepData = steps[currentStep];

		// Si l'étape actuelle a une navigation
		if (currentStepData?.navigateTo && onNavigate) {
			onNavigate(
				currentStepData.navigateTo,
				globalStepIndex !== undefined
					? globalStepIndex + 1
					: nextLocalStep,
			);
		} else if (nextLocalStep < steps.length) {
			// Notifier le parent du changement d'étape
			if (onStepChange) {
				onStepChange(nextLocalStep);
			}
		} else {
			handleComplete();
		}
	};

	const handlePrevious = () => {
		const prevLocalStep = currentStep - 1;
		if (prevLocalStep >= 0 && onStepChange) {
			// Notifier le parent du changement d'étape
			onStepChange(prevLocalStep);
		}
	};

	const handleComplete = () => {
		setIsVisible(false);
		setTimeout(() => onComplete(), 300);
	};

	const handleSkip = () => {
		setIsVisible(false);
		setTimeout(() => onSkip(), 300);
	};

	if (!isVisible || currentStep >= steps.length) return null;

	const step = steps[currentStep];
	const targetElement = step.target
		? document.querySelector(step.target)
		: null;
	const targetRect = targetElement?.getBoundingClientRect();

	// Ne pas afficher la carte pendant le scroll
	if (!cardVisible) return null;

	// Calculer la position optimale de la carte
	let cardTop = "50%";
	let cardLeft = "50%";
	let cardTransform = "translate(-50%, -50%)";

	if (targetRect && targetElement) {
		const cardWidth = Math.min(400, window.innerWidth - 80);
		const estimatedCardHeight = 350; // Hauteur estimée de la carte
		const spacing = 40; // Espacement augmenté pour plus de confort

		// Détecter si on cible la sidebar (aside) ou la section 2FA ou le menu settings
		const isSidebar =
			step.target === "aside" ||
			targetElement?.tagName?.toLowerCase() === "aside";
		const is2FASection = step.target === "[data-tour='2fa-section']";
		const isSettingsMenu = step.target === "[data-tour='settings-menu']";
		const isFolderList = step.target === "[data-tour='folder-list']";

		// Position horizontale centrée sur l'élément, avec contraintes
		let preferredLeft =
			targetRect.left + targetRect.width / 2 - cardWidth / 2;

		// Si c'est la sidebar, positionner la carte à droite de la sidebar
		if (isSidebar) {
			preferredLeft = targetRect.right + spacing;
		}

		cardLeft = `${Math.max(
			spacing,
			Math.min(preferredLeft, window.innerWidth - cardWidth - spacing),
		)}px`;

		// Position verticale : essayer en dessous, sinon au-dessus, sinon centrée
		const spaceBelow = window.innerHeight - targetRect.bottom;
		const spaceAbove = targetRect.top;

		// Si c'est la sidebar, positionner en haut
		if (isSidebar) {
			cardTop = `${Math.max(spacing, targetRect.top)}px`;
			cardTransform = "none";
		} else if (is2FASection || isSettingsMenu || isFolderList) {
			// Pour la section 2FA et le menu settings, positionner la carte au-dessus
			cardTop = `${Math.max(
				spacing,
				targetRect.top - estimatedCardHeight - spacing,
			)}px`;
			cardTransform = "none";
		} else if (spaceBelow >= estimatedCardHeight + spacing) {
			// Assez d'espace en dessous
			cardTop = `${targetRect.bottom + spacing}px`;
			cardTransform = "none";
		} else if (spaceAbove >= estimatedCardHeight + spacing) {
			// Assez d'espace au-dessus
			cardTop = `${Math.max(
				spacing,
				targetRect.top - estimatedCardHeight - spacing,
			)}px`;
			cardTransform = "none";
		} else {
			// Pas assez d'espace, centrer verticalement dans l'espace disponible
			cardTop = `${Math.max(
				spacing,
				Math.min(
					targetRect.bottom + spacing,
					window.innerHeight - estimatedCardHeight - spacing,
				),
			)}px`;
			cardTransform = "none";
		}
	}

	const finalTop = dragPos ? `${dragPos.y}px` : cardTop;
	const finalLeft = dragPos ? `${dragPos.x}px` : cardLeft;
	const finalTransform = dragPos ? "none" : cardTransform;

	return (
		<>
			{/* Mise en évidence de l'élément ciblé */}
			{targetRect && targetElement && (
				<div
					className="fixed z-100 pointer-events-none transition-all duration-500"
					style={{
						top: `${targetRect.top - 8}px`,
						left: `${targetRect.left - 8}px`,
						width: `${targetRect.width + 16}px`,
						height: `${targetRect.height + 16}px`,
					}}
				>
					{/* Contour lumineux animé */}
					<div
						className="w-full h-full rounded-xl"
						style={{
							boxShadow:
								"0 0 0 3px rgba(20, 184, 166, 0.8), 0 0 20px rgba(20, 184, 166, 0.6), 0 0 40px rgba(20, 184, 166, 0.4)",
							animation:
								"pulse-highlight 2s ease-in-out infinite",
							border: "3px solid rgba(20, 184, 166, 0.9)",
						}}
					/>
				</div>
			)}

			{/* Carte d'information */}
			<div
				ref={cardRef}
				className={`fixed z-101 ${isDragging ? "" : "transition-all duration-500"} ${
					isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
				}`}
				style={{
					top: finalTop,
					left: finalLeft,
					transform: finalTransform,
					maxWidth: "400px",
					width: "calc(100% - 80px)",
					maxHeight: "calc(100vh - 80px)",
					overflowY: "auto",
				}}
			>
				<div className="bg-white rounded-2xl shadow-2xl border-2 border-teal-500 overflow-hidden">
					{/* En-tête */}
					<div
						className={`bg-linear-to-r from-teal-500 to-cyan-600 p-4 sm:p-6 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
						onMouseDown={handleDragStart}
						onTouchStart={handleDragStart}
					>
						<div className="flex justify-center mb-1 opacity-60">
							<GripHorizontal className="w-5 h-5 text-white" />
						</div>
						<div className="flex items-start justify-between mb-2">
							<div className="flex items-center gap-2">
								<div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-teal-600 font-bold text-sm">
									{currentStep + 1}
								</div>
								<span className="text-white text-sm font-medium">
									{t("onboarding.stepLabel")}{" "}
									{globalStepIndex !== undefined
										? globalStepIndex + 1
										: currentStep + 1}{" "}
									{t("onboarding.stepOf")}{" "}
									{totalSteps || steps.length}
								</span>
							</div>
							<button
								onClick={handleSkip}
								className="text-white hover:text-gray-200 transition-colors cursor-pointer"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
						<h3 className="text-xl sm:text-2xl font-bold text-white">
							{t(step.titleKey)}
						</h3>
					</div>

					{/* Contenu */}
					<div className="p-4 sm:p-6">
						<p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-6">
							{t(step.descKey)}
						</p>
						{/* Barre de progression */}
						<div className="mb-6">
							<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
								<div
									className="h-full bg-linear-to-r from-teal-500 to-cyan-600 transition-all duration-500"
									style={{
										width: `${
											((globalStepIndex !== undefined
												? globalStepIndex + 1
												: currentStep + 1) /
												(totalSteps || steps.length)) *
											100
										}%`,
									}}
								/>
							</div>
						</div>

						{/* Boutons de navigation */}
						<div className="flex gap-3">
							{currentStep > 0 && (
								<Button
									onClick={handlePrevious}
									variant="ghost"
									className="flex-1 flex items-center justify-center gap-2 text-sm sm:text-base"
								>
									<ArrowLeft className="w-4 h-4" />
									{t("onboarding.previousBtn")}
								</Button>
							)}
							<Button
								onClick={handleNext}
								className="flex-1 bg-linear-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white flex items-center justify-center gap-2 text-sm sm:text-base"
							>
								{(
									globalStepIndex !== undefined
										? globalStepIndex < totalSteps - 1
										: currentStep < steps.length - 1
								) ? (
									<>
										{t("tutorial.nextBtn")}
										<ArrowRight className="w-4 h-4" />
									</>
								) : (
									<>
										{t("tutorial.finishBtn")}
										<Check className="w-4 h-4" />
									</>
								)}
							</Button>
						</div>

						{/* Lien pour passer le tutoriel */}
						<button
							onClick={handleSkip}
							className="w-full mt-4 text-center text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
						>
							{t("tutorial.skipBtn")}
						</button>
					</div>
				</div>
			</div>
		</>
	);
}
