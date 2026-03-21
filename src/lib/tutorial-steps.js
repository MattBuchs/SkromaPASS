// Toutes les étapes du tutoriel multi-pages
export const tutorialSteps = [
	// Dashboard - Étapes 1-5
	{
		page: "/dashboard",
		target: "[data-tour='stats']",
		titleKey: "tutorial.step1Title",
		descKey: "tutorial.step1Desc",
	},
	{
		page: "/dashboard",
		target: "[data-tour='add-password']",
		titleKey: "tutorial.step2Title",
		descKey: "tutorial.step2Desc",
	},
	{
		page: "/dashboard",
		target: "[data-tour='search']",
		titleKey: "tutorial.step3Title",
		descKey: "tutorial.step3Desc",
	},
	{
		page: "/dashboard",
		target: "[data-tour='filters']",
		titleKey: "tutorial.step4Title",
		descKey: "tutorial.step4Desc",
	},
	{
		page: "/dashboard",
		target: "aside",
		titleKey: "tutorial.step5Title",
		descKey: "tutorial.step5Desc",
		navigateTo: "/folders",
	},

	// Folders - Étapes 6-8
	{
		page: "/folders",
		target: "[data-tour='folders-intro']",
		titleKey: "tutorial.step6Title",
		descKey: "tutorial.step6Desc",
	},
	{
		page: "/folders",
		target: "[data-tour='create-folder']",
		titleKey: "tutorial.step7Title",
		descKey: "tutorial.step7Desc",
	},
	{
		page: "/folders",
		target: "[data-tour='folder-list']",
		titleKey: "tutorial.step8Title",
		descKey: "tutorial.step8Desc",
		navigateTo: "/settings",
	},

	// Settings - Étapes 9-12
	{
		page: "/settings",
		target: "[data-tour='2fa-section']",
		titleKey: "tutorial.step9Title",
		descKey: "tutorial.step9Desc",
	},
	{
		page: "/settings",
		target: "[data-tour='pin-section']",
		titleKey: "tutorial.step10Title",
		descKey: "tutorial.step10Desc",
	},
	{
		page: "/settings",
		target: "[data-tour='bio-section']",
		titleKey: "tutorial.step11Title",
		descKey: "tutorial.step11Desc",
	},
	{
		page: "/settings",
		target: null,
		titleKey: "tutorial.step12Title",
		descKey: "tutorial.step12Desc",
	},
];
